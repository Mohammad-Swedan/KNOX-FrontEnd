import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Brain,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90dvh] md:min-h-dvh overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

        {/* Animated Gradient Orbs - Smaller on mobile */}
        <div className="absolute -left-20 md:-left-40 -top-20 md:-top-40 h-40 md:h-80 w-40 md:w-80 animate-pulse rounded-full bg-primary/30 blur-[60px] md:blur-[100px]" />
        <div className="absolute -right-20 md:-right-40 top-1/4 h-48 md:h-96 w-48 md:w-96 animate-pulse rounded-full bg-primary/20 blur-[80px] md:blur-[120px] delay-1000" />
        <div className="absolute bottom-0 left-1/3 h-36 md:h-72 w-36 md:w-72 animate-pulse rounded-full bg-primary/25 blur-[50px] md:blur-[80px] delay-500" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-size-[2rem_2rem] md:bg-size-[4rem_4rem]" />

        {/* Radial Fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />
      </div>

      {/* Floating Elements - Hidden on small mobile, smaller on tablet */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute start-[10%] top-[20%] animate-float">
          <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <BookOpen className="h-5 w-5 md:h-7 md:w-7 text-primary" />
          </div>
        </div>
        <div className="absolute end-[15%] top-[25%] animate-float delay-1000">
          <div className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <Brain className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </div>
        </div>
        <div className="absolute start-[20%] bottom-[25%] animate-float delay-500">
          <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
        </div>
        <div className="absolute end-[20%] bottom-[30%] animate-float delay-700">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-[90dvh] md:min-h-dvh flex-col items-center justify-center px-3 sm:px-4 pt-12 pb-16 md:pt-16 md:pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Announcement Badge */}
          <div className="mb-4 md:mb-8 inline-flex animate-fade-in">
            <div className="group relative inline-flex items-center gap-2 md:gap-3 rounded-full border border-primary/20 bg-background/80 backdrop-blur-xl px-3 py-1.5 md:px-4 md:py-2 shadow-lg shadow-primary/5 transition-all hover:border-primary/40 hover:shadow-primary/10">
              <span className="absolute inset-0 rounded-full bg-linear-to-r from-primary/10 via-transparent to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <Badge className="bg-primary text-primary-foreground border-0 px-2 py-0.5 md:px-2.5 text-xs md:text-sm">
                <Sparkles className="me-1 h-3 w-3" />
                {t("home.hero.badge.new")}
              </Badge>
              <span className="text-xs md:text-sm font-medium text-foreground">
                {t("home.hero.badge.text")}
              </span>
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight animate-fade-in-up">
            <span className="block text-foreground">
              {t("home.hero.title.part1")}
            </span>
            <span className="relative mt-1 md:mt-2 block">
              <span className="bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {t("home.hero.title.part2")}
              </span>
              {/* Animated Underline */}
              <span className="absolute -bottom-1 md:-bottom-2 left-1/2 h-0.5 md:h-1 w-0 -translate-x-1/2 rounded-full bg-linear-to-r from-transparent via-primary to-transparent animate-expand-width" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-6 md:mb-10 max-w-xl md:max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground animate-fade-in-up delay-200 px-2">
            {t("home.hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-fade-in-up delay-300 px-4 sm:px-0">
            <Button
              size="lg"
              className="group relative w-full sm:w-auto overflow-hidden bg-primary px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
              onClick={() => navigate("/register")}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t("home.hero.cta.getStarted")}
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
              </span>
              <span className="absolute inset-0 bg-linear-to-r from-primary via-primary/90 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group w-full sm:w-auto px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold backdrop-blur-sm transition-all hover:bg-primary/5 hover:scale-105"
              onClick={() => navigate("/materials")}
            >
              <Play className="me-2 h-4 w-4 md:h-5 md:w-5" />
              {t("home.hero.cta.watchDemo")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
