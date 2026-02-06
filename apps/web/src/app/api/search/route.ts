import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo";
import { searchRepositories } from "@/lib/github-rest";

export async function GET(request: Request) {
	if (isDemoMode()) {
		return NextResponse.json([]);
	}

	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q") ?? "";

	if (!query.trim()) {
		return NextResponse.json([]);
	}

	const results = await searchRepositories(query);
	return NextResponse.json(results);
}
