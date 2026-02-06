import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getDemoRepos, isDemoMode } from "@/lib/demo";
import { fetchRepoOverview } from "@/lib/github-rest";
import { RepoAbout } from "./about";
import { RepoFileTree } from "./file-tree";
import { RepoPreview } from "./preview";

export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
	const demoRepos = getDemoRepos();
	if (isDemoMode()) {
		return demoRepos.map((r) => ({ username: r.owner, repo: r.repo }));
	}

	const list = await fetch(
		"https://github.com/EvanLi/Github-Ranking/raw/refs/heads/master/Top100/JavaScript.md"
	);
	const text = await list.text();
	const lines = text.split("\n").slice(1);

	const params = lines
		.map((line) => {
			const match = line.match(
				// biome-ignore lint/performance/useTopLevelRegex: This is just for static generation
				/\[([^\]]+)\]\(https:\/\/github\.com\/([^/]+)\/([^)]+)\)/
			);
			if (match) {
				const username = match[2];
				const repo = match[3];
				return { username, repo };
			}
			return null;
		})
		.filter(
			(param): param is { username: string; repo: string } => param !== null
		);

	return params;
}

export default async function Home({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string }>;
}) {
	const params = await paramsPromise;
	const repoData = await fetchRepoOverview(params.username, params.repo);
	if (!repoData) {
		notFound();
	}
	const { repo, latestCommit, tree } = repoData;

	return (
		<>
			<div className="flex justify-between py-6">
				<h1 className="font-bold text-3xl">{repo.name}</h1>
				<div className="flex gap-2">
					<Button size="sm" variant="outline">
						Watch
					</Button>
					<Button size="sm" variant="outline">
						Fork
					</Button>
					<Button size="sm" variant="outline">
						Star
					</Button>
				</div>
			</div>
			<Separator />
			<div className="flex w-full flex-nowrap gap-6 py-6">
				<div className="flex grow flex-col gap-6">
					<RepoFileTree currentCommit={latestCommit} repo={repo} tree={tree} />
					<RepoPreview repo={repo} />
				</div>
				<RepoAbout repo={repo} />
			</div>
		</>
	);
}
