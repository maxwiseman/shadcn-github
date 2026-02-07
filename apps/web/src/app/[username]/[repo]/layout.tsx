import { IconMenu2, IconSlash } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { isRepoAllowed } from "@/lib/demo";
import { fetchRepoInfo } from "@/lib/github-rest";
import { RepoNav } from "./repo-nav";

export async function generateMetadata({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string }>;
}): Promise<Metadata> {
	const params = await paramsPromise;
	const repoInfo = await fetchRepoInfo(params.username, params.repo);

	const title = `${params.username}/${params.repo}`;
	const description = repoInfo?.description
		? repoInfo.description
		: `Explore ${params.username}/${params.repo} on GitHub`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

export default async function RepoLayout({
	children,
	params: paramsPromise,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ username: string; repo: string }>;
}>) {
	const params = await paramsPromise;

	if (!isRepoAllowed(params.username, params.repo)) {
		notFound();
	}

	return (
		<>
			<header className="sticky top-0 z-50 w-full border-b bg-card px-4 md:px-10">
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
			<main className="flex w-full justify-center px-3 md:px-6">
				<div className="w-full max-w-7xl px-0 md:px-4 lg:px-5">{children}</div>
			</main>
		</>
	);
}
