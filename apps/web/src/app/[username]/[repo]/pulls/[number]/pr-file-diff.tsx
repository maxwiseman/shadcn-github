"use client";

import { PatchDiff } from "@pierre/diffs/react";

export function PrFileDiff({
	patch,
	filename,
}: {
	patch: string;
	filename: string;
}) {
	// Build a proper unified diff header so PatchDiff can detect the language
	const fullPatch = `--- a/${filename}\n+++ b/${filename}\n${patch}`;

	return (
		<PatchDiff
			options={{
				diffStyle: "unified",
				disableFileHeader: true,
				theme: {
					light: "github-light",
					dark: "github-dark-default",
				},
				overflow: "scroll",
			}}
			patch={fullPatch}
		/>
	);
}
