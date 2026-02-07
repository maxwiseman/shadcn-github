"use client";

import { IconFile, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommitResponse } from "@/lib/github-rest";
import { getFileContent } from "./actions";
import { FileViewer } from "./blob/[...path]/file-viewer";
import { CommitMessageLink, formatDate, type TreeNode } from "./file-tree";

export function InteractiveFileTree({
	tree,
	topLevelCommits,
	repoOwner,
	repoName,
	defaultBranch,
}: {
	tree: TreeNode;
	topLevelCommits: Record<string, CommitResponse | null>;
	repoOwner: string;
	repoName: string;
	defaultBranch: string;
}) {
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const pullBase =
		`/${repoOwner}/${repoName}/pulls` as `/${string}/${string}/pulls`;

	const toggle = (path: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	};

	return (
		<>
			<div className="divide-y text-sm">
				{tree.children.map((node) => (
					<TreeRow
						depth={0}
						expanded={expanded}
						key={node.path}
						node={node}
						onFileClick={setSelectedFile}
						pullBase={pullBase}
						toggle={toggle}
						topLevelCommits={topLevelCommits}
					/>
				))}
			</div>
			<FilePreviewDialog
				defaultBranch={defaultBranch}
				filePath={selectedFile}
				onOpenChange={(open) => {
					if (!open) {
						setSelectedFile(null);
					}
				}}
				repoName={repoName}
				repoOwner={repoOwner}
			/>
		</>
	);
}

function FilePreviewDialog({
	filePath,
	repoOwner,
	repoName,
	defaultBranch,
	onOpenChange,
}: {
	filePath: string | null;
	repoOwner: string;
	repoName: string;
	defaultBranch: string;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: content, isLoading } = useQuery({
		queryKey: ["file-content", repoOwner, repoName, defaultBranch, filePath],
		queryFn: () => {
			if (!filePath) {
				return null;
			}
			return getFileContent(repoOwner, repoName, filePath, defaultBranch);
		},
		enabled: filePath !== null,
	});

	const fileName = filePath?.split("/").pop() ?? "";

	return (
		<Dialog onOpenChange={onOpenChange} open={filePath !== null}>
			<DialogContent className="max-h-[80vh]! max-w-4xl! overflow-auto p-0!">
				{/*<DialogHeader className="px-6 pt-6">
					<DialogTitle className="font-mono">{fileName}</DialogTitle>
					<DialogDescription>{filePath}</DialogDescription>
				</DialogHeader>*/}
				<div className="overflow-auto">
					{isLoading && (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-5/6" />
							<Skeleton className="h-4 w-2/3" />
						</div>
					)}
					{!isLoading && content && (
						<FileViewer content={content} filename={fileName} />
					)}
					{!(isLoading || content) && (
						<p className="text-muted-foreground text-sm">
							Unable to load file content.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function TreeRow({
	node,
	depth,
	expanded,
	toggle,
	topLevelCommits,
	onFileClick,
	pullBase,
}: {
	node: TreeNode;
	depth: number;
	expanded: Set<string>;
	toggle: (path: string) => void;
	topLevelCommits: Record<string, CommitResponse | null>;
	onFileClick: (path: string) => void;
	pullBase: `/${string}/${string}/pulls`;
}) {
	const isExpanded = expanded.has(node.path);
	const isFolder = !node.isFile;
	const commit = depth === 0 ? topLevelCommits[node.name] : null;

	const paddingLeft = depth * 20;

	const folderIcon = isExpanded ? (
		<IconFolderOpen className="size-5 shrink-0 text-muted-foreground" />
	) : (
		<IconFolder className="size-5 shrink-0 text-muted-foreground" />
	);
	const icon = isFolder ? (
		folderIcon
	) : (
		<IconFile className="size-5 shrink-0 text-muted-foreground" />
	);

	const rowContent = (
		<>
			<div className="flex min-w-0 items-center gap-4" style={{ paddingLeft }}>
				{icon}
				<span className="truncate">{node.name}</span>
			</div>
			{depth === 0 && commit && (
				<>
					<div className="hidden min-w-0 text-muted-foreground md:block">
						<CommitMessageLink
							basePath={pullBase}
							message={commit.commit.message.split("\n")[0]}
						/>
					</div>
					<div className="hidden text-muted-foreground md:block">
						{commit.commit.author?.date
							? formatDate(commit.commit.author.date)
							: ""}
					</div>
				</>
			)}
		</>
	);

	return (
		<>
			<button
				className="grid h-10 w-full cursor-pointer items-center gap-4 px-4 text-left hover:bg-accent/50"
				onClick={() => (isFolder ? toggle(node.path) : onFileClick(node.path))}
				style={{
					gridTemplateColumns:
						depth === 0
							? "minmax(0, 1fr) minmax(0, 2fr) auto"
							: "minmax(0, 1fr)",
				}}
				type="button"
			>
				{rowContent}
			</button>
			{isFolder &&
				isExpanded &&
				node.children.map((child) => (
					<TreeRow
						depth={depth + 1}
						expanded={expanded}
						key={child.path}
						node={child}
						onFileClick={onFileClick}
						pullBase={pullBase}
						toggle={toggle}
						topLevelCommits={topLevelCommits}
					/>
				))}
		</>
	);
}
