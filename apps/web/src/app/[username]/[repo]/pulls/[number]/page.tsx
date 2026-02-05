import {
	IconArrowLeft,
	IconGitMerge,
	IconGitPullRequest,
	IconGitPullRequestClosed,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Streamdown } from "streamdown";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	fetchPullRequest,
	fetchPullRequestComments,
	type IssueCommentResponse,
	type PullRequestResponse,
} from "@/lib/github-rest";

export const revalidate = 60;

export default async function PullRequestDetailPage({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string; number: string }>;
}) {
	const params = await paramsPromise;
	const pullNumber = Number(params.number);

	if (Number.isNaN(pullNumber)) {
		notFound();
	}

	const [pr, comments] = await Promise.all([
		fetchPullRequest(params.username, params.repo, pullNumber),
		fetchPullRequestComments(params.username, params.repo, pullNumber),
	]);

	if (!pr) {
		notFound();
	}

	const isMerged = pr.merged_at !== null;

	return (
		<>
			<div className="flex flex-col gap-2 py-6">
				<div className="flex items-start gap-3">
					<div className="flex min-w-0 grow flex-col gap-1">
						<h1 className="font-bold text-2xl leading-snug">
							{pr.title}{" "}
							<span className="font-normal text-muted-foreground">
								#{pr.number}
							</span>
						</h1>
						<div className="flex items-center gap-2">
							<PrStateBadge
								draft={pr.draft}
								merged={isMerged}
								state={pr.state}
							/>
							<span className="text-muted-foreground text-sm">
								{pr.user && (
									<>
										<span className="font-medium text-foreground">
											{pr.user.login}
										</span>{" "}
									</>
								)}
								wants to merge into{" "}
								<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
									{pr.base.ref}
								</code>{" "}
								from{" "}
								<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
									{pr.head.ref}
								</code>
							</span>
						</div>
					</div>
				</div>
			</div>
			<Separator />
			<div className="flex gap-6 py-6">
				<div className="flex min-w-0 grow flex-col gap-4">
					{pr.body && (
						<CommentCard
							authorAssociation="OWNER"
							body={pr.body}
							createdAt={pr.created_at}
							user={pr.user}
						/>
					)}

					{comments.map((comment) => (
						<CommentCard
							authorAssociation={comment.author_association}
							body={comment.body}
							createdAt={comment.created_at}
							key={comment.id}
							user={comment.user}
						/>
					))}

					{comments.length === 0 && !pr.body && (
						<div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
							<p className="text-sm">No comments yet.</p>
						</div>
					)}
				</div>

				<div className="flex w-3xs shrink-0 flex-col gap-4">
					<div className="flex flex-col gap-3">
						<h3 className="font-semibold text-sm">Labels</h3>
						{pr.labels.length > 0 ? (
							<div className="flex flex-wrap gap-1.5">
								{pr.labels.map((label) => (
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
						<h3 className="font-semibold text-sm">Changes</h3>
						<div className="flex items-center gap-3 text-sm">
							<span className="text-green-600">+{pr.additions}</span>
							<span className="text-red-600">-{pr.deletions}</span>
							<span className="text-muted-foreground">
								{pr.changed_files} file{pr.changed_files !== 1 ? "s" : ""}
							</span>
						</div>
					</div>
					<Separator />
					<div className="flex flex-col gap-3">
						<h3 className="font-semibold text-sm">Participants</h3>
						<div className="flex flex-wrap gap-1">
							{getParticipants(pr, comments).map((participant) => (
								<Avatar className="size-6" key={participant.login}>
									<AvatarImage src={participant.avatar_url} />
								</Avatar>
							))}
						</div>
					</div>
					<Separator />
					<Button
						className="w-max gap-1.5"
						render={<Link href={`/${params.username}/${params.repo}/pulls`} />}
						size="sm"
						variant="outline"
					>
						<IconArrowLeft className="size-4" />
						Back to pull requests
					</Button>
				</div>
			</div>
		</>
	);
}

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

function PrStateBadge({
	state,
	merged,
	draft,
}: {
	state: "open" | "closed";
	merged: boolean;
	draft: boolean;
}) {
	if (merged) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 font-medium text-sm text-white">
				<IconGitMerge className="size-4" />
				Merged
			</span>
		);
	}
	if (state === "closed") {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 font-medium text-sm text-white">
				<IconGitPullRequestClosed className="size-4" />
				Closed
			</span>
		);
	}
	if (draft) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-sm">
				<IconGitPullRequest className="size-4" />
				Draft
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-0.5 font-medium text-sm text-white">
			<IconGitPullRequest className="size-4" />
			Open
		</span>
	);
}

function getParticipants(
	pr: PullRequestResponse,
	comments: IssueCommentResponse[]
): Array<{ login: string; avatar_url: string }> {
	const seen = new Set<string>();
	const participants: Array<{ login: string; avatar_url: string }> = [];

	if (pr.user && !seen.has(pr.user.login)) {
		seen.add(pr.user.login);
		participants.push(pr.user);
	}

	for (const comment of comments) {
		if (comment.user && !seen.has(comment.user.login)) {
			seen.add(comment.user.login);
			participants.push(comment.user);
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
