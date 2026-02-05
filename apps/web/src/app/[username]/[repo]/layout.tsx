import { IconMenu2, IconSlash } from "@tabler/icons-react";
import Link from "next/link";
import { Invertocat } from "@/components/invertocat";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { RepoNav } from "./repo-nav";

export default async function RepoLayout({
	children,
	params: paramsPromise,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ username: string; repo: string }>;
}>) {
	const params = await paramsPromise;

	return (
		<>
			<header className="sticky top-0 z-50 w-full border-b bg-card px-10">
				<div className="flex items-center gap-4 py-4">
					<Button className="rounded-lg" size="icon-sm" variant="outline">
						<IconMenu2 />
					</Button>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink render={<Link href="/" />}>
									<Invertocat className="size-8 text-foreground" />
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator>
								<IconSlash
									className="size-5! -rotate-12 opacity-50"
									stroke={1}
								/>
							</BreadcrumbSeparator>
							<BreadcrumbItem>
								<BreadcrumbLink
									render={
										<Link href={`/${params.username}/${params.username}`} />
									}
								>
									{/*<Avatar className="mr-1 size-5">
									  <AvatarImage src={repo.owner.avatar_url} />
									</Avatar>*/}
									{params.username}
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator>
								<IconSlash
									className="size-5! -rotate-12 opacity-50"
									stroke={1}
								/>
							</BreadcrumbSeparator>
							<BreadcrumbItem>
								<BreadcrumbPage
								// render={
								// 	<Link
								// 		href={`/${repo.owner.login}/${repo.name}`}
								// 	/>
								// }
								>
									{params.repo}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
				<RepoNav repo={params.repo} username={params.username} />
			</header>
			<main className="flex w-full justify-center px-6">
				<div className="w-full max-w-7xl px-3 md:px-4 lg:px-5">{children}</div>
			</main>
		</>
	);
}
