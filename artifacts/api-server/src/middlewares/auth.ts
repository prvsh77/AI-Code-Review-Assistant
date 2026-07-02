import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "../lib/auth";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { decrypt } from "../lib/encryption";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
  githubToken?: string;
  dbUser?: typeof usersTable.$inferSelect;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired access token" });
    return;
  }

  (req as any).user = payload;
  next();
}

export async function requireGitHubToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (!user.githubAccessToken) {
      res.status(401).json({ 
        error: "github_token_missing", 
        message: "No GitHub account connected. Please login/re-authenticate with GitHub." 
      });
      return;
    }

    let decryptedToken: string;
    try {
      decryptedToken = decrypt(user.githubAccessToken);
    } catch (err) {
      res.status(401).json({ 
        error: "github_token_invalid", 
        message: "Your GitHub connection is corrupted. Please reconnect your account." 
      });
      return;
    }

    req.githubToken = decryptedToken;
    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

