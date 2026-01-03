"use client";

import type React from "react";

import { fetchMoviesBySearchAction } from "@/app/actions";
import { useDebounce } from "@/hooks/use-debounce";
import type { Movie } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState<Movie[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const debouncedSearch = useDebounce(searchQuery, 300);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (debouncedSearch.trim().length > 1) {
				const results = await fetchMoviesBySearchAction(
					debouncedSearch,
					1
				);
				setSuggestions(results.slice(0, 7));
				setShowSuggestions(true);
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		};

		fetchSuggestions();
	}, [debouncedSearch]);

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
			setSearchQuery("");
			setShowSuggestions(false);
		}
	};

	const handleSuggestionClick = (movieId: number) => {
		router.push(`/movie/${movieId}`);
		setSearchQuery("");
		setShowSuggestions(false);
	};

	const navLinks = [
		{ label: "Home", href: "/" },
		{ label: "Genres", href: "/genres" },
	];

	return (
		<nav className="sticky top-0 z-50 bg-background border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link
						href="/"
						className="flex-shrink-0 font-bold text-xl text-primary hover:text-accent transition-all duration-300 ease-in-out">
						Free Streaming
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-8">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-foreground hover:text-primary transition-all duration-300 ease-in-out">
								{link.label}
							</Link>
						))}
					</div>

					{/* Search Bar */}
					<div
						className="hidden sm:flex flex-1 max-w-xs mx-4 lg:mx-8 relative"
						ref={searchRef}>
						<form
							onSubmit={handleSearch}
							className="w-full">
							<div className="w-full relative">
								<input
									type="text"
									placeholder="Search movies..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									onFocus={() => {
										if (suggestions.length > 0)
											setShowSuggestions(true);
									}}
									className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 ease-in-out"
								/>
								<button
									type="submit"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out">
									<Search size={18} />
								</button>
							</div>
						</form>

						{/* Search Suggestions Dropdown */}
						{showSuggestions && suggestions.length > 0 && (
							<div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
								{suggestions.map((movie) => (
									<div
										key={movie.id}
										onClick={() =>
											handleSuggestionClick(movie.id)
										}
										className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-colors border-b border-border last:border-0">
										<div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-muted">
											<Image
												src={
													getImageUrl(
														movie.poster_path,
														"w92"
													) || "/placeholder.svg"
												}
												alt={movie.title}
												fill
												className="object-cover"
												sizes="40px"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="text-sm font-medium text-foreground truncate">
												{movie.title}
											</h4>
											<p className="text-xs text-muted-foreground">
												{new Date(
													movie.release_date
												).getFullYear() || "N/A"}{" "}
												•{" "}
												{movie.vote_average.toFixed(1)}{" "}
												★
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="md:hidden p-2 hover:bg-card rounded-lg transition-all duration-300 ease-in-out">
						{isOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Menu */}
				{isOpen && (
					<div className="md:hidden border-t border-border p-4 space-y-4 animate-in slide-in-from-top-5 duration-300">
						<form onSubmit={handleSearch}>
							<div className="relative">
								<input
									type="text"
									placeholder="Search movies..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-base"
								/>
								<button
									type="submit"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary p-2">
									<Search size={20} />
								</button>
							</div>
						</form>
						<div className="space-y-2">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="block px-4 py-3 text-lg text-foreground hover:bg-card rounded-lg transition-all duration-300 ease-in-out"
									onClick={() => setIsOpen(false)}>
									{link.label}
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
