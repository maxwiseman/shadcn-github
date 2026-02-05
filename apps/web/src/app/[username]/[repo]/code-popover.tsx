import { IconCode } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CodePopover({
	repoName,
	userName,
}: {
	repoName: string;
	userName: string;
}) {
	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						className="border-green-700 bg-green-700 hover:bg-green-800"
						size="sm"
					/>
				}
			>
				<IconCode /> Code
			</PopoverTrigger>
			<PopoverContent align="end" className="mt-1">
				<Tabs>
					<TabsList>
						<TabsTrigger value="https">HTTPS</TabsTrigger>
						<TabsTrigger value="ssh">SSH</TabsTrigger>
						<TabsTrigger value="github-cli">GitHub CLI</TabsTrigger>
					</TabsList>
					<TabsContent className="pt-4" value="https">
						<CommandBlock
							command={`https://github.com/${userName}/${repoName}.git`}
						/>
					</TabsContent>
					<TabsContent className="pt-4" value="ssh">
						<CommandBlock
							command={`git@github.com:${userName}/${repoName}.git`}
						/>
					</TabsContent>
					<TabsContent className="pt-4" value="github-cli">
						<CommandBlock command={`gh repo clone ${userName}/${repoName}`} />
					</TabsContent>
				</Tabs>
			</PopoverContent>
		</Popover>
	);
}

export function CommandBlock({ command }: { command: string }) {
	return (
		<code className="block w-full overflow-x-scroll rounded-md bg-muted p-4 font-mono text-sm">
			<div className="text-nowrap">{command}</div>
		</code>
	);
}
