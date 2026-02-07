import {
	IconArrowLeft,
	IconCircleCheck,
	IconCircleDot,
	IconEdit,
	IconEye,
	IconEyeX,
	IconGitCommit,
	IconGitMerge,
	IconLock,
	IconPennant,
	IconPennantOff,
	IconTag,
	IconTagOff,
	IconUserMinus,
	IconUserPlus,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Streamdown } from "streamdown";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	fetchIssue,
	fetchTimelineEvents,
	type IssueResponse,
	type TimelineEvent,
} from "@/lib/github-rest";

export const revalidate = 60;

export async function generateMetadata({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string; number: string }>;
}): Promise<Metadata> {
	const params = await paramsPromise;
	const issueNumber = Number(params.number);

	if (Number.isNaN(issueNumber)) {
		return {
			title: "Issue Not Found",
		};
	}

	const issue = await fetchIssue(params.username, params.repo, issueNumber);

	if (!issue) {
		return {
			title: "Issue Not Found",
		};
	}

	const stateLabel = issue.state === "open" ? "Open" : "Closed";
	const description = issue.body
		? issue.body.slice(0, 160)
		: `${stateLabel} issue in ${params.username}/${params.repo}`;

	return {
		title: `${issue.title} #${issue.number}`,
		description,
		openGraph: {
			title: `${issue.title} #${issue.number}`,
			description,
			type: "website",
			siteName: "shadcn-github",
		},
		twitter: {
			card: "summary_large_image",
			title: `${issue.title} #${issue.number}`,
			description,
			site: "@maxwiseman_",
		},
	};
}

export default async function IssueDetailPage({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string; number: string }>;
}) {
	const params = await paramsPromise;
	const issueNumber = Number(params.number);

	if (Number.isNaN(issueNumber)) {
		notFound();
	}

	const [issue, timeline] = await Promise.all([
		fetchIssue(params.username, params.repo, issueNumber),
		fetchTimelineEvents(params.username, params.repo, issueNumber),
	]);

	if (!issue) {
		notFound();
	}

	return (
		<>
			<div className="flex flex-col gap-2 py-6">
				<div className="flex items-start gap-3">
					<div className="flex min-w-0 grow flex-col gap-1">
						<h1 className="font-bold text-2xl leading-snug">
							{issue.title}{" "}
							<span className="font-normal text-muted-foreground">
								#{issue.number}
							</span>
						</h1>
						<div className="flex items-center gap-2">
							<IssueStateBadge state={issue.state} />
							<span className="text-muted-foreground text-sm">
								{issue.user && (
									<>
										<span className="font-medium text-foreground">
											{issue.user.login}
										</span>{" "}
									</>
								)}
								opened this issue {formatFullDate(issue.created_at)} &middot;{" "}
								{issue.comments} comment{issue.comments !== 1 ? "s" : ""}
							</span>
						</div>
					</div>
				</div>
			</div>
			<Separator />
			<div className="flex flex-col gap-6 py-6 md:flex-row">
				<div className="flex min-w-0 grow flex-col gap-4">
					{issue.body && (
						<CommentCard
							authorAssociation="OWNER"
							body={issue.body}
							createdAt={issue.created_at}
							user={issue.user}
						/>
					)}

					{timeline.map((event) => {
						if (event.event === "commented" && event.body) {
							return (
								<CommentCard
									authorAssociation={event.author_association ?? "NONE"}
									body={event.body}
									createdAt={event.created_at}
									key={event.id}
									user={event.user ?? event.actor ?? null}
								/>
							);
						}
						return (
							<TimelineEventItem
								event={event}
								key={`${event.event}-${event.created_at}-${String(event.id ?? "")}`}
							/>
						);
					})}

					{timeline.length === 0 && !issue.body && (
						<div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
							<p className="text-sm">No comments yet.</p>
						</div>
					)}
				</div>

				<div className="flex w-full flex-col gap-4 md:w-3xs md:shrink-0">
					<div className="flex flex-col gap-3">
						<h3 className="font-semibold text-sm">Labels</h3>
						{issue.labels.length > 0 ? (
							<div className="flex flex-wrap gap-1.5">
								{issue.labels.map((label) => (
									<span
										className="inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs"
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
						) : (
							<p className="text-muted-foreground text-sm">None yet</p>
						)}
					</div>
					<Separator />
					<div className="flex flex-col gap-3">
						<h3 className="font-semibold text-sm">Participants</h3>
						<div className="flex flex-wrap gap-1">
							{getParticipants(issue, timeline).map((participant) => (
								<Avatar className="size-6" key={participant.login}>
									<AvatarImage src={participant.avatar_url} />
								</Avatar>
							))}
						</div>
					</div>
					<Separator />
					<Button
						className="w-max gap-1.5"
						render={<Link href={`/${params.username}/${params.repo}/issues`} />}
						size="sm"
						variant="outline"
					>
						<IconArrowLeft className="size-4" />
						Back to issues
					</Button>
				</div>
			</div>
		</>
	);
}

// ─── Timeline Event Rendering ───────────────────────────────────────

function TimelineEventItem({ event }: { event: TimelineEvent }) {
	const content = getTimelineContent(event);
	if (!content) {
		return null;
	}

	return (
		<div className="flex items-center gap-3 py-1 pl-4">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
				{content.icon}
			</div>
			<div className="flex min-w-0 items-center gap-1.5 text-sm">
				{event.actor && (
					<Avatar className="size-4">
						<AvatarImage src={event.actor.avatar_url} />
					</Avatar>
				)}
				{content.message}
				<span className="shrink-0 text-muted-foreground text-xs">
					{formatRelativeDate(event.created_at)}
				</span>
			</div>
		</div>
	);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: It's Ok as long as Claude understands it lol
function getTimelineContent(
	event: TimelineEvent
): { icon: React.ReactNode; message: React.ReactNode } | null {
	switch (event.event) {
		case "labeled": {
			return {
				icon: <IconTag className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">added</span>
						{event.label && (
							<span
								className="inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs"
								style={{
									backgroundColor: `#${event.label.color}20`,
									color: `#${event.label.color}`,
									border: `1px solid #${event.label.color}40`,
								}}
							>
								{event.label.name}
							</span>
						)}
					</span>
				),
			};
		}
		case "unlabeled": {
			return {
				icon: <IconTagOff className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">removed</span>
						{event.label && (
							<span
								className="inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs"
								style={{
									backgroundColor: `#${event.label.color}20`,
									color: `#${event.label.color}`,
									border: `1px solid #${event.label.color}40`,
								}}
							>
								{event.label.name}
							</span>
						)}
					</span>
				),
			};
		}
		case "milestoned": {
			return {
				icon: <IconPennant className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">
							added this to the{" "}
							<span className="font-medium text-foreground">
								{event.milestone?.title}
							</span>{" "}
							milestone
						</span>
					</span>
				),
			};
		}
		case "demilestoned": {
			return {
				icon: <IconPennantOff className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">
							removed this from the{" "}
							<span className="font-medium text-foreground">
								{event.milestone?.title}
							</span>{" "}
							milestone
						</span>
					</span>
				),
			};
		}
		case "renamed": {
			return {
				icon: <IconEdit className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">changed the title</span>
						<span className="line-through">{event.rename?.from}</span>
						<span>{event.rename?.to}</span>
					</span>
				),
			};
		}
		case "assigned": {
			return {
				icon: <IconUserPlus className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">assigned</span>
						<span className="font-medium">
							{event.assignee?.login ?? "someone"}
						</span>
					</span>
				),
			};
		}
		case "unassigned": {
			return {
				icon: <IconUserMinus className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">unassigned</span>
						<span className="font-medium">
							{event.assignee?.login ?? "someone"}
						</span>
					</span>
				),
			};
		}
		case "closed": {
			return {
				icon: <IconCircleCheck className="size-3.5 text-purple-600" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">closed this</span>
					</span>
				),
			};
		}
		case "reopened": {
			return {
				icon: <IconCircleDot className="size-3.5 text-green-600" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">reopened this</span>
					</span>
				),
			};
		}
		case "locked": {
			return {
				icon: <IconLock className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">
							locked this conversation
							{event.lock_reason ? ` as ${event.lock_reason}` : ""}
						</span>
					</span>
				),
			};
		}
		case "merged": {
			return {
				icon: <IconGitMerge className="size-3.5 text-purple-600" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">
							merged commit{" "}
							{event.commit_id && (
								<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
									{event.commit_id.substring(0, 7)}
								</code>
							)}
						</span>
					</span>
				),
			};
		}
		case "referenced": {
			return {
				icon: <IconGitCommit className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">
							referenced this
							{event.commit_id && (
								<>
									{" "}
									in commit{" "}
									<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
										{event.commit_id.substring(0, 7)}
									</code>
								</>
							)}
						</span>
					</span>
				),
			};
		}
		case "cross-referenced": {
			return {
				icon: <IconGitCommit className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">
							mentioned this
							{event.source?.issue && (
								<>
									{" "}
									in{" "}
									<span className="font-medium text-foreground">
										#{event.source.issue.number}
									</span>
								</>
							)}
						</span>
					</span>
				),
			};
		}
		case "review_requested": {
			return {
				icon: <IconEye className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">requested review from</span>
						<span className="font-medium">
							{event.requested_reviewer?.login ?? "someone"}
						</span>
					</span>
				),
			};
		}
		case "review_request_removed": {
			return {
				icon: <IconEyeX className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5">
						<span className="font-medium">
							{event.actor?.login ?? "Someone"}
						</span>
						<span className="text-muted-foreground">
							removed review request for
						</span>
						<span className="font-medium">
							{event.requested_reviewer?.login ?? "someone"}
						</span>
					</span>
				),
			};
		}
		case "committed": {
			return {
				icon: <IconGitCommit className="size-3.5 text-muted-foreground" />,
				message: (
					<span className="flex items-center gap-1.5 text-muted-foreground">
						<span className="line-clamp-1">
							{event.message?.split("\n")[0] ?? "committed"}
						</span>
						{event.sha && (
							<code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
								{event.sha.substring(0, 7)}
							</code>
						)}
					</span>
				),
			};
		}
		default: {
			return null;
		}
	}
}

// ─── Shared Components ──────────────────────────────────────────────

function CommentCard({
	user,
	body,
	createdAt,
	authorAssociation,
}: {
	user: { login: string; avatar_url: string } | null;
	body: string;
	createdAt: string;
	authorAssociation: string;
}) {
	return (
		<Card className="gap-0 p-0">
			<CardHeader className="flex items-center gap-2 border-b p-3! text-sm">
				{user && (
					<Avatar className="size-6">
						<AvatarImage src={user.avatar_url} />
					</Avatar>
				)}
				<span className="font-semibold">{user?.login ?? "Unknown"}</span>
				<span className="text-muted-foreground">
					commented {formatRelativeDate(createdAt)}
				</span>
				{authorAssociation !== "NONE" && authorAssociation !== "OWNER" && (
					<span className="rounded-full border px-2 py-0.5 text-muted-foreground text-xs">
						{authorAssociation.toLowerCase()}
					</span>
				)}
				{authorAssociation === "OWNER" && (
					<span className="rounded-full border px-2 py-0.5 text-muted-foreground text-xs">
						owner
					</span>
				)}
			</CardHeader>
			<CardContent className="p-4">
				<Streamdown mode="static">{body}</Streamdown>
			</CardContent>
		</Card>
	);
}

function IssueStateBadge({ state }: { state: "open" | "closed" }) {
	if (state === "open") {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-0.5 font-medium text-sm text-white">
				<IconCircleDot className="size-4" />
				Open
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 font-medium text-sm text-white">
			<IconCircleCheck className="size-4" />
			Closed
		</span>
	);
}

function getParticipants(
	issue: IssueResponse,
	timeline: TimelineEvent[]
): Array<{ login: string; avatar_url: string }> {
	const seen = new Set<string>();
	const participants: Array<{ login: string; avatar_url: string }> = [];

	if (issue.user && !seen.has(issue.user.login)) {
		seen.add(issue.user.login);
		participants.push(issue.user);
	}

	for (const event of timeline) {
		const user = event.user ?? event.actor;
		if (user && !seen.has(user.login)) {
			seen.add(user.login);
			participants.push(user);
		}
	}

	return participants;
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

function formatFullDate(dateString: string): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(dateString));
}
