"use client";

import { RateLimitErrorPage } from "@/components/rate-limit-error";

const RESET_AT_PATTERN = /Resets at (.+)\./;

export default function RepoError({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const isRateLimit = error.message?.includes("rate limit");
	const resetMatch = error.message?.match(RESET_AT_PATTERN);
	const resetAt = resetMatch?.[1] ?? null;

	if (isRateLimit) {
		return <RateLimitErrorPage resetAt={resetAt} />;
	}

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
			<div className="flex max-w-md flex-col items-center gap-4 text-center">
				<h1 className="font-semibold text-xl tracking-tight">
					Something went wrong
				</h1>
				<p className="text-muted-foreground text-sm">
					An unexpected error occurred while loading this repository.
				</p>
			</div>
		</div>
	);
}
