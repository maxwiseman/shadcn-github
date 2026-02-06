import { IconArrowRight, IconStar } from "@tabler/icons-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DemoRepo } from "@/lib/demo";
import { fetchRepoInfo } from "@/lib/github-rest";

export async function DemoRepoList({ repos }: { repos: DemoRepo[] }) {
	const repoData = await Promise.all(
		repos.map(async (r) => {
			const info = await fetchRepoInfo(r.owner, r.repo);
			return { ...r, info };
		})
	);

	return (
		<div className="flex w-full flex-col gap-2">
			{repoData.map((repo) => (
				<Link
					className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
					href={`/${repo.full_name}` as never}
					key={repo.full_name}
				>
					<Avatar>
						<AvatarImage alt={repo.owner} src={repo.info?.owner.avatar_url} />
						<AvatarFallback>
							{repo.owner.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-1 flex-col">
						<span className="font-medium text-foreground text-sm">
							{repo.full_name}
						</span>
						{repo.info?.description ? (
							<span className="truncate text-muted-foreground text-xs">
								{repo.info.description}
							</span>
						) : null}
					</div>
					{repo.info ? (
						<span className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
							<IconStar className="size-3.5" />
							{formatStars(repo.info.stargazers_count)}
						</span>
					) : null}
					<IconArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
				</Link>
			))}
		</div>
	);
}

function formatStars(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}k`;
	}
	return count.toString();
}
