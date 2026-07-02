import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../lib/auth";
import rateLimit from "express-rate-limit";
import { exchangeOAuthCode, getGitHubUser } from "../lib/github";
import { encrypt } from "../lib/encryption";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

router.post("/auth/register", loginLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  if (!validatePassword(password)) {
    res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
    });
    return;
  }

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existingUser) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const [newUser] = await db
    .insert(usersTable)
    .values({
      name,
      email: email.toLowerCase(),
      githubUsername: null,
      passwordHash: hashedPassword,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces`,
      company: "",
      timezone: "UTC",
    })
    .returning();

  const tokenPayload = { userId: newUser.id, email: newUser.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({
    userId: newUser.id,
    refreshToken,
    expiresAt,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
  });

  res.json({
    token: accessToken,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      githubUsername: newUser.githubUsername,
      avatarUrl: newUser.avatarUrl,
      company: newUser.company,
      timezone: newUser.timezone,
      joinedAt: newUser.joinedAt.toISOString(),
      totalReviews: newUser.totalReviews,
      totalRepositories: newUser.totalRepositories,
    },
  });
});

router.post("/auth/login", loginLimiter, async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + duration);
  await db.insert(sessionsTable).values({
    userId: user.id,
    refreshToken,
    expiresAt,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
  });

  res.json({
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      githubUsername: user.githubUsername,
      avatarUrl: user.avatarUrl,
      company: user.company,
      timezone: user.timezone,
      joinedAt: user.joinedAt.toISOString(),
      totalReviews: user.totalReviews,
      totalRepositories: user.totalRepositories,
    },
  });
});

router.post("/auth/logout", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (refreshToken) {
    await db.delete(sessionsTable).where(eq(sessionsTable.refreshToken, refreshToken));
  }

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ success: true });
});

router.post("/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: "Refresh token required" });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.refreshToken, refreshToken));

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "Session expired or invalid" });
    return;
  }

  const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db
    .update(sessionsTable)
    .set({ refreshToken: newRefreshToken, expiresAt })
    .where(eq(sessionsTable.id, session.id));

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
  });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));

  res.json({
    token: generateAccessToken({ userId: payload.userId, email: payload.email }),
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      githubUsername: user.githubUsername,
      avatarUrl: user.avatarUrl,
      company: user.company,
      timezone: user.timezone,
      joinedAt: user.joinedAt.toISOString(),
      totalReviews: user.totalReviews,
      totalRepositories: user.totalRepositories,
    } : null,
  });
});

router.post("/auth/github", loginLimiter, async (req, res) => {
  const { code, redirectUri } = req.body;

  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  try {
    // 1. Exchange OAuth code for GitHub token
    const githubToken = await exchangeOAuthCode(code, redirectUri);

    // 2. Fetch user profile from GitHub
    const githubUser = await getGitHubUser(githubToken);

    // 3. Encrypt the token securely
    const encryptedToken = encrypt(githubToken);

    // 4. Try to find the user in DB by GitHub ID or email
    let user: typeof usersTable.$inferSelect | undefined;

    if (githubUser.id) {
      const [u] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.githubId, String(githubUser.id)))
        .limit(1);
      user = u;
    }

    if (!user) {
      const [u] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, githubUser.email.toLowerCase()))
        .limit(1);
      user = u;
    }

    if (user) {
      // Update existing user with latest details
      const [updated] = await db
        .update(usersTable)
        .set({
          githubId: String(githubUser.id),
          githubUsername: githubUser.login,
          githubAccessToken: encryptedToken,
          avatarUrl: githubUser.avatarUrl || user.avatarUrl,
          company: githubUser.company || user.company,
          name: githubUser.name || user.name,
        })
        .where(eq(usersTable.id, user.id))
        .returning();
      user = updated;
    } else {
      // Create new user
      const [created] = await db
        .insert(usersTable)
        .values({
          name: githubUser.name,
          email: githubUser.email.toLowerCase(),
          githubId: String(githubUser.id),
          githubUsername: githubUser.login,
          githubAccessToken: encryptedToken,
          avatarUrl: githubUser.avatarUrl,
          company: githubUser.company,
          timezone: "UTC",
          totalReviews: 0,
          totalRepositories: 0,
        })
        .returning();
      user = created;
    }

    // 5. Generate session and response
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({
      userId: user.id,
      refreshToken,
      expiresAt,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
    });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
        avatarUrl: user.avatarUrl,
        company: user.company,
        timezone: user.timezone,
        joinedAt: user.joinedAt.toISOString(),
        totalReviews: user.totalReviews,
        totalRepositories: user.totalRepositories,
      },
    });
  } catch (err) {
    req.log?.error(err, "GitHub auth failure");
    res.status(500).json({
      error: "GitHub authentication failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

router.get("/auth/github/url", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      error: "GITHUB_CLIENT_ID not configured",
    });
  }

  // Public URL of your backend
  const backendUrl =
    process.env.PUBLIC_API_URL ||
    `${req.protocol}://${req.get("host")}`;

  const redirectUri = `${backendUrl}/api/auth/github/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "repo,user");
  url.searchParams.set("redirect_uri", redirectUri);

  res.json({
    url: url.toString(),
  });
});

export default router;
