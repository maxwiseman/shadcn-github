import {
	IconChevronLeft,
	IconChevronRight,
	IconGitMerge,
	IconGitPullRequest,
	IconGitPullRequestClosed,
	IconMessageCircle,
	IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fetchPullRequests } from "@/lib/github-rest";

export const revalidate = 60;

export default async function PullRequestsPage({
	params: paramsPromise,
	searchParams: searchParamsPromise,
}: {
	params: Promise<{ username: string; repo: string }>;
	searchParams: Promise<{ page?: string; q?: string; state?: string }>;
}) {
	const params = await paramsPromise;
	const searchParams = await searchParamsPromise;
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.q ?? "";
	const stateFilter = (searchParams.state ?? "open") as
		| "open"
		| "closed"
		| "all";
	const perPage = 25;

	const result = await fetchPullRequests(params.username, params.repo, {
		page: currentPage,
		perPage,
		state: stateFilter,
		query: query || undefined,
	});

	const pulls = result?.pulls ?? [];
	const totalCount = result?.totalCount ?? 0;
	const totalPages = Math.ceil(totalCount / perPage);

	const buildHref = (overrides: Record<string, string | number>) => {
		const p = new URLSearchParams();
		if (query) {
			p.set("q", query);
		}
		if (stateFilter !== "open") {
			p.set("state", stateFilter);
		}
		for (const [key, value] of Object.entries(overrides)) {
			p.set(key, String(value));
		}
		if (p.get("page") === "1") {
			p.delete("page");
		}
		if (p.get("state") === "open") {
			p.delete("state");
		}
		const qs = p.toString();
		return `/${params.username}/${params.repo}/pulls${qs ? `?${qs}` : ""}` as `/${string}/${string}/pulls${string}`;
	};

	return (
		<>
			<div className="flex items-center justify-between py-6">
				<h1 className="font-bold text-3xl">Pull Requests</h1>
			</div>
			<Separator />
			<div className="flex flex-col gap-4 py-6">
				<div className="flex items-center gap-3">
					<form
						action={`/${params.username}/${params.repo}/pulls`}
						className="relative grow"
						method="GET"
					>
						<IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							className="bg-card pl-9"
							defaultValue={query}
							name="q"
							placeholder="Search pull requests..."
						/>
						{stateFilter !== "open" && (
							<input name="state" type="hidden" value={stateFilter} />
						)}
					</form>
					<div className="flex gap-1">
						<Button
							className={
								stateFilter === "open"
									? "gap-1.5"
									: "gap-1.5 text-muted-foreground"
							}
							render={<Link href={buildHref({ state: "open" })} />}
							size="sm"
							variant={stateFilter === "open" ? "secondary" : "ghost"}
						>
							<IconGitPullRequest className="size-4" />
							Open
						</Button>
						<Button
							className={
								stateFilter === "closed"
									? "gap-1.5"
									: "gap-1.5 text-muted-foreground"
							}
							render={<Link href={buildHref({ state: "closed" })} />}
							size="sm"
							variant={stateFilter === "closed" ? "secondary" : "ghost"}
						>
							<IconGitPullRequestClosed className="size-4" />
							Closed
						</Button>
					</div>
				</div>

				<Card className="gap-0 p-0">
					<CardContent className="p-0">
						{pulls.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
								<IconGitPullRequest className="size-12 opacity-30" />
								<p className="font-medium text-lg">No pull requests found</p>
								<p className="text-sm">
									{query
										? "Try a different search term."
										: "There are no pull requests matching this filter."}
								</p>
							</div>
						) : (
							<div className="divide-y">
								{pulls.map((pr) => (
									<Link
										className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
										href={`/${params.username}/${params.repo}/pulls/${String(pr.number)}`}
										key={pr.number}
										prefetch
									>
										<PrStateIcon
											draft={pr.draft}
											merged={pr.merged_at !== null}
											state={pr.state}
										/>
										<div className="flex min-w-0 grow flex-col gap-1">
											<div className="flex items-center gap-2">
												<span className="font-semibold leading-snug">
													{pr.title}
												</span>
												{pr.labels.map((label) => (
													<span
														className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-medium text-xs"
														key={label.id}
														style={{
															backgroundColor: `#${label.color}20`,
															color: `#${label.color}`,
															border: `1px solid #${label.color}40`,
														}}
													>
														{label.name}
													</span>
												))}
											</div>
											<div className="flex items-center gap-3 text-muted-foreground text-xs">
												<span>
													#{pr.number} opened{" "}
													{formatRelativeDate(pr.created_at)}
													{pr.user && ` by ${pr.user.login}`}
												</span>
											</div>
										</div>
										<div className="flex shrink-0 items-center gap-3">
											{pr.user && (
												<Avatar className="size-5">
													<AvatarImage src={pr.user.avatar_url} />
												</Avatar>
											)}
											{(pr.comments > 0 || pr.review_comments > 0) && (
												<span className="flex items-center gap-1 text-muted-foreground text-xs">
													<IconMessageCircle className="size-4" />
													{pr.comments + (pr.review_comments ?? 0)}
												</span>
											)}
										</div>
									</Link>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-2 pt-2">
						{currentPage > 1 ? (
							<Button
								render={<Link href={buildHref({ page: currentPage - 1 })} />}
								size="sm"
								variant="outline"
							>
								<IconChevronLeft className="size-4" />
								Previous
							</Button>
						) : (
							<Button disabled size="sm" variant="outline">
								<IconChevronLeft className="size-4" />
								Previous
							</Button>
						)}
						<span className="px-3 text-muted-foreground text-sm">
							Page {currentPage} of {totalPages}
						</span>
						{currentPage < totalPages ? (
							<Button
								render={<Link href={buildHref({ page: currentPage + 1 })} />}
								size="sm"
								variant="outline"
							>
								Next
								<IconChevronRight className="size-4" />
							</Button>
						) : (
							<Button disabled size="sm" variant="outline">
								Next
								<IconChevronRight className="size-4" />
							</Button>
						)}
					</div>
				)}
			</div>
		</>
	);
}

function PrStateIcon({
	state,
	merged,
	draft,
}: {
	state: "open" | "closed";
	merged: boolean;
	draft: boolean;
}) {
	if (merged) {
		return <IconGitMerge className="mt-0.5 size-5 shrink-0 text-purple-600" />;
	}
	if (state === "closed") {
		return (
			<IconGitPullRequestClosed className="mt-0.5 size-5 shrink-0 text-red-600" />
		);
	}
	if (draft) {
		return (
			<IconGitPullRequest className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
		);
	}
	return (
		<IconGitPullRequest className="mt-0.5 size-5 shrink-0 text-green-600" />
	);
}

function formatRelativeDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffMonths = Math.floor(diffDays / 30);
	const diffYears = Math.floor(diffDays / 365);

	if (diffYears > 0) {
		return `${String(diffYears)} year${diffYears > 1 ? "s" : ""} ago`;
	}
	if (diffMonths > 0) {
		return `${String(diffMonths)} month${diffMonths > 1 ? "s" : ""} ago`;
	}
	if (diffDays > 0) {
		return `${String(diffDays)} day${diffDays > 1 ? "s" : ""} ago`;
	}
	if (diffHours > 0) {
		return `${String(diffHours)} hour${diffHours > 1 ? "s" : ""} ago`;
	}
	if (diffMinutes > 0) {
		return `${String(diffMinutes)} minute${diffMinutes > 1 ? "s" : ""} ago`;
	}
	return "just now";
}
