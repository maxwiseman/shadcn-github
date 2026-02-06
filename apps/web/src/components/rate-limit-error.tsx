"use client";

import { IconClockPause, IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Invertocat } from "@/components/invertocat";
import { Button } from "@/components/ui/button";

function useCountdown(resetAt: Date | null): string | null {
	const [timeLeft, setTimeLeft] = useState<string | null>(null);

	useEffect(() => {
		if (!resetAt) {
			return;
		}

		function update() {
			const now = Date.now();
			const diff = (resetAt as Date).getTime() - now;
			if (diff <= 0) {
				setTimeLeft(null);
				return;
			}
			const minutes = Math.floor(diff / 60_000);
			const seconds = Math.floor((diff % 60_000) / 1000);
			setTimeLeft(minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`);
		}

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [resetAt]);

	return timeLeft;
}

export function RateLimitErrorPage({ resetAt }: { resetAt?: string | null }) {
	const router = useRouter();
	const resetDate = resetAt ? new Date(resetAt) : null;
	const timeLeft = useCountdown(resetDate);

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
			<div className="flex max-w-md flex-col items-center gap-6 text-center">
				<div className="flex items-center justify-center rounded-full border bg-muted p-4">
					<IconClockPause
						className="size-8 text-muted-foreground"
						stroke={1.5}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-xl tracking-tight">
						Rate limit exceeded
					</h1>
					<p className="text-muted-foreground text-sm leading-relaxed">
						GitHub&apos;s API has a limited number of requests per hour.
						We&apos;ve hit that limit for now.
					</p>
				</div>
				{timeLeft ? (
					<div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 font-mono text-sm">
						<span className="text-muted-foreground">Resets in</span>
						<span className="font-medium">{timeLeft}</span>
					</div>
				) : null}
				<div className="flex gap-3">
					<Button onClick={() => router.push("/")} variant="outline">
						<Invertocat className="size-4" />
						Go home
					</Button>
					<Button onClick={() => router.refresh()}>
						<IconRefresh className="size-4" />
						Try again
					</Button>
				</div>
			</div>
		</div>
	);
}
