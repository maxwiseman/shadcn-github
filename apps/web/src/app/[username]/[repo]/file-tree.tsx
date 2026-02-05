import {
	IconCode,
	IconFile,
	IconFolder,
	IconGitBranch,
	IconPlus,
	IconTag,
} from "@tabler/icons-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
	CommitResponse,
	RepoResponse,
	RepoTreeResponse,
} from "@/lib/github-rest";
import { fetchTopLevelCommits } from "@/lib/github-rest";

export async function RepoFileTree({
	repo,
	tree,
	currentCommit,
}: {
	repo: RepoResponse;
	tree: RepoTreeResponse;
	currentCommit: CommitResponse | null;
}) {
	const treeStructure = pathsToTree(tree.tree);
	const topLevelNames = treeStructure.children.map((item) => item.name);
	const topLevelCommits = await fetchTopLevelCommits(
		repo.owner.login,
		repo.name,
		topLevelNames
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2">
				<Button size="sm" variant="outline">
					<IconGitBranch /> {repo.default_branch}
				</Button>
				<Button className="text-muted-foreground" size="sm" variant="ghost">
					<IconGitBranch /> 1 branch
				</Button>
				<Button className="text-muted-foreground" size="sm" variant="ghost">
					<IconTag /> 0 tags
				</Button>
				<div className="grow" />
				<Button size="sm" variant="outline">
					<IconFolder /> Go to file
				</Button>
				<Button size="sm" variant="outline">
					<IconPlus /> Add file
				</Button>
				<Button
					className="border-green-700 bg-green-700 hover:bg-green-800"
					size="sm"
				>
					<IconCode /> Code
				</Button>
			</div>
			<Card className="gap-0 p-0">
				{currentCommit && (
					<CardHeader className="flex items-center gap-2 border-b p-4! py-3! font-mono text-muted-foreground">
						<Avatar className="mr-1 size-5">
							<AvatarImage src={currentCommit.author?.avatar_url ?? ""} />
						</Avatar>
						<span className="font-semibold text-foreground">
							{currentCommit.author?.login}
						</span>
						<span className="line-clamp-1">
							{currentCommit.commit.message.split("\n")[0]}
						</span>
						<div className="grow" />
						<div className="rounded-full border px-1.25 py-0.75 text-xs">
							{currentCommit.sha.substring(0, 7)}
						</div>
					</CardHeader>
				)}
				<CardContent className="p-0">
					<table className="w-full table-fixed">
						<tbody className="divide-y">
							{treeStructure.children.map((item) => {
								const itemCommit = topLevelCommits[item.name];

								return (
									<tr className="items-center *:h-10" key={item.name}>
										<td className="flex items-center gap-4 pl-4 font-medium">
											{item.isFile ? (
												<IconFile className="size-5 text-muted-foreground" />
											) : (
												<IconFolder className="size-5 text-muted-foreground" />
											)}
											{item.name}
										</td>
										<td className="text-muted-foreground">
											<div className="line-clamp-1">
												{itemCommit?.commit.message.split("\n")[0] ?? "—"}
											</div>
										</td>
										<td className="text-muted-foreground">
											<div className="flex justify-end pr-4">
												{itemCommit?.commit.author?.date
													? formatDate(itemCommit.commit.author.date)
													: "—"}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</CardContent>
			</Card>
		</div>
	);
}

const formatDate = (value: string) =>
	new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));

interface TreeNode {
	name: string;
	children: TreeNode[];
	isFile: boolean;
}

function pathsToTree(
	items: {
		path: string;
		type: "blob" | "tree";
		sha: string;
	}[]
) {
	const tree: TreeNode = { name: "root", children: [], isFile: false };

	// biome-ignore lint/complexity/noForEach: That's stupid
	items.forEach((item) => {
		const parts = item.path.split("/").filter((p) => p.length > 0);
		let currentNode = tree;

		parts.forEach((part, index) => {
			let childNode = currentNode.children.find((child) => child.name === part);

			if (!childNode) {
				childNode = {
					name: part,
					children: [],
					isFile: item.type === "blob" && index === parts.length - 1,
				};
				currentNode.children.push(childNode);
			}

			currentNode = childNode;
		});
	});

	return tree;
}
