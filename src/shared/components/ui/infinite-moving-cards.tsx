import { cn } from "@lib/utils";
import React, { useCallback, useEffect, useState } from "react";

export const TestimonialCards = ({
	items,
	direction = "right",
	speed = "slow",
	pauseOnHover = true,
	className,
}: {
	items: {
		quote: string;
		name: string;
		rating: number;
		image: string;
	}[];
	direction?: "left" | "right";
	speed?: "fast" | "normal" | "slow";
	pauseOnHover?: boolean;
	className?: string;
}) => {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const scrollerRef = React.useRef<HTMLUListElement>(null);

	const getDirection = useCallback(() => {
		if (containerRef.current) {
			if (direction === "left") {
				containerRef.current.style.setProperty("--animation-direction", "forwards");
			} else {
				containerRef.current.style.setProperty("--animation-direction", "reverse");
			}
		}
	}, [direction]);

	const getSpeed = useCallback(() => {
		if (containerRef.current) {
			if (speed === "fast") {
				containerRef.current.style.setProperty("--animation-duration", "20s");
			} else if (speed === "normal") {
				containerRef.current.style.setProperty("--animation-duration", "40s");
			} else {
				containerRef.current.style.setProperty("--animation-duration", "80s");
			}
		}
	}, [speed]);

	const addAnimation = useCallback(() => {
		if (containerRef.current && scrollerRef.current) {
			const scrollerContent = Array.from(scrollerRef.current.children);

			scrollerContent.forEach((item) => {
				const duplicatedItem = item.cloneNode(true);
				if (scrollerRef.current) {
					scrollerRef.current.appendChild(duplicatedItem);
				}
			});

			getDirection();
			getSpeed();
			setStart(true);
		}
	}, [getDirection, getSpeed]);

	useEffect(() => {
		addAnimation();
	}, [addAnimation]);
	const [start, setStart] = useState(false);

	return (
		<div
			ref={containerRef}
			className={cn(
				"scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
				className
			)}
		>
			<ul
				ref={scrollerRef}
				className={cn(
					"flex w-full shrink-0 flex-nowrap gap-4 py-4",
					start && "animate-scroll",
					pauseOnHover && "hover:[animation-play-state:paused]"
				)}
			>
				{items.map((item, idx) => (
					<li
						key={item.name}
						className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-b-0 border-card bg-popover p-6"
					>
						<blockquote>
							<div
								aria-hidden="true"
								className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
							></div>
							<span className="relative z-20 text-lg leading-[1.6] text-card-foreground">
								{item.quote}
							</span>
							<div className="relative z-20 mt-4 flex flex-row items-center">
								<img
									src={item.image}
									alt={`${item.name}'s profile`}
									className="mr-4 h-12 w-12 rounded-full object-cover border border-card"
								/>
								<span className="flex flex-col">
									<span className="text-sm leading-[1.6] font-normal text-foreground">
										{item.name}
									</span>
									<div className="flex items-center">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className={`h-5 w-5 ${i < item.rating ? "fill-current text-primary" : "text-accent"}`}
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
								</span>
							</div>
						</blockquote>
					</li>
				))}
			</ul>
		</div>
	);
};
