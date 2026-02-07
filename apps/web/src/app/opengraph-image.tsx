/** biome-ignore-all lint/a11y/noSvgWithoutTitle: It's the OG image -- accessibility is not important here */
/** biome-ignore-all lint/performance/noImgElement: you can't use next/image here */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "shadcn-github - Explore GitHub Repositories";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}:wght@600&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(
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

export default async function Image() {
	const text = "shadcn-github Explore GitHub Repositories";

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#09090b",
				padding: "80px",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "32px",
				}}
			>
				<svg
					fill="none"
					height="96"
					stroke="white"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					viewBox="0 0 24 24"
					width="96"
				>
					<path d="M8.5 16.5C7.5 18.5 3.5 18.5 2.5 16.5C1.5 14.5 1.5 12.5 2.5 10.5C3.5 8.5 7.5 8.5 8.5 10.5" />
					<path d="M15.5 7.5C16.5 5.5 20.5 5.5 21.5 7.5C22.5 9.5 22.5 11.5 21.5 13.5C20.5 15.5 16.5 15.5 15.5 13.5" />
					<path d="M8 12L16 12" />
					<path d="M8 12C8 15 10 17 12 17" />
					<path d="M16 12C16 9 14 7 12 7" />
				</svg>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "16px",
					}}
				>
					<h1
						style={{
							fontSize: "72px",
							fontWeight: 600,
							fontFamily: "Geist",
							color: "white",
							margin: 0,
							textAlign: "center",
						}}
					>
						shadcn-github
					</h1>
					<p
						style={{
							fontSize: "32px",
							fontFamily: "Geist",
							color: "#a1a1aa",
							margin: 0,
							textAlign: "center",
						}}
					>
						Explore GitHub Repositories
					</p>
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
