import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { encrypt } from "../lib/encryption";
import { generateAccessToken, generateRefreshToken, hashPassword } from "../lib/auth";

// Mock env variables before importing app
process.env.DATABASE_URL = "postgresql://localhost:5432/mock";
process.env.JWT_ACCESS_SECRET = "test_access_secret_1234567890_abc";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_1234567890_abc";
process.env.ENCRYPTION_KEY = "test_encryption_key_32_bytes_long_12345";
process.env.AI_SERVICE_URL = "http://localhost:8085";

// Hoist database chains inside a single hoisted container
const container = vi.hoisted(() => {
  const state = {
    dbResult: [] as any[],
    passwordHash: "",
    usersResult: [] as any[] | null,
  };

  const createSelectChain = (fields?: any) => {
    let selectTable: any = null;
    const chain: any = {
      from: vi.fn().mockImplementation((table) => {
        selectTable = table;
        return chain;
      }),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((resolve) => {
        if (selectTable && selectTable.tableName === "users") {
          if (state.usersResult !== null) {
            return resolve(state.usersResult);
          }
          const encryptedToken = encrypt("dummy-github-token");
          return resolve([
            {
              id: 1,
              name: "Alice",
              email: "alice@example.com",
              passwordHash: state.passwordHash,
              githubAccessToken: encryptedToken,
              githubUsername: "alice",
              avatarUrl: "http://example.com/avatar.jpg",
              company: "AliceCorp",
              timezone: "UTC",
              joinedAt: new Date(),
              totalReviews: 2,
              totalRepositories: 1,
            }
          ]);
        }
        if (fields && typeof fields === "object" && fields.count) {
          return resolve([{ count: state.dbResult.length }]);
        }
        return resolve(state.dbResult);
      }),
    };
    return chain;
  };

  const createInsertChain = () => {
    const chain: any = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockImplementation((resolve) => {
        if (typeof resolve === "function") return resolve(state.dbResult);
        return chain;
      }),
      then: vi.fn().mockImplementation((resolve) => resolve(state.dbResult)),
    };
    return chain;
  };

  const createUpdateChain = () => {
    const chain: any = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockImplementation((resolve) => {
        if (typeof resolve === "function") return resolve(state.dbResult);
        return chain;
      }),
      then: vi.fn().mockImplementation((resolve) => resolve(state.dbResult)),
    };
    return chain;
  };

  return {
    chains: {
      createSelectChain,
      createInsertChain,
      createUpdateChain
    },
    testState: state
  };
});

// Mock @workspace/db
vi.mock("@workspace/db", () => {
  const dummyTable = (name: string) => ({
    tableName: name,
    id: "id",
    email: "email",
    passwordHash: "passwordHash",
    githubId: "githubId",
    githubUsername: "githubUsername",
    githubAccessToken: "githubAccessToken",
    userId: "userId",
    refreshToken: "refreshToken",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    fullName: "fullName",
    owner: "owner",
    private: "private",
    pullRequestId: "pullRequestId",
    reviewedAt: {
      toISOString: () => "2026-07-02T00:00:00.000Z"
    },
    qualityScore: "qualityScore",
    securityScore: "securityScore",
    complexityScore: "complexityScore",
    documentationScore: "documentationScore",
    status: "status",
    aiSummary: "aiSummary",
    topIssues: "topIssues",
    modelUsed: "modelUsed",
    inputTokens: "inputTokens",
    outputTokens: "outputTokens",
    cost: "cost",
    agentOutputs: "agentOutputs",
    promptTemplates: "promptTemplates",
    latencyMs: "latencyMs"
  });

  return {
    db: {
      select: vi.fn().mockImplementation((fields) => container.chains.createSelectChain(fields)),
      insert: vi.fn().mockImplementation(() => container.chains.createInsertChain()),
      update: vi.fn().mockImplementation(() => container.chains.createUpdateChain()),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => resolve([])),
      }),
    },
    usersTable: dummyTable("users"),
    sessionsTable: dummyTable("sessions"),
    repositoriesTable: dummyTable("repositories"),
    pullRequestsTable: dummyTable("pull_requests"),
    reviewsTable: dummyTable("reviews"),
    reviewFilesTable: dummyTable("review_files"),
    reviewCommentsTable: dummyTable("review_comments"),
    securityIssuesTable: dummyTable("security_issues"),
    activityItemsTable: dummyTable("activity_items"),
  };
});

// Mock github API helper statically
vi.mock("../lib/github", () => {
  return {
    getRepositoryById: vi.fn(),
    listRepositories: vi.fn(),
    exchangeOAuthCode: vi.fn(),
    getGitHubUser: vi.fn(),
    listPullRequests: vi.fn(),
  };
});

// Define app variable to be imported dynamically
let appInstance: any = null;

describe("API Routing Integration Tests", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    container.testState.dbResult = [];
    container.testState.passwordHash = await hashPassword("Password123");
    container.testState.usersResult = null;

    // Dynamically import app & github helpers to resolve TDZ issues
    if (!appInstance) {
      appInstance = (await import("../app")).default;
    }
    const github = await import("../lib/github");

    vi.mocked(github.getRepositoryById).mockResolvedValue({
      id: 10,
      name: "repo-1",
      owner: { login: "alice" },
      stargazers_count: 5,
      open_issues_count: 2,
      description: "My test repo",
      private: false
    } as any);

    vi.mocked(github.listRepositories).mockResolvedValue([
      { id: 1, name: "repo-1", fullName: "user/repo-1", language: "TypeScript" }
    ] as any);

    vi.mocked(github.listPullRequests).mockResolvedValue([] as any);

    // Stub global fetch dynamically
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/models")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          text: () => Promise.resolve(JSON.stringify(["gpt-4o", "gpt-4o-mini"])),
        } as any);
      }
      if (url.includes("/search/issues")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve({ total_count: 5 }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/event-stream" }),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode("data: message chunk") })
              .mockResolvedValueOnce({ done: true, value: undefined }),
          }),
        },
      } as any);
    }) as any;
  });

  // 1. Auth Endpoint Tests
  describe("Auth Endpoints", () => {
    it("should return 400 for empty registration payload", async () => {
      const res = await request(appInstance)
        .post("/api/auth/register")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields");
    });

    it("should fail validation on invalid email or password", async () => {
      const res = await request(appInstance)
        .post("/api/auth/register")
        .send({ name: "Alice", email: "invalid-email", password: "123" });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("email");
    });

    it("should return 401 on login failure", async () => {
      container.testState.passwordHash = "invalid-hash";
      const res = await request(appInstance)
        .post("/api/auth/login")
        .send({ email: "alice@example.com", password: "Password123" });
      expect(res.status).toBe(401);
    });

    it("should succeed login and register endpoints", async () => {
      const res = await request(appInstance)
        .post("/api/auth/login")
        .send({ email: "alice@example.com", password: "Password123" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should handle refresh token route", async () => {
      const token = generateRefreshToken({ userId: 1, email: "alice@example.com" });
      container.testState.dbResult = [{ id: 1, userId: 1, refreshToken: token, expiresAt: new Date(Date.now() + 1000 * 60) }];

      const res = await request(appInstance)
        .post("/api/auth/refresh")
        .set("Cookie", [`refresh_token=${token}`]);
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should return 401 for invalid or expired refresh token", async () => {
      const res = await request(appInstance)
        .post("/api/auth/refresh")
        .send({ refreshToken: "expired-token" });
      expect(res.status).toBe(401);
    });

    it("should handle logout route", async () => {
      const res = await request(appInstance).post("/api/auth/logout");
      expect(res.status).toBe(200);
    });
  });

  // 2. Repositories Endpoints (Authenticated)
  describe("Repositories Endpoints", () => {
    it("should return 401 when calling repos without authorization", async () => {
      const res = await request(appInstance).get("/api/repositories");
      expect(res.status).toBe(401);
    });

    it("should return repos list when authorized", async () => {
      container.testState.dbResult = []; 
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/repositories")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return repository detail", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const res = await request(appInstance)
        .get("/api/repositories/10")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("repo-1");
    });

    it("should return 400 for invalid repository ID", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const res = await request(appInstance)
        .get("/api/repositories/invalid-id")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it("should return 401 when GitHub token is expired during repositories list", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const err = new Error("Token expired") as any;
      err.code = "GITHUB_TOKEN_EXPIRED";
      const github = await import("../lib/github");
      vi.mocked(github.listRepositories).mockRejectedValue(err);

      const res = await request(appInstance)
        .get("/api/repositories")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("github_token_expired");
    });

    it("should return 401 when GitHub token is expired during repository details", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const err = new Error("Token expired") as any;
      err.code = "GITHUB_TOKEN_EXPIRED";
      const github = await import("../lib/github");
      vi.mocked(github.getRepositoryById).mockRejectedValue(err);

      const res = await request(appInstance)
        .get("/api/repositories/10")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("github_token_expired");
    });
  });

  // 3. Review Endpoints
  describe("Review Endpoints", () => {
    it("should return 404 for non-existent review detail", async () => {
      container.testState.dbResult = [];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/reviews/999")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it("should return review details when found", async () => {
      container.testState.dbResult = [{
        id: 10,
        pullRequestId: 100,
        pullRequestNumber: 2,
        repositoryName: "test-repo",
        author: "author",
        qualityScore: "85",
        securityScore: "90",
        complexityScore: "80",
        documentationScore: "88",
        status: "completed",
        reviewedAt: new Date(),
        aiSummary: "Review summary",
        topIssues: "[]",
      }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/reviews/10")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(10);
      expect(res.body.qualityScore).toBe(85);
    });

    it("should return 400 for invalid review ID format", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      
      const res = await request(appInstance)
        .get("/api/reviews/invalid-id")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(400);

      const resFiles = await request(appInstance)
        .get("/api/reviews/invalid-id/files")
        .set("Authorization", `Bearer ${token}`);
      expect(resFiles.status).toBe(400);

      const resComments = await request(appInstance)
        .get("/api/reviews/invalid-id/comments")
        .set("Authorization", `Bearer ${token}`);
      expect(resComments.status).toBe(400);
    });

    it("should list all reviews", async () => {
      container.testState.dbResult = [{
        id: 10,
        pullRequestId: 100,
        pullRequestNumber: 2,
        repositoryName: "test-repo",
        author: "author",
        qualityScore: "85",
        securityScore: "90",
        complexityScore: "80",
        documentationScore: "88",
        status: "completed",
        reviewedAt: new Date(),
        aiSummary: "Review summary",
        topIssues: "[]",
      }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/reviews")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it("should list review history", async () => {
      container.testState.dbResult = [{
        id: 10,
        pullRequestNumber: 2,
        repositoryName: "test-repo",
        qualityScore: "85",
        status: "completed",
        reviewedAt: new Date(),
        author: "author"
      }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/reviews/history")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it("should get review files list", async () => {
      container.testState.dbResult = [{ id: 1, reviewId: 10, filePath: "src/app.ts", additions: 1, deletions: 1, status: "modified" }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/reviews/10/files")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it("should get review comments list", async () => {
      container.testState.dbResult = [{ id: 1, reviewId: 10, filePath: "src/app.ts", line: 1, type: "style", severity: "medium", message: "fix" }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/reviews/10/comments")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  // 4. Analytics Endpoints
  describe("Analytics Endpoints", () => {
    it("should return correct formatted dashboard stats", async () => {
      container.testState.dbResult = [
        { qualityScore: "80", status: "completed", topIssues: "[]", reviewedAt: new Date() },
        { qualityScore: "90", status: "completed", topIssues: "[]", reviewedAt: new Date() },
      ];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.overallScore).toBe(85);
      expect(res.body.totalPullRequests).toBe(5);
    });

    it("should handle error gracefully on dashboard stats network failure", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const github = await import("../lib/github");
      vi.mocked(github.listRepositories).mockRejectedValue(new Error("GitHub fail"));

      const res = await request(appInstance)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(500);
    });

    it("should return quality trend mapping", async () => {
      container.testState.dbResult = [{ qualityScore: "85", securityScore: "80", reviewedAt: new Date() }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/analytics/quality-trend")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // 5. Security Endpoints
  describe("Security Endpoints", () => {
    it("should fetch security issues", async () => {
      container.testState.dbResult = [{ id: 1, status: "open", severity: "high" }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/security/issues")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it("should fetch security summary", async () => {
      container.testState.dbResult = [{ id: 1, severity: "high" }, { id: 2, severity: "medium" }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/security/summary")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
    });
  });

  // 6. User Profiles Endpoints
  describe("User Endpoints", () => {
    it("should return user details", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it("should return fallback John Doe profile when no user in database", async () => {
      container.testState.usersResult = [];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("John Doe");
    });

    it("should return user activity items", async () => {
      container.testState.dbResult = [{ id: 1, type: "review_completed", description: "completed", createdAt: new Date() }];
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/user/activity")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  // 7. Health check Endpoint
  describe("Health Check", () => {
    it("should return ok status", async () => {
      const res = await request(appInstance).get("/api/healthz");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  // 8. AI Proxy Endpoint
  describe("AI Proxy", () => {
    it("should return models list", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .get("/api/ai/models")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toContain("gpt-4o");
    });

    it("should proxy streams via chat POST proxy", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });

      const res = await request(appInstance)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "test prompt" });
      expect(res.status).toBe(200);
    });

    it("should handle error on AI proxy connection failure", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      global.fetch = vi.fn().mockRejectedValue(new Error("AI Service Offline"));

      const res = await request(appInstance)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "test prompt" });
      expect(res.status).toBe(502);
      expect(res.body.error).toBe("AI service unavailable");
    });

    it("should return 502 when event-stream has no response body", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/event-stream" }),
        body: null
      } as any);

      const res = await request(appInstance)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "test prompt" });
      expect(res.status).toBe(502);
    });
  });

  // 9. Pull Requests trigger endpoints
  describe("Pull Requests trigger Endpoints", () => {
    it("should fetch pull requests list", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const res = await request(appInstance)
        .get("/api/pull-requests?repositoryId=10")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  // 10. Additional Coverage Scenarios
  describe("Additional Coverage Scenarios", () => {
    it("should cover repository filtering and reviewedAt formatting", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      container.testState.dbResult = [{
        id: 10,
        pullRequestId: 100,
        pullRequestNumber: 2,
        repositoryName: "repo-1",
        author: "author",
        qualityScore: "85",
        status: "completed",
        reviewedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
      }];

      const res = await request(appInstance)
        .get("/api/repositories?language=TypeScript")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it("should handle other repository list and details errors", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const github = await import("../lib/github");
      
      vi.mocked(github.listRepositories).mockRejectedValueOnce(new Error("custom list error"));
      const resList = await request(appInstance)
        .get("/api/repositories")
        .set("Authorization", `Bearer ${token}`);
      expect(resList.status).toBe(500);

      vi.mocked(github.getRepositoryById).mockRejectedValueOnce(new Error("custom detail error"));
      const resDetail = await request(appInstance)
        .get("/api/repositories/10")
        .set("Authorization", `Bearer ${token}`);
      expect(resDetail.status).toBe(500);
    });

    it("should fetch language breakdown", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const res = await request(appInstance)
        .get("/api/analytics/language-breakdown")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should handle error on language breakdown failure", async () => {
      const token = generateAccessToken({ userId: 1, email: "alice@example.com" });
      const github = await import("../lib/github");
      vi.mocked(github.listRepositories).mockRejectedValueOnce(new Error("list failure"));

      const res = await request(appInstance)
        .get("/api/analytics/language-breakdown")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(500);
    });
  });
});
