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

/**
 * Exchange the browser code for a GitHub OAuth access token.
 */
export async function exchangeOAuthCode(code: string, redirectUri?: string): Promise<string> {
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
  return githubRequest(`https://api.github.com/repositories/${id}`, token);
}

/**
 * Get languages of a repository
 */
export async function getRepositoryLanguages(token: string, owner: string, repo: string): Promise<Record<string, number>> {
  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/languages`, token);
}

/**
 * Get branches of a repository
 */
export async function getRepositoryBranches(token: string, owner: string, repo: string): Promise<string[]> {
  const branches = await githubRequest(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, token);
  return branches.map((b: any) => b.name);
}

/**
 * List pull requests for a repository
 */
export async function listPullRequests(token: string, owner: string, repo: string, status?: string): Promise<any[]> {
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
  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, token);
}

/**
 * Get files changed in a pull request
 */
export async function getPullRequestFiles(token: string, owner: string, repo: string, number: number): Promise<any[]> {
  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`, token);
}

/**
 * Get commits in a pull request
 */
export async function getPullRequestCommits(token: string, owner: string, repo: string, number: number): Promise<any[]> {
  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/commits?per_page=100`, token);
}

/**
 * Get review comments in a pull request
 */
export async function getPullRequestComments(token: string, owner: string, repo: string, number: number): Promise<any[]> {
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
