import { Octokit } from "@octokit/rest";

export interface RepoResponse {
	name: string;
	full_name: string;
	description: string | null;
	homepage: string | null;
	html_url: string;
	private: boolean;
	updated_at: string;
	stargazers_count: number;
	forks_count: number;
	watchers_count: number;
	subscribers_count: number;
	open_issues_count: number;
	license: { name: string } | null;
	owner: {
		login: string;
		avatar_url: string;
		html_url: string;
	};
	default_branch: string;
}

export interface RepoTreeResponse {
	sha: string;
	truncated: boolean;
	tree: Array<{
		path: string;
		type: "blob" | "tree";
		sha: string;
	}>;
}

export interface CommitResponse {
	sha: string;
	commit: {
		message: string;
		author: { name: string; date: string } | null;
	};
	author: { avatar_url: string | null; login: string | null } | null;
}

interface RepoOverview {
	repo: RepoResponse;
	tree: RepoTreeResponse;
	latestCommit: CommitResponse | null;
	openPulls: number;
}

const REVALIDATE_SECONDS = 60;

const createOctokit = () => {
	const token =
		process.env.GITHUB_TOKEN ?? process.env.NEXT_PUBLIC_GITHUB_TOKEN;

	return new Octokit({
		auth: token,
		request: {
			fetch: (url: RequestInfo | URL, options?: RequestInit) =>
				fetch(url, {
					...options,
					next: { revalidate: REVALIDATE_SECONDS },
				}),
		},
	});
};

export const fetchRepoOverview = async (
	owner: string,
	name: string
): Promise<RepoOverview | null> => {
	try {
		const octokit = createOctokit();
		const repo = await octokit.request("GET /repos/{owner}/{repo}", {
			owner,
			repo: name,
		});
		const tree = await octokit.request(
			"GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
			{
				owner,
				repo: name,
				tree_sha: repo.data.default_branch,
				recursive: "1",
			}
		);
		const commits = await octokit.request("GET /repos/{owner}/{repo}/commits", {
			owner,
			repo: name,
			per_page: 1,
		});
		const pulls = await octokit.request("GET /search/issues", {
			q: `repo:${owner}/${name} is:pr is:open`,
			per_page: 1,
		});

		return {
			repo: repo.data as RepoResponse,
			tree: tree.data as RepoTreeResponse,
			latestCommit: (commits.data[0] as CommitResponse | undefined) ?? null,
			openPulls: pulls.data.total_count,
		};
	} catch {
		return null;
	}
};

export const fetchTopLevelCommits = async (
	owner: string,
	repo: string,
	paths: string[]
): Promise<Record<string, CommitResponse | null>> => {
	const octokit = createOctokit();
	const entries = await Promise.all(
		paths.map(async (path) => {
			try {
				const commits = await octokit.request(
					"GET /repos/{owner}/{repo}/commits",
					{
						owner,
						repo,
						path,
						per_page: 1,
					}
				);
				return [
					path,
					(commits.data[0] as CommitResponse | undefined) ?? null,
				] as const;
			} catch {
				return [path, null] as const;
			}
		})
	);

	return Object.fromEntries(entries);
};

export interface IssueResponse {
	number: number;
	title: string;
	state: "open" | "closed";
	created_at: string;
	updated_at: string;
	comments: number;
	body: string | null;
	html_url: string;
	user: {
		login: string;
		avatar_url: string;
	} | null;
	labels: Array<{
		id: number;
		name: string;
		color: string;
		description: string | null;
	}>;
	pull_request?: { url: string } | undefined;
}

export interface IssueCommentResponse {
	id: number;
	body: string;
	created_at: string;
	updated_at: string;
	user: {
		login: string;
		avatar_url: string;
	} | null;
	author_association: string;
}

export interface IssueListResult {
	issues: IssueResponse[];
	totalCount: number;
}

export const fetchIssues = async (
	owner: string,
	repo: string,
	options: {
		page?: number;
		perPage?: number;
		state?: "open" | "closed" | "all";
		query?: string;
	} = {}
): Promise<IssueListResult | null> => {
	const { page = 1, perPage = 25, state = "open", query } = options;
	try {
		const octokit = createOctokit();

		if (query) {
			const stateFilter = state === "all" ? "" : ` is:${state}`;
			const q = `repo:${owner}/${repo} is:issue${stateFilter} ${query}`;
			const result = await octokit.request("GET /search/issues", {
				q,
				per_page: perPage,
				page,
				sort: "created",
				order: "desc",
			});
			return {
				issues: result.data.items as IssueResponse[],
				totalCount: result.data.total_count,
			};
		}

		const result = await octokit.request("GET /repos/{owner}/{repo}/issues", {
			owner,
			repo,
			state,
			per_page: perPage,
			page,
			sort: "created",
			direction: "desc",
		});

		// Filter out pull requests from the issues list
		const issues = (result.data as IssueResponse[]).filter(
			(issue) => !issue.pull_request
		);

		// For total count, use the search API
		const stateFilter = state === "all" ? "" : ` is:${state}`;
		const countResult = await octokit.request("GET /search/issues", {
			q: `repo:${owner}/${repo} is:issue${stateFilter}`,
			per_page: 1,
		});

		return {
			issues,
			totalCount: countResult.data.total_count,
		};
	} catch {
		return null;
	}
};

export const fetchIssue = async (
	owner: string,
	repo: string,
	issueNumber: number
): Promise<IssueResponse | null> => {
	try {
		const octokit = createOctokit();
		const result = await octokit.request(
			"GET /repos/{owner}/{repo}/issues/{issue_number}",
			{
				owner,
				repo,
				issue_number: issueNumber,
			}
		);
		return result.data as IssueResponse;
	} catch {
		return null;
	}
};

export const fetchIssueComments = async (
	owner: string,
	repo: string,
	issueNumber: number
): Promise<IssueCommentResponse[]> => {
	try {
		const octokit = createOctokit();
		const result = await octokit.request(
			"GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
			{
				owner,
				repo,
				issue_number: issueNumber,
				per_page: 100,
			}
		);
		return result.data as IssueCommentResponse[];
	} catch {
		return [];
	}
};

export interface PullRequestResponse {
	number: number;
	title: string;
	state: "open" | "closed";
	merged: boolean;
	merged_at: string | null;
	created_at: string;
	updated_at: string;
	comments: number;
	body: string | null;
	html_url: string;
	head: { ref: string; label: string };
	base: { ref: string; label: string };
	user: {
		login: string;
		avatar_url: string;
	} | null;
	labels: Array<{
		id: number;
		name: string;
		color: string;
		description: string | null;
	}>;
	draft: boolean;
	additions: number;
	deletions: number;
	changed_files: number;
	mergeable_state: string;
	review_comments: number;
}

export interface PullRequestListResult {
	pulls: PullRequestResponse[];
	totalCount: number;
}

export const fetchPullRequests = async (
	owner: string,
	repo: string,
	options: {
		page?: number;
		perPage?: number;
		state?: "open" | "closed" | "all";
		query?: string;
	} = {}
): Promise<PullRequestListResult | null> => {
	const { page = 1, perPage = 25, state = "open", query } = options;
	try {
		const octokit = createOctokit();

		if (query) {
			const stateFilter = state === "all" ? "" : ` is:${state}`;
			const q = `repo:${owner}/${repo} is:pr${stateFilter} ${query}`;
			const result = await octokit.request("GET /search/issues", {
				q,
				per_page: perPage,
				page,
				sort: "created",
				order: "desc",
			});
			return {
				pulls: result.data.items as unknown as PullRequestResponse[],
				totalCount: result.data.total_count,
			};
		}

		const result = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
			owner,
			repo,
			state,
			per_page: perPage,
			page,
			sort: "created",
			direction: "desc",
		});

		const stateFilter = state === "all" ? "" : ` is:${state}`;
		const countResult = await octokit.request("GET /search/issues", {
			q: `repo:${owner}/${repo} is:pr${stateFilter}`,
			per_page: 1,
		});

		return {
			pulls: result.data as unknown as PullRequestResponse[],
			totalCount: countResult.data.total_count,
		};
	} catch {
		return null;
	}
};

export const fetchPullRequest = async (
	owner: string,
	repo: string,
	pullNumber: number
): Promise<PullRequestResponse | null> => {
	try {
		const octokit = createOctokit();
		const result = await octokit.request(
			"GET /repos/{owner}/{repo}/pulls/{pull_number}",
			{
				owner,
				repo,
				pull_number: pullNumber,
			}
		);
		return result.data as unknown as PullRequestResponse;
	} catch {
		return null;
	}
};

export const fetchPullRequestComments = async (
	owner: string,
	repo: string,
	pullNumber: number
): Promise<IssueCommentResponse[]> => {
	try {
		const octokit = createOctokit();
		// PR conversation comments use the issues endpoint
		const result = await octokit.request(
			"GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
			{
				owner,
				repo,
				issue_number: pullNumber,
				per_page: 100,
			}
		);
		return result.data as IssueCommentResponse[];
	} catch {
		return [];
	}
};

export const fetchReadme = async (
	owner: string,
	repo: string
): Promise<string | null> => {
	try {
		const octokit = createOctokit();
		const response = await octokit.request("GET /repos/{owner}/{repo}/readme", {
			owner,
			repo,
			headers: {
				accept: "application/vnd.github.raw+json",
			},
		});

		return typeof response.data === "string" ? response.data : null;
	} catch {
		return null;
	}
};
