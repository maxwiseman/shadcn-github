/** biome-ignore-all lint/a11y/noSvgWithoutTitle: It's the OG image -- accessibility is not important here */
/** biome-ignore-all lint/performance/noImgElement: you can't use next/image here */
import { ImageResponse } from "next/og";
import { fetchRepoInfo } from "@/lib/github-rest";

export const runtime = "edge";
export const alt = "Repository on shadcn-github";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}:wght@600&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(
		// biome-ignore lint/performance/useTopLevelRegex: This is just for image generation -- performance is not critical here
		/src: url\((.+)\) format\('(opentype|truetype)'\)/
	);

	if (resource) {
		const response = await fetch(resource[1]);
		if (response.status === 200) {
			return await response.arrayBuffer();
		}
	}
	throw new Error("failed to load font data");
}

export default async function Image({
	params: paramsPromise,
}: {
	params: Promise<{ username: string; repo: string }>;
}) {
	const params = await paramsPromise;
	const repo = await fetchRepoInfo(params.username, params.repo);

	const repoName = repo?.name || params.repo;
	const description = repo?.description || "Explore this repository on GitHub";
	const stars = repo?.stargazers_count || 0;
	const language = repo?.language || "Code";
	const avatarUrl = repo?.owner.avatar_url;

	// Prepare text for font loading (all unique characters)
	const text = `${params.username}${repoName}${description}${stars.toLocaleString()}${language}stars`;

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "space-between",
				backgroundColor: "#09090b",
				padding: "80px",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "24px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "24px",
					}}
				>
					{avatarUrl ? (
						<img
							alt={params.username}
							height="80"
							src={avatarUrl}
							style={{
								borderRadius: "50%",
								border: "2px solid #27272a",
							}}
							width="80"
						/>
					) : (
						<svg
							fill="none"
							height="80"
							stroke="white"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="1.5"
							viewBox="0 0 24 24"
							width="80"
						>
							<path d="M8.5 16.5C7.5 18.5 3.5 18.5 2.5 16.5C1.5 14.5 1.5 12.5 2.5 10.5C3.5 8.5 7.5 8.5 8.5 10.5" />
							<path d="M15.5 7.5C16.5 5.5 20.5 5.5 21.5 7.5C22.5 9.5 22.5 11.5 21.5 13.5C20.5 15.5 16.5 15.5 15.5 13.5" />
							<path d="M8 12L16 12" />
							<path d="M8 12C8 15 10 17 12 17" />
							<path d="M16 12C16 9 14 7 12 7" />
						</svg>
					)}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<span
							style={{
								fontSize: "24px",
								fontFamily: "Geist",
								color: "#a1a1aa",
								margin: 0,
							}}
						>
							{params.username}
						</span>
						<h1
							style={{
								fontSize: "56px",
								fontWeight: 600,
								fontFamily: "Geist",
								color: "white",
								margin: 0,
								lineHeight: 1.1,
							}}
						>
							{repoName}
						</h1>
					</div>
				</div>
				<p
					style={{
						fontSize: "28px",
						fontFamily: "Geist",
						color: "#a1a1aa",
						margin: 0,
						maxWidth: "900px",
						lineHeight: 1.4,
					}}
				>
					{description}
				</p>
			</div>
			<div
				style={{
					display: "flex",
					gap: "32px",
					alignItems: "center",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
					}}
				>
					<svg
						fill="none"
						height="24"
						stroke="#a1a1aa"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
						width="24"
					>
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
					</svg>
					<span
						style={{
							fontSize: "24px",
							fontFamily: "Geist",
							color: "#a1a1aa",
						}}
					>
						{stars.toLocaleString()} stars
					</span>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
					}}
				>
					<div
						style={{
							width: "16px",
							height: "16px",
							borderRadius: "50%",
							backgroundColor: "#3b82f6",
						}}
					/>
					<span
						style={{
							fontSize: "24px",
							fontFamily: "Geist",
							color: "#a1a1aa",
						}}
					>
						{language}
					</span>
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Geist",
					data: await loadGoogleFont("Geist", text),
					style: "normal",
					weight: 600,
				},
			],
		}
	);
}
