"use client";

import { File } from "@pierre/diffs/react";

export function FileViewer({
	filename,
	content,
}: {
	filename: string;
	content: string;
}) {
	return (
		<File
			file={{ name: filename, contents: content }}
			options={{
				theme: {
					light: "github-light",
					dark: "github-dark-default",
				},
				overflow: "scroll",
			}}
		/>
	);
}
