import React, { useRef, useState } from "react";
import { MapPin, Calendar, Users, CreditCard } from "lucide-react";

const features = [
	{
		title: "Find Nearby Futsal Grounds",
		description:
			"Easily locate futsal courts near you with filters for location, reviews, and pricing.",
		icon: (
			<MapPin className="mx-auto mb-2 h-8 w-8 transition-transform duration-300 group-hover:scale-150" />
		),
	},
	{
		title: "Flexible Booking Options",
		description:
			"Choose your preferred date and time slot, or book half a court and get matched with others.",
		icon: (
			<Calendar className="mx-auto mb-2 h-8 w-8 transition-transform duration-300 group-hover:scale-150" />
		),
	},
	{
		title: "Smart Player Matching",
		description:
			"Split the court with other players looking for a half-court game, just like a futsal clash!",
		icon: (
			<Users className="mx-auto mb-2 h-8 w-8 transition-transform duration-300 group-hover:scale-150" />
		),
	},
	{
		title: "Secure Digital Payments",
		description:
			"Pay for your reservation quickly and safely with our seamless online payment system.",
		icon: (
			<CreditCard className="mx-auto mb-2 h-8 w-8 transition-transform duration-300 group-hover:scale-150" />
		),
	},
];

const FeaturesSection: React.FC = () => {
	const sectionRef = useRef<HTMLDivElement>(null);
	const [borderStyle, setBorderStyle] = useState({
		width: 0,
		height: 0,
		left: 0,
		top: 0,
		opacity: 0,
		scale: 1,
	});

	const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
		const targetCard = e.currentTarget;
		if (!sectionRef.current) return;

		const gap = 7;
		const rect = targetCard.getBoundingClientRect();
		const sectionRect = sectionRef.current.getBoundingClientRect();

		setBorderStyle({
			width: rect.width + 2 * gap,
			height: rect.height + 2 * gap,
			left: rect.left - sectionRect.left - gap,
			top: rect.top - sectionRect.top - gap,
			opacity: 1,
			scale: 1.05, // Scale border to match card
		});
	};

	const handleSectionMouseLeave = () => {
		setBorderStyle((prev) => ({
			...prev,
			opacity: 0,
			scale: 1,
		}));
	};

	return (
		<section className="flex w-full flex-col items-center justify-center gap-12 py-10 md:py-12">
			<h1 className="text-3xl font-bold sm:text-5xl">Why SoccerSlot?</h1>
			<div
				ref={sectionRef}
				className="relative mx-auto flex max-w-[90%] flex-wrap items-center justify-center gap-6 py-8"
				onMouseLeave={handleSectionMouseLeave}
			>
				{features.map((feature, idx) => (
					<div
						key={feature.title}
						className="group relative z-10 box-border w-full min-w-[200px] cursor-pointer rounded-md bg-primary-foreground p-6 py-10 text-center shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground sm:w-[calc(50%-1.5rem)] md:w-[calc(33.33%-1.5rem)] lg:w-[calc(25%-1.5rem)]"
						onMouseEnter={handleMouseEnter}
						onClick={() => console.log("clicked", idx)}
					>
						{feature.icon}
						<h3 className="mb-2 text-lg font-semibold transition-transform duration-300 group-hover:scale-115">
							{feature.title}
						</h3>
						<p className="text-sm">{feature.description}</p>
					</div>
				))}
				<div
					style={{
						width: `${borderStyle.width}px`,
						height: `${borderStyle.height}px`,
						left: `${borderStyle.left}px`,
						top: `${borderStyle.top}px`,
						opacity: borderStyle.opacity,
						transform: `scale(${borderStyle.scale})`,
						transformOrigin: "center",
					}}
					className="pointer-events-none absolute z-20 box-border rounded-md border-[3px] border-primary transition-all duration-300"
				/>
			</div>
		</section>
	);
};

export default FeaturesSection;
