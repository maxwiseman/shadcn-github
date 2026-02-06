import { DemoRepoList } from "@/components/demo-repo-list";
import { Invertocat } from "@/components/invertocat";
import { ModeToggle } from "@/components/mode-toggle";
import { RepoSearch } from "@/components/repo-search";
import { getDemoRepos, isDemoMode } from "@/lib/demo";

export default function Page() {
	const demoMode = isDemoMode();
	const demoRepos = getDemoRepos();

	return (
		<main className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
			<div className="absolute top-4 right-4">
				<ModeToggle />
			</div>
			<div className="flex w-full max-w-xl flex-col items-center gap-8">
				<Invertocat className="size-12 text-foreground" />
				<div className="flex flex-col items-center gap-2">
					<h1 className="text-balance text-center font-semibold text-2xl text-foreground tracking-tight">
						Explore GitHub Repositories
					</h1>
					<p className="text-center text-muted-foreground text-sm">
						{demoMode
							? "Select a repository to get started"
							: "Search for any repository to get started"}
					</p>
				</div>
				{demoMode ? <DemoRepoList repos={demoRepos} /> : <RepoSearch />}
			</div>
		</main>
	);
}
