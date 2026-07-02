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

    let decryptedToken: string;
    try {
      if (!user.githubAccessToken) {
        throw new Error("Missing GitHub token");
      }
      decryptedToken = decrypt(user.githubAccessToken);
    } catch (err) {
      const url = req.originalUrl || req.url || "";
      if (url.includes("/analytics/dashboard")) {
        res.status(200).json({
          githubConnected: false,
          message: "Connect your GitHub account to enable live repository analytics.",
          totalRepositories: 0,
          totalPullRequests: 0,
          filesReviewed: 0,
          overallScore: 0,
          activeReviews: 0,
          reviewsThisWeek: 0,
          issuesFound: 0
        });
        return;
      }
      if (
        url.includes("/analytics/language-breakdown") ||
        url.includes("/repositories") ||
        url.includes("/pull-requests")
      ) {
        res.status(200).json({
          githubConnected: false,
          data: []
        });
        return;
      }

      res.status(200).json({
        githubConnected: false,
        message: "GitHub integration is required for this action.",
        data: []
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

