import { useTranslation } from "react-i18next";
import HeroSection from "@/features/home/components/HeroSection";
import { Feature } from "@/features/home/components/Feature";
import HowItWorksSection from "@/features/home/components/HowItWorksSection";
import StatsSection from "@/features/home/components/StatsSection";
import TestimonialsSection from "@/features/home/components/TestimonialsSection";
import CTASection from "@/features/home/components/CTASection";
import SEO from "@/shared/components/seo/SEO";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t("seo.home.title")}
        description={t("seo.home.description")}
        keywords={t("seo.home.keywords")}
        url="https://uni-hub.com/"
      />
      <div className="relative">
        <HeroSection />
        <Feature />
        <StatsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </>
  );
}
