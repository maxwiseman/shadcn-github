import {
	IconArrowLeft,
	IconCircleCheck,
	IconCircleDot,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Streamdown } from "streamdown";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	fetchIssue,
	fetchIssueComments,
	type IssueCommentResponse,
	type IssueResponse,
} from "@/lib/github-rest";

export const revalidate = 60;

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

	const [issue, comments] = await Promise.all([
		fetchIssue(params.username, params.repo, issueNumber),
		fetchIssueComments(params.username, params.repo, issueNumber),
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
			<div className="flex gap-6 py-6">
				<div className="flex min-w-0 grow flex-col gap-4">
					{issue.body && (
						<CommentCard
							authorAssociation="OWNER"
							body={issue.body}
							createdAt={issue.created_at}
							user={issue.user}
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

					{comments.length === 0 && !issue.body && (
						<div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
							<p className="text-sm">No comments yet.</p>
						</div>
					)}
				</div>

				<div className="flex w-3xs shrink-0 flex-col gap-4">
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
							{getParticipants(issue, comments).map((participant) => (
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
	comments: IssueCommentResponse[]
): Array<{ login: string; avatar_url: string }> {
	const seen = new Set<string>();
	const participants: Array<{ login: string; avatar_url: string }> = [];

	if (issue.user && !seen.has(issue.user.login)) {
		seen.add(issue.user.login);
		participants.push(issue.user);
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

function formatFullDate(dateString: string): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(dateString));
}
