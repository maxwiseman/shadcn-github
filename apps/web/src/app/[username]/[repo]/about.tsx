import {
	type Icon,
	IconEye,
	IconFlag,
	IconGitFork,
	IconLicense,
	IconLink,
	IconStar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { RepoResponse } from "@/lib/github-rest";

export function RepoAbout({ repo }: { repo: RepoResponse }) {
	return (
		<div className="flex w-full flex-col gap-4 md:w-3xs md:shrink-0">
			<h2 className="font-semibold text-xl">About</h2>
			{repo.description && (
				<p className="text-muted-foreground">{repo.description}</p>
			)}
			{repo.homepage && (
				<a
					className="flex items-center gap-1 font-medium text-blue-500 hover:underline"
					href={repo.homepage}
					target="_blank"
				>
					<IconLink className="relative top-px size-5" />
					<span className="line-clamp-1">
						{repo.homepage.replace("https://", "")}
					</span>
				</a>
			)}
			<div className="flex flex-col gap-2">
				<AboutIconItem
					icon={IconLicense}
					label={
						repo.license?.name.replace("License", "license") ?? "No license"
					}
				/>
				<AboutIconItem
					icon={IconStar}
					label={"stars"}
					stat={repo.stargazers_count}
				/>
				<AboutIconItem
					icon={IconEye}
					label={"watching"}
					stat={repo.watchers_count}
				/>
				<AboutIconItem
					icon={IconGitFork}
					label={"forks"}
					stat={repo.forks_count}
				/>
			</div>
			<Button className={"w-max"} size="sm" variant="outline">
				<IconFlag /> Report
			</Button>
			<Separator className={"my-2"} />
			<h2 className="flex items-center gap-2 font-semibold text-xl">
				Releases{" "}
				<div className="inline-block rounded-full border bg-card px-1.25 py-0.75 font-mono font-normal text-muted-foreground text-xs">
					150
				</div>
			</h2>
			<div className="flex flex-col gap-3">
				<div>
					<div className="font-semibold">GitHub CLI 2.39.2</div>
					<div className="text-muted-foreground text-sm">last week</div>
				</div>
				<div>
					<div className="font-semibold">GitHub CLI 2.39.1</div>
					<div className="text-muted-foreground text-sm">last month</div>
				</div>
			</div>
			<Button className="w-max" size="sm" variant="outline">
				Show more
			</Button>
		</div>
	);
}

function AboutIconItem({
	icon: Icon,
	stat,
	label,
}: {
	icon: Icon;
	label: string;
	stat?: string | number;
}) {
	return (
		<div className="flex items-center gap-2 text-muted-foreground">
			<Icon className="size-5" stroke={1.75} />
			<div>
				{stat && (
					<span className="text-foreground">
						{typeof stat === "number" ? formatNumber(stat) : stat}{" "}
					</span>
				)}
				<span>{label}</span>
			</div>
		</div>
	);
}

function formatNumber(value: number) {
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
}
