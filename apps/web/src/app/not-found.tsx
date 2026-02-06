import { IconFileUnknown, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { Invertocat } from "@/components/invertocat";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { getDemoRepos, isDemoMode } from "@/lib/demo";

export default function NotFound() {
	const demoMode = isDemoMode();

	if (demoMode) {
		return <DemoNotFound />;
	}

	return (
		<main className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
			<div className="absolute top-4 right-4">
				<ModeToggle />
			</div>
			<div className="flex max-w-md flex-col items-center gap-6 text-center">
				<div className="flex items-center justify-center rounded-full border bg-muted p-4">
					<IconFileUnknown
						className="size-8 text-muted-foreground"
						stroke={1.5}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-xl tracking-tight">
						Page not found
					</h1>
					<p className="text-muted-foreground text-sm leading-relaxed">
						The repository, issue, or pull request you&apos;re looking for
						doesn&apos;t exist on GitHub — or it may be private.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/">
						<Invertocat className="size-4" />
						Back to search
					</Link>
				</Button>
			</div>
		</main>
	);
}

function DemoNotFound() {
	const demoRepos = getDemoRepos();

	return (
		<main className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
			<div className="absolute top-4 right-4">
				<ModeToggle />
			</div>
			<div className="flex max-w-lg flex-col items-center gap-6 text-center">
				<div className="flex items-center justify-center rounded-full border bg-muted p-4">
					<IconLock className="size-8 text-muted-foreground" stroke={1.5} />
				</div>
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-xl tracking-tight">
						Repository not available
					</h1>
					<p className="text-muted-foreground text-sm leading-relaxed">
						This app is running in demo mode with a limited set of repositories.
						The one you requested isn&apos;t on the list.
					</p>
				</div>
				{demoRepos.length > 0 ? (
					<div className="flex w-full flex-col gap-2">
						<p className="text-muted-foreground text-xs">
							Try one of these instead:
						</p>
						<div className="flex flex-wrap justify-center gap-2">
							{demoRepos.map((repo) => (
								<Button
									asChild
									key={repo.full_name}
									size="sm"
									variant="outline"
								>
									<Link href={`/${repo.full_name}`}>{repo.full_name}</Link>
								</Button>
							))}
						</div>
					</div>
				) : null}
				<Button asChild variant="outline">
					<Link href="/">
						<Invertocat className="size-4" />
						Go home
					</Link>
				</Button>
			</div>
		</main>
	);
}
