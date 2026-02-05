import { IconArrowsMaximize, IconBook, IconEdit } from "@tabler/icons-react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchReadme, type RepoResponse } from "@/lib/github-rest";

export async function RepoPreview({ repo }: { repo: RepoResponse }) {
	const readmeText = await fetchReadme(repo.owner.login, repo.name);

	return (
		<Card className="pt-0">
			<CardHeader className="flex items-center gap-2 border-b p-3! font-mono text-muted-foreground">
				<IconBook className="size-5" />
				<span className="font-semibold text-foreground">README.md</span>
				<div className="grow" />
				<div className="flex items-center gap-2">
					<Button size="icon-sm" variant="outline">
						<IconArrowsMaximize />
					</Button>
					<Button size="icon-sm" variant="outline">
						<IconEdit />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="flex overflow-x-scroll">
				<Streamdown className="w-0 grow" mode="static">
					{readmeText ?? "No README found."}
				</Streamdown>
			</CardContent>
		</Card>
	);
}
