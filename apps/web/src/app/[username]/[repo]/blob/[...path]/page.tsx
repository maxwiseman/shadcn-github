import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { fetchFileContent, fetchRepoInfo } from "@/lib/github-rest";
import { FileViewer } from "./file-viewer";

export const revalidate = 3600;

export async function generateMetadata({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string; path: string[] }>;
}): Promise<Metadata> {
	const params = await paramsPromise;
	const [, ...pathSegments] = params.path;
	const filePath = pathSegments.join("/");
	const fileName = pathSegments.at(-1) ?? filePath;

	return {
		title: fileName,
		description: `${filePath} in ${params.username}/${params.repo}`,
	};
}

export default async function BlobPage({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string; path: string[] }>;
}) {
	const params = await paramsPromise;
	const [ref, ...pathSegments] = params.path;
	const filePath = pathSegments.join("/");

	const [repo, content] = await Promise.all([
		fetchRepoInfo(params.username, params.repo),
		fetchFileContent(params.username, params.repo, filePath, ref),
	]);

	if (content === null) {
		notFound();
	}

	const fileName = pathSegments.at(-1) ?? filePath;
	const defaultBranch = repo?.default_branch ?? ref ?? "main";

	return (
		<div className="flex flex-col gap-4 py-6">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink
							href={
								`/${params.username}/${params.repo}` as `/${string}/${string}`
							}
						>
							{params.repo}
						</BreadcrumbLink>
					</BreadcrumbItem>
					{pathSegments.map((segment, index) => {
						const isLast = index === pathSegments.length - 1;
						const segmentPath = pathSegments.slice(0, index + 1).join("/");
						return (
							<span className="contents" key={segmentPath}>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									{isLast ? (
										<BreadcrumbPage>{segment}</BreadcrumbPage>
									) : (
										<BreadcrumbLink
											href={
												`/${params.username}/${params.repo}/blob/${defaultBranch}/${segmentPath}` as `/${string}/${string}/blob/${string}/${string}`
											}
										>
											{segment}
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
							</span>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
			<Card className="overflow-hidden p-0">
				{/*<CardHeader className="border-b px-4 py-2 font-mono text-sm">
					{fileName}
				</CardHeader>*/}
				<CardContent className="p-0">
					<FileViewer content={content} filename={fileName} />
				</CardContent>
			</Card>
		</div>
	);
}
