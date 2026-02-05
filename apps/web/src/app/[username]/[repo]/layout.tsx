import {
	IconActivity,
	IconBuildingStore,
	IconCircleDot,
	IconCode,
	IconGitMerge,
	IconLayoutKanban,
	IconMenu2,
	IconShield,
	IconSlash,
} from "@tabler/icons-react";
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
import { Underline } from "./underline";

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
				<div className="flex gap-2 pb-1">
					<Button
						className="relative gap-2"
						render={
							<Link href={`/${params.username}/${params.repo}`} prefetch />
						}
						size="sm"
						variant="ghost"
					>
						<IconCode />
						Code
						<Underline />
					</Button>
					<Button
						className="gap-2 text-muted-foreground"
						render={
							<Link
								href={`/${params.username}/${params.repo}/issues`}
								prefetch
							/>
						}
						size="sm"
						variant="ghost"
					>
						<IconCircleDot /> Issues
					</Button>
					<Button
						className="gap-2 text-muted-foreground"
						size="sm"
						variant="ghost"
					>
						<IconGitMerge /> Pull Requests
					</Button>
					<Button
						className="gap-2 text-muted-foreground"
						size="sm"
						variant="ghost"
					>
						<IconBuildingStore /> Marketplace
					</Button>
					<Button
						className="gap-2 text-muted-foreground"
						size="sm"
						variant="ghost"
					>
						<IconLayoutKanban /> Projects
					</Button>
					<Button
						className="gap-2 text-muted-foreground"
						size="sm"
						variant="ghost"
					>
						<IconShield /> Security
					</Button>
					<Button
						className="gap-2 text-muted-foreground"
						size="sm"
						variant="ghost"
					>
						<IconActivity /> Insights
					</Button>
				</div>
			</header>
			{children}
		</>
	);
}
