/**
 * Demo mode restricts the app to a predefined set of repositories
 * to avoid hitting GitHub API rate limits with a shared API key.
 *
 * Set DEMO_REPOS as a comma-separated list of "owner/repo" strings, e.g.:
 *   DEMO_REPOS="vercel/next.js,facebook/react,shadcn-ui/ui"
 */

export interface DemoRepo {
	owner: string;
	repo: string;
	full_name: string;
}

function parseDemoRepos(): DemoRepo[] {
	const raw = process.env.DEMO_REPOS;
	if (!raw?.trim()) {
		return [];
	}

	return raw
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			const [owner, repo] = entry.split("/");
			if (!(owner && repo)) {
				return null;
			}
			return { owner, repo, full_name: `${owner}/${repo}` };
		})
		.filter((entry): entry is DemoRepo => entry !== null);
}

let cached: DemoRepo[] | undefined;

export function getDemoRepos(): DemoRepo[] {
	if (cached === undefined) {
		cached = parseDemoRepos();
	}
	return cached;
}

export function isDemoMode(): boolean {
	return getDemoRepos().length > 0;
}

export function isRepoAllowed(owner: string, repo: string): boolean {
	if (!isDemoMode()) {
		return true;
	}
	const fullName = `${owner}/${repo}`.toLowerCase();
	return getDemoRepos().some((r) => r.full_name.toLowerCase() === fullName);
}
