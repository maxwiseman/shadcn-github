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

type RepoOverview = {
	repo: RepoResponse;
	tree: RepoTreeResponse;
	latestCommit: CommitResponse | null;
	openPulls: number;
};

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
