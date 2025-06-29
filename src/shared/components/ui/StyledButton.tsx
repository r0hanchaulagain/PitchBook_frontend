//TODO:remove the tscheck
// @ts-nocheck
import { useState } from "react";

interface StyledButtonProps {
	children: React.ReactNode;
	shadowClassName?: string;
	buttonClassName?: string;
	onClick: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

const StyledButton: React.FC<StyledButtonProps> = ({
	children,
	shadowClassName = "",
	buttonClassName = "",
	onClick,
	onMouseEnter,
	onMouseLeave,
}) => {
	const [isClicked, setIsClicked] = useState(false);

	const handleClick = (e) => {
		setIsClicked(!isClicked);
		if (onClick) {
			onClick(e);
		}
	};

	return (
		<div className={`button-container relative inline-block ${shadowClassName}`}>
			<button
				className={`relative z-10 rounded-none border-2 border-white bg-black font-sans text-lg text-white transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:scale-105 hover:bg-white hover:text-black hover:shadow-[0_4px_12px_rgba(255,255,255,0.3)] ${isClicked ? "click-animate" : ""} ${buttonClassName}`}
				onClick={handleClick}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				{children}
			</button>
			<div
				className={`shadow-border absolute inset-0 z-0 rounded-none border-2 border-white ${isClicked ? "shadow-animate" : ""}`}
			></div>
		</div>
	);
};

export default StyledButton;
