"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconSearch, IconStar } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { RepoSearchResult } from "@/lib/github-rest";

export function RepoSearch() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<RepoSearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [prefetchedUrl, setPrefetchedUrl] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
	const router = useRouter();

	const fetchResults = useCallback(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setResults([]);
			setIsOpen(false);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch(
				`/api/search?q=${encodeURIComponent(searchQuery)}`
			);
			const data: RepoSearchResult[] = await res.json();
			setResults(data);
			setIsOpen(data.length > 0);
			setActiveIndex(-1);
		} catch {
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		debounceRef.current = setTimeout(() => {
			fetchResults(query);
		}, 300);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [query, fetchResults]);

	// Prefetch the top result
	useEffect(() => {
		if (results.length > 0) {
			const topResult = results[0];
			const url = `/${topResult.full_name}`;
			if (url !== prefetchedUrl) {
				router.prefetch(url);
				setPrefetchedUrl(url);
			}
		}
	}, [results, router, prefetchedUrl]);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function navigateToResult(result: RepoSearchResult) {
		setIsOpen(false);
		setQuery("");
		router.push(`/${result.full_name}`);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!isOpen || results.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setActiveIndex((prev) =>
					prev < results.length - 1 ? prev + 1 : 0
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setActiveIndex((prev) =>
					prev > 0 ? prev - 1 : results.length - 1
				);
				break;
			case "Enter":
				e.preventDefault();
				if (activeIndex >= 0 && activeIndex < results.length) {
					navigateToResult(results[activeIndex]);
				} else if (results.length > 0) {
					navigateToResult(results[0]);
				}
				break;
			case "Escape":
				setIsOpen(false);
				inputRef.current?.blur();
				break;
		}
	}

	const formatStars = (count: number) => {
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}k`;
		}
		return count.toString();
	};

	return (
		<div ref={containerRef} className="relative w-full max-w-xl">
			<div className="relative">
				<IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					ref={inputRef}
					className="h-11 pl-9 pr-4 text-base"
					placeholder="Search repositories..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => {
						if (results.length > 0) setIsOpen(true);
					}}
					onKeyDown={handleKeyDown}
					role="combobox"
					aria-expanded={isOpen}
					aria-controls="search-results"
					aria-activedescendant={
						activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
					}
					autoComplete="off"
				/>
			</div>

			{isOpen && (
				<div
					id="search-results"
					role="listbox"
					className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
				>
					{isLoading ? (
						<div className="flex flex-col gap-3 p-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3">
									<Skeleton className="size-6 rounded-full" />
									<div className="flex flex-1 flex-col gap-1.5">
										<Skeleton className="h-4 w-2/3" />
										<Skeleton className="h-3 w-full" />
									</div>
								</div>
							))}
						</div>
					) : (
						<ul className="flex flex-col py-1">
							{results.map((result, index) => (
								<li
									key={result.id}
									id={`search-result-${index}`}
									role="option"
									aria-selected={activeIndex === index}
								>
									<Link
										href={`/${result.full_name}`}
										className={`flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent ${
											activeIndex === index ? "bg-accent" : ""
										}`}
										onClick={() => {
											setIsOpen(false);
											setQuery("");
										}}
									>
										<Avatar size="sm">
											<AvatarImage
												src={result.owner.avatar_url}
												alt={result.owner.login}
											/>
											<AvatarFallback>
												{result.owner.login.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex min-w-0 flex-1 flex-col">
											<span className="truncate font-medium text-foreground text-sm">
												{result.full_name}
											</span>
											{result.description && (
												<span className="truncate text-muted-foreground text-xs">
													{result.description}
												</span>
											)}
										</div>
										<span className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
											<IconStar className="size-3.5" />
											{formatStars(result.stargazers_count)}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
