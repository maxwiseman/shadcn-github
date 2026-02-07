import { auth } from "@shadcn-github/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Dashboard from "./dashboard";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Your shadcn-github dashboard",
};

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session.user.name}</p>
			<Dashboard session={session} />
		</div>
	);
}
