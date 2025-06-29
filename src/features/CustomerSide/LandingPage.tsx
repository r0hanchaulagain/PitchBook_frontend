import HeroSection from "@featureComponents/LandingPage/HeroSection";
import IntroSection from "@featureComponents/LandingPage/IntroSection";
import FeaturesSection from "@featureComponents/LandingPage/FeaturesSection";
import TestimonialsSection from "@featureComponents/LandingPage/TestimonialsSection";

const LandingPage = () => {
	return (
		<div className="relative">
			<HeroSection />
			<IntroSection />
			<FeaturesSection />
			<TestimonialsSection />
		</div>
	);
};

export default LandingPage;
