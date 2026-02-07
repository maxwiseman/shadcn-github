"use server";

import { fetchFileContent } from "@/lib/github-rest";

export async function getFileContent(
	owner: string,
	repo: string,
	path: string,
	ref?: string
): Promise<string | null> {
	const content = await fetchFileContent(owner, repo, path, ref);
	return content;
}
