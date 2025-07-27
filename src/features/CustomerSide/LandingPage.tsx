import HeroSection from "@featureComponents/LandingPage/HeroSection";
import IntroSection from "@featureComponents/LandingPage/IntroSection";
import FeaturesSection from "@featureComponents/LandingPage/FeaturesSection";
import TestimonialsSection from "@featureComponents/LandingPage/TestimonialsSection";
import FAQSection from "@featureComponents/LandingPage/FAQSection";

const LandingPage = () => {
  return (
    <div className="relative">
      <HeroSection />
      <IntroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
    </div>
  );
};

export default LandingPage;
