import { db } from "./index";
import { usersTable, repositoriesTable, pullRequestsTable, reviewsTable, reviewFilesTable, reviewCommentsTable, securityIssuesTable, activityItemsTable } from "./schema";

async function main() {
  console.log("Seeding database...");
  
  // Clean all tables
  await db.delete(activityItemsTable);
  await db.delete(securityIssuesTable);
  await db.delete(reviewCommentsTable);
  await db.delete(reviewFilesTable);
  await db.delete(reviewsTable);
  await db.delete(pullRequestsTable);
  await db.delete(repositoriesTable);
  await db.delete(usersTable);

  const [user] = await db.insert(usersTable).values({
    name: "John Doe",
    email: "john@example.com",
    githubUsername: "johndoe",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    company: "Acme Inc.",
    timezone: "UTC-5 (Eastern Time, US & Canada)",
    totalReviews: 156,
    totalRepositories: 12,
    passwordHash: "$2a$10$tQ1Y2X5tB5.vYtF2vTf2e.U9ZzQ7Uu/j8B/LlhKq72aP594Qh5kGu",
  }).returning();

  // Create repositories
  const repos = await db.insert(repositoriesTable).values([
    {
      name: "payment-service",
      fullName: "johndoe/payment-service",
      language: "TypeScript",
      stars: 42,
      openPrs: 3,
      lastReviewedAt: "2h ago",
      reviewScore: "92",
      description: "Stripe payment service with retry queues and webhook routing.",
      isPrivate: true,
    },
    {
      name: "auth-gateway",
      fullName: "johndoe/auth-gateway",
      language: "Go",
      stars: 128,
      openPrs: 1,
      lastReviewedAt: "1d ago",
      reviewScore: "88",
      description: "High performance authentication service using JWT tokens.",
      isPrivate: false,
    },
    {
      name: "frontend-core",
      fullName: "johndoe/frontend-core",
      language: "JavaScript",
      stars: 520,
      openPrs: 5,
      lastReviewedAt: "3d ago",
      reviewScore: "76",
      description: "Vite + React dashboard template.",
      isPrivate: false,
    },
    {
      name: "data-pipeline",
      fullName: "johndoe/data-pipeline",
      language: "Python",
      stars: 84,
      openPrs: 2,
      lastReviewedAt: "5d ago",
      reviewScore: "85",
      description: "PySpark ETL jobs for processing analytics.",
      isPrivate: true,
    },
    {
      name: "mobile-app",
      fullName: "johndoe/mobile-app",
      language: "Rust",
      stars: 15,
      openPrs: 0,
      lastReviewedAt: "1w ago",
      reviewScore: "80",
      description: "React Native engine in Rust.",
      isPrivate: false,
    },
  ]).returning();

  // Create Pull Requests
  const prs = await db.insert(pullRequestsTable).values([
    {
      number: 101,
      title: "Implement Stripe payment retry webhook",
      author: "John Doe",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      repositoryId: repos[0].id,
      repositoryName: repos[0].name,
      filesChanged: 3,
      commits: 2,
      status: "open",
      reviewStatus: "completed",
    },
    {
      number: 102,
      title: "Add standard JWT signature verification middleware",
      author: "Alice Smith",
      authorAvatar: null,
      repositoryId: repos[1].id,
      repositoryName: repos[1].name,
      filesChanged: 1,
      commits: 1,
      status: "open",
      reviewStatus: "completed",
    },
    {
      number: 103,
      title: "Fix frontend charting library bundle size issue",
      author: "Bob Jones",
      authorAvatar: null,
      repositoryId: repos[2].id,
      repositoryName: repos[2].name,
      filesChanged: 12,
      commits: 4,
      status: "open",
      reviewStatus: "pending",
    },
  ]).returning();

  // Create Reviews
  const reviews = await db.insert(reviewsTable).values([
    {
      pullRequestId: prs[0].id,
      pullRequestNumber: prs[0].number,
      repositoryName: prs[0].repositoryName,
      author: prs[0].author,
      authorAvatar: prs[0].authorAvatar,
      qualityScore: "85",
      securityScore: "80",
      complexityScore: "70",
      documentationScore: "90",
      status: "completed",
      aiSummary: "The review shows strong implementation of payment webhooks but identified a potential SQL injection vulnerability in user queries and missing exponential backoff jitter on payment retries.",
      topIssues: JSON.stringify([
        { severity: "critical", type: "SQL Injection", filePath: "src/api/webhooks.ts", line: 42, description: "Direct concatenation of request input into database query." },
        { severity: "high", type: "Missing Backoff Jitter", filePath: "src/utils/retry.ts", line: 18, description: "Thundering herd risk due to lack of exponential backoff jitter." },
      ]),
    },
    {
      pullRequestId: prs[1].id,
      pullRequestNumber: prs[1].number,
      repositoryName: prs[1].repositoryName,
      author: prs[1].author,
      authorAvatar: prs[1].authorAvatar,
      qualityScore: "92",
      securityScore: "95",
      complexityScore: "90",
      documentationScore: "88",
      status: "completed",
      aiSummary: "Auth middleware logic is very clean. Only minor suggestions on documentation.",
      topIssues: JSON.stringify([]),
    }
  ]).returning();

  // Create Review Files
  const reviewFiles = await db.insert(reviewFilesTable).values([
    {
      reviewId: reviews[0].id,
      filePath: "src/api/webhooks.ts",
      additions: 120,
      deletions: 45,
      status: "modified",
    },
    {
      reviewId: reviews[0].id,
      filePath: "src/utils/retry.ts",
      additions: 25,
      deletions: 5,
      status: "modified",
    },
    {
      reviewId: reviews[0].id,
      filePath: "package.json",
      additions: 3,
      deletions: 1,
      status: "modified",
    },
  ]).returning();

  // Create Review Comments
  await db.insert(reviewCommentsTable).values([
    {
      reviewId: reviews[0].id,
      filePath: "src/api/webhooks.ts",
      line: 42,
      type: "bug",
      severity: "critical",
      message: "Direct database insert string concatenation is vulnerable to SQL injection.",
      suggestion: "Use parameterized queries or Drizzle ORM syntax to escape variables.",
      codeSnippet: "const query = `INSERT INTO webhooks (stripe_id) VALUES ('${req.body.id}')`;",
    },
    {
      reviewId: reviews[0].id,
      filePath: "src/utils/retry.ts",
      line: 18,
      type: "issue",
      severity: "high",
      message: "Thundering herd risk due to fixed retry delay.",
      suggestion: "Add randomized jitter factor to sleep interval.",
      codeSnippet: "setTimeout(retry, delay);",
    },
  ]);

  // Create Security Issues
  await db.insert(securityIssuesTable).values([
    {
      type: "SQL Injection Risk",
      filePath: "src/api/webhooks.ts",
      line: 42,
      severity: "critical",
      description: "Direct string query concatenation inside raw database execution.",
      fix: "Use parameterized queries or Drizzle ORM.",
      status: "open",
      repositoryId: repos[0].id,
    },
    {
      type: "Weak Cryptographic Signature",
      filePath: "src/utils/crypto.ts",
      line: 10,
      severity: "high",
      description: "Using MD5 hash function for security checksums.",
      fix: "Use SHA-256 instead.",
      status: "open",
      repositoryId: repos[1].id,
    },
  ]);

  // Create Activity Items
  await db.insert(activityItemsTable).values([
    {
      userId: user.id,
      type: "review_completed",
      description: "AI review completed for PR #101 'Implement Stripe payment retry webhook' with score 85/100",
      repositoryName: "payment-service",
    },
    {
      userId: user.id,
      type: "pr_analyzed",
      description: "Alice Smith triggered an AI review for PR #102 'Add standard JWT middleware'",
      repositoryName: "auth-gateway",
    },
    {
      userId: user.id,
      type: "security_found",
      description: "Critical SQL Injection risk detected in webhooks route",
      repositoryName: "payment-service",
    },
  ]);

  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Database seed failed:", err);
  process.exit(1);
});
