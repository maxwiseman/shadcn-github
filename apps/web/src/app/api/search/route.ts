import { NextResponse } from "next/server";
import { searchRepositories } from "@/lib/github-rest";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q") ?? "";

	if (!query.trim()) {
		return NextResponse.json([]);
	}

	const results = await searchRepositories(query);
	return NextResponse.json(results);
}
