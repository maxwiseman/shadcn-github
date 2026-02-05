"use client";

import {
	IconActivity,
	IconBuildingStore,
	IconCircleDot,
	IconCode,
	IconGitPullRequest,
	IconLayoutKanban,
	IconShield,
} from "@tabler/icons-react";
import { LayoutGroup } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Underline } from "./underline";

export function RepoNav({
	username,
	repo,
}: {
	username: string;
	repo: string;
}) {
	const pathname = usePathname();
	const base = `/${username}/${repo}`;

	const isCode = pathname === base || pathname === `${base}/`;
	const isIssues = pathname.startsWith(`${base}/issues`);

	return (
		<LayoutGroup>
			<div className="flex gap-2 pb-1">
				<Button
					className={
						isCode ? "relative gap-2" : "relative gap-2 text-muted-foreground"
					}
					render={<Link href={base} prefetch />}
					size="sm"
					variant="ghost"
				>
					<IconCode />
					Code
					{isCode && <Underline />}
				</Button>
				<Button
					className={
						isIssues ? "relative gap-2" : "relative gap-2 text-muted-foreground"
					}
					render={<Link href={`${base}/issues`} prefetch />}
					size="sm"
					variant="ghost"
				>
					<IconCircleDot />
					Issues
					{isIssues && <Underline />}
				</Button>
				<Button
					className="gap-2 text-muted-foreground"
					size="sm"
					variant="ghost"
				>
					<IconGitPullRequest /> Pull Requests
				</Button>
				<Button
					className="gap-2 text-muted-foreground"
					size="sm"
					variant="ghost"
				>
					<IconBuildingStore /> Marketplace
				</Button>
				<Button
					className="gap-2 text-muted-foreground"
					size="sm"
					variant="ghost"
				>
					<IconLayoutKanban /> Projects
				</Button>
				<Button
					className="gap-2 text-muted-foreground"
					size="sm"
					variant="ghost"
				>
					<IconShield /> Security
				</Button>
				<Button
					className="gap-2 text-muted-foreground"
					size="sm"
					variant="ghost"
				>
					<IconActivity /> Insights
				</Button>
			</div>
		</LayoutGroup>
	);
}
