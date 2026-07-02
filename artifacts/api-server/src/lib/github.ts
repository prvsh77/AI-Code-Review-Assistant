export class GitHubError extends Error {
  constructor(
    message: string,
    public code: "GITHUB_TOKEN_EXPIRED" | "GITHUB_RATE_LIMITED" | "GITHUB_NOT_FOUND" | "GITHUB_API_ERROR" | "NETWORK_ERROR",
    public status?: number
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

async function githubRequest(url: string, token: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/vnd.github.v3+json");
  headers.set("User-Agent", "AI-Code-Review-App");

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new GitHubError("GitHub session has expired or token is invalid.", "GITHUB_TOKEN_EXPIRED", 401);
      }
      if (response.status === 403) {
        const limitRemaining = response.headers.get("x-ratelimit-remaining");
        if (limitRemaining === "0") {
          throw new GitHubError("GitHub API rate limit exceeded.", "GITHUB_RATE_LIMITED", 403);
        }
      }
      if (response.status === 404) {
        throw new GitHubError("GitHub resource not found (it may be private or deleted).", "GITHUB_NOT_FOUND", 404);
      }
      
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {}
      throw new GitHubError(
        `GitHub API returned ${response.status}: ${response.statusText} ${errorBody}`,
        "GITHUB_API_ERROR",
        response.status
      );
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    if (err instanceof GitHubError) throw err;
    throw new GitHubError(`Network failure calling GitHub API: ${err instanceof Error ? err.message : String(err)}`, "NETWORK_ERROR");
  }
}

const IS_MOCK_TOKEN = (token: string) => token === "mock-github-token" || token.startsWith("mock-");

/**
 * Exchange the browser code for a GitHub OAuth access token.
 */
export async function exchangeOAuthCode(code: string, redirectUri?: string): Promise<string> {
  if (code === "mock-code" || code.startsWith("mock-")) {
    return "mock-github-token";
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured in environment variables.");
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.statusText}`);
    }

    const data: any = await response.json();
    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    if (!data.access_token) {
      throw new Error("No access token returned from GitHub OAuth.");
    }

    return data.access_token;
  } catch (err) {
    throw new GitHubError(`GitHub OAuth exchange failed: ${err instanceof Error ? err.message : String(err)}`, "GITHUB_API_ERROR");
  }
}

/**
 * Get authenticated user details
 */
export async function getGitHubUser(token: string): Promise<{
  id: number;
  login: string;
  email: string;
  avatarUrl: string;
  name: string;
  company: string;
}> {
  if (IS_MOCK_TOKEN(token)) {
    return {
      id: 9919,
      login: "mockuser",
      email: "mockuser@example.com",
      avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
      name: "Mock GitHub User",
      company: "MockCorp"
    };
  }

  const profile = await githubRequest("https://api.github.com/user", token);
  
  // If email is private/null, fetch emails list
  let email = profile.email;
  if (!email) {
    try {
      const emails = await githubRequest("https://api.github.com/user/emails", token);
      const primaryEmail = emails.find((e: any) => e.primary && e.verified) || emails.find((e: any) => e.primary) || emails[0];
      if (primaryEmail) {
        email = primaryEmail.email;
      }
    } catch {}
  }

  return {
    id: profile.id,
    login: profile.login,
    email: email || `${profile.login}@users.noreply.github.com`,
    avatarUrl: profile.avatar_url,
    name: profile.name || profile.login,
    company: profile.company || "",
  };
}

/**
 * List user's repositories
 */
export async function listRepositories(token: string, search?: string): Promise<any[]> {
  if (IS_MOCK_TOKEN(token)) {
    const repos = [
      {
        id: 1,
        name: "react-dashboard",
        full_name: "mockuser/react-dashboard",
        language: "TypeScript",
        stargazers_count: 142,
        open_issues_count: 5,
        description: "Premium admin dashboard built with React and TailwindCSS",
        private: false,
        owner: { login: "mockuser" }
      },
      {
        id: 2,
        name: "express-api-boilerplate",
        full_name: "mockuser/express-api-boilerplate",
        language: "JavaScript",
        stargazers_count: 89,
        open_issues_count: 3,
        description: "Production-ready Express.js API boilerplate",
        private: true,
        owner: { login: "mockuser" }
      },
      {
        id: 3,
        name: "python-ai-agent",
        full_name: "mockuser/python-ai-agent",
        language: "Python",
        stargazers_count: 320,
        open_issues_count: 12,
        description: "Multi-agent orchestration library using LangGraph",
        private: false,
        owner: { login: "mockuser" }
      }
    ];

    if (search) {
      const q = search.toLowerCase();
      return repos.filter(
        (r: any) => r.name.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q)
      );
    }
    return repos;
  }

  // Fetch up to 100 repositories, sorted by last updated
  let repos = await githubRequest("https://api.github.com/user/repos?per_page=100&sort=updated", token);
  
  if (search) {
    const q = search.toLowerCase();
    repos = repos.filter(
      (r: any) => r.name.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q)
    );
  }
  
  return repos;
}

/**
 * Get repository details by ID
 */
export async function getRepositoryById(token: string, id: number): Promise<any> {
  if (IS_MOCK_TOKEN(token)) {
    const repos = await listRepositories(token);
    const repo = repos.find(r => r.id === id);
    if (!repo) {
      throw new GitHubError(`Repository with ID ${id} not found in mock data`, "GITHUB_NOT_FOUND", 404);
    }
    return repo;
  }

  return githubRequest(`https://api.github.com/repositories/${id}`, token);
}

/**
 * Get languages of a repository
 */
export async function getRepositoryLanguages(token: string, owner: string, repo: string): Promise<Record<string, number>> {
  if (IS_MOCK_TOKEN(token)) {
    return { "TypeScript": 85000, "CSS": 12000, "HTML": 3000 };
  }

  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/languages`, token);
}

/**
 * Get branches of a repository
 */
export async function getRepositoryBranches(token: string, owner: string, repo: string): Promise<string[]> {
  if (IS_MOCK_TOKEN(token)) {
    return ["main", "develop", "feature/auth-flow"];
  }

  const branches = await githubRequest(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, token);
  return branches.map((b: any) => b.name);
}

/**
 * List pull requests for a repository
 */
export async function listPullRequests(token: string, owner: string, repo: string, status?: string): Promise<any[]> {
  if (IS_MOCK_TOKEN(token)) {
    const pulls = [
      {
        id: 101,
        number: 12,
        title: "feat: integrate OpenAI model options in settings",
        state: "open",
        created_at: "2026-07-02T10:00:00Z",
        merged_at: null,
        user: { login: "mockuser", avatar_url: "https://avatars.githubusercontent.com/u/9919?v=4" },
        changed_files: 2,
        commits: 1,
      },
      {
        id: 102,
        number: 13,
        title: "fix: resolve memory leak in analysis job runner",
        state: "open",
        created_at: "2026-07-01T15:30:00Z",
        merged_at: null,
        user: { login: "john_doe", avatar_url: "https://avatars.githubusercontent.com/u/9920?v=4" },
        changed_files: 1,
        commits: 2,
      },
      {
        id: 103,
        number: 14,
        title: "refactor: simplify user authentication middleware",
        state: "closed",
        created_at: "2026-06-30T09:15:00Z",
        merged_at: "2026-06-30T12:00:00Z",
        user: { login: "mockuser", avatar_url: "https://avatars.githubusercontent.com/u/9919?v=4" },
        changed_files: 3,
        commits: 4,
      }
    ];

    let filtered = pulls;
    if (status === "open") filtered = pulls.filter(p => p.state === "open");
    if (status === "closed") filtered = pulls.filter(p => p.state === "closed" && p.merged_at === null);
    if (status === "merged") filtered = pulls.filter(p => p.merged_at !== null);
    return filtered;
  }

  // GitHub pulls API state defaults to "open". We want to support "open", "closed", or "all".
  let state = "all";
  if (status === "open") state = "open";
  if (status === "closed" || status === "merged") state = "closed";

  const pulls = await githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=50`, token);
  
  // Filter for merged vs closed
  if (status === "merged") {
    return pulls.filter((p: any) => p.merged_at !== null);
  }
  if (status === "closed") {
    return pulls.filter((p: any) => p.merged_at === null);
  }
  
  return pulls;
}

/**
 * Get a single pull request
 */
export async function getPullRequest(token: string, owner: string, repo: string, number: number): Promise<any> {
  if (IS_MOCK_TOKEN(token)) {
    const pulls = await listPullRequests(token, owner, repo);
    const pr = pulls.find(p => p.number === number);
    if (!pr) {
      throw new GitHubError(`PR #${number} not found in mock data`, "GITHUB_NOT_FOUND", 404);
    }
    return {
      ...pr,
      head: { sha: "mocksha1234567890" }
    };
  }

  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, token);
}

/**
 * Get files changed in a pull request
 */
export async function getPullRequestFiles(token: string, owner: string, repo: string, number: number): Promise<any[]> {
  if (IS_MOCK_TOKEN(token)) {
    return [
      {
        filename: "src/middlewares/auth.ts",
        status: "modified",
        additions: 15,
        deletions: 5,
        patch: "@@ -60,8 +60,18 @@\n+    // Added premium security check\n+    if (user.isSuspended) {\n+      return res.status(403).json({ error: 'Suspended' });\n+    }"
      },
      {
        filename: "src/routes/auth.ts",
        status: "modified",
        additions: 8,
        deletions: 2,
        patch: "@@ -20,6 +20,12 @@\n+    // Adjusted login limits\n+    max: 100,"
      }
    ];
  }

  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`, token);
}

/**
 * Get commits in a pull request
 */
export async function getPullRequestCommits(token: string, owner: string, repo: string, number: number): Promise<any[]> {
  if (IS_MOCK_TOKEN(token)) {
    return [
      {
        sha: "mocksha1234567890",
        commit: {
          message: "fix: update middleware validation checks",
          author: { name: "mockuser", date: "2026-07-02T10:00:00Z" }
        }
      }
    ];
  }

  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/commits?per_page=100`, token);
}

/**
 * Get review comments in a pull request
 */
export async function getPullRequestComments(token: string, owner: string, repo: string, number: number): Promise<any[]> {
  if (IS_MOCK_TOKEN(token)) {
    return [];
  }

  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/comments?per_page=100`, token);
}

/**
 * Get checks & statuses for a reference (SHA or branch name)
 */
export async function getRefChecksAndStatuses(
  token: string,
  owner: string,
  repo: string,
  ref: string
): Promise<{ checks: any[]; statuses: any[] }> {
  if (IS_MOCK_TOKEN(token)) {
    return { checks: [], statuses: [] };
  }

  let checks: any[] = [];
  let statuses: any[] = [];

  try {
    const checkRunsResponse = await githubRequest(
      `https://api.github.com/repos/${owner}/${repo}/commits/${ref}/check-runs`,
      token
    );
    checks = checkRunsResponse.check_runs || [];
  } catch {}

  try {
    statuses = await githubRequest(
      `https://api.github.com/repos/${owner}/${repo}/commits/${ref}/statuses`,
      token
    );
  } catch {}

  return { checks, statuses };
}

/**
 * Download a file content from a repository at a specific reference (SHA/branch)
 */
export async function downloadFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string> {
  if (IS_MOCK_TOKEN(token)) {
    if (path.endsWith("auth.ts")) {
      return `import { Request, Response, NextFunction } from "express";
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }
  next();
}`;
    }
    return `// Mock file content for ${path} at ref ${ref}
export function helloWorld() {
  console.log("Hello, World!");
}`;
  }

  const data = await githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${ref}`,
    token
  );
  
  if (data.type !== "file") {
    throw new Error(`Path ${path} is not a file, it is a ${data.type}`);
  }

  if (data.encoding === "base64") {
    return Buffer.from(data.content, "base64").toString("utf8");
  }
  
  return data.content || "";
}
