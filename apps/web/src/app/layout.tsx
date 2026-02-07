import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
// import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "shadcn-github - Explore GitHub Repositories",
		template: "%s | shadcn-github",
	},
	description:
		"Browse and explore GitHub repositories with syntax-highlighted code preview, pull requests, issues, and detailed repository information. Built with Next.js and shadcn/ui.",
	keywords: [
		"github",
		"repository",
		"browser",
		"code",
		"preview",
		"pull requests",
		"issues",
		"nextjs",
		"shadcn",
	],
	authors: [{ name: "shadcn-github" }],
	creator: "shadcn-github",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://shadcn-github.vercel.app",
		title: "shadcn-github - Explore GitHub Repositories",
		description:
			"Browse and explore GitHub repositories with syntax-highlighted code preview, pull requests, issues, and detailed repository information.",
		siteName: "shadcn-github",
	},
	twitter: {
		card: "summary_large_image",
		title: "shadcn-github - Explore GitHub Repositories",
		description:
			"Browse and explore GitHub repositories with syntax-highlighted code preview, pull requests, issues, and detailed repository information.",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					{/*<Header />*/}
					{children}
				</Providers>
			</body>
		</html>
	);
}
