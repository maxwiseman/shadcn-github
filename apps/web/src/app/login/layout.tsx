import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login",
	description: "Sign in to your shadcn-github account or create a new one",
};

export default function LoginLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
