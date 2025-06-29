import StyledButton from "@ui/StyledButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
	const navigate = useNavigate();
	const [isHovered, setIsHovered] = useState(false);


	return (
		<div className="relative isolate min-h-[90vh] overflow-hidden">
			<div className="absolute inset-0 z-10 flex flex-col flex-wrap items-center justify-center gap-5 bg-black/60 text-white sm:block">
				<span className="relative flex flex-col text-[calc(6vw+1em)] font-extrabold sm:absolute sm:top-[20%] sm:left-4">
					Looking for
					<br />
					Futsals
				</span>
				<div className="z-20 sm:absolute sm:top-[calc(19vw+13rem)] sm:left-[1%]">
					<StyledButton
						buttonClassName="text-[calc(1vw+0.5rem)] px-5 py-0 font-extrabold"
						onClick={() => navigate("/futsals")}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<div className="flex items-center">
							<img
								className="h-[calc(5vw+2rem)] w-[calc(5vw+2rem)]"
								src={isHovered ? "/images/logo/Logo.png" : "/images/logo/DarkLogo.png"}
								alt="Logo"
							/>
							Let's find some futsals
						</div>
					</StyledButton>
				</div>
			</div>
			<video
				className="absolute min-h-[90vh] w-full overflow-hidden object-cover"
				src="/videos/landing_video.mp4"
				autoPlay
				muted
				loop
			></video>
		</div>
	);
};

export default HeroSection;
