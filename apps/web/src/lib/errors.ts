export class RateLimitError extends Error {
	resetAt: Date | null;

	constructor(resetAt?: number) {
		const resetDate = resetAt ? new Date(resetAt * 1000) : null;
		const message = resetDate
			? `GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}.`
			: "GitHub API rate limit exceeded.";
		super(message);
		this.name = "RateLimitError";
		this.resetAt = resetDate;
	}
}

export function isRateLimitResponse(error: unknown): boolean {
	if (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		(error.status === 403 || error.status === 429)
	) {
		const message =
			"message" in error && typeof error.message === "string"
				? error.message
				: "";
		return (
			error.status === 429 ||
			message.toLowerCase().includes("rate limit") ||
			message.toLowerCase().includes("api rate limit")
		);
	}
	return false;
}

export function throwIfRateLimit(error: unknown): void {
	if (isRateLimitResponse(error)) {
		const resetHeader =
			typeof error === "object" &&
			error !== null &&
			"response" in error &&
			typeof error.response === "object" &&
			error.response !== null &&
			"headers" in error.response &&
			typeof error.response.headers === "object" &&
			error.response.headers !== null &&
			"x-ratelimit-reset" in error.response.headers
				? Number(error.response.headers["x-ratelimit-reset"])
				: undefined;
		throw new RateLimitError(resetHeader);
	}
}
