import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/ui/badge";
import { UserPlus, Search, BookOpen, Trophy, ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <UserPlus className="h-5 w-5 md:h-6 md:w-6" />,
      number: t("home.howItWorks.steps.createAccount.number"),
      title: t("home.howItWorks.steps.createAccount.title"),
      description: t("home.howItWorks.steps.createAccount.description"),
    },
    {
      icon: <Search className="h-5 w-5 md:h-6 md:w-6" />,
      number: t("home.howItWorks.steps.findCourses.number"),
      title: t("home.howItWorks.steps.findCourses.title"),
      description: t("home.howItWorks.steps.findCourses.description"),
    },
    {
      icon: <BookOpen className="h-5 w-5 md:h-6 md:w-6" />,
      number: t("home.howItWorks.steps.accessMaterials.number"),
      title: t("home.howItWorks.steps.accessMaterials.title"),
      description: t("home.howItWorks.steps.accessMaterials.description"),
    },
    {
      icon: <Trophy className="h-5 w-5 md:h-6 md:w-6" />,
      number: t("home.howItWorks.steps.succeed.number"),
      title: t("home.howItWorks.steps.succeed.title"),
      description: t("home.howItWorks.steps.succeed.description"),
    },
  ];

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-linear-to-b from-background to-primary/5">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-1/2 bottom-0 h-px w-[80%] -translate-x-1/2 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 lg:mb-16 text-center">
          <Badge
            variant="secondary"
            className="mb-3 md:mb-4 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium"
          >
            {t("home.howItWorks.badge")}
          </Badge>
          <h2 className="mb-3 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {t("home.howItWorks.title")}
            <span className="ms-2 md:ms-3 bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {t("home.howItWorks.titleHighlight")}
            </span>
          </h2>
          <p className="mx-auto max-w-xl md:max-w-2xl text-sm md:text-base lg:text-lg text-muted-foreground px-2">
            {t("home.howItWorks.description")}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="absolute left-0 right-0 top-1/2 hidden h-0.5 -translate-y-1/2 bg-linear-to-r from-transparent via-primary/30 to-transparent lg:block" />

          <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="group relative">
                {/* Arrow - Desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute -end-2 md:-end-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <ArrowRight className="h-4 w-4 md:h-6 md:w-6 text-primary/50 rtl:rotate-180" />
                  </div>
                )}

                <div className="relative flex flex-col items-center text-center">
                  {/* Step Number */}
                  <div className="relative mb-3 md:mb-4 lg:mb-6">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Circle */}
                    <div className="relative flex h-14 w-14 md:h-16 lg:h-20 md:w-16 lg:w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-card transition-all duration-500 group-hover:border-primary group-hover:scale-110">
                      {/* Inner Circle */}
                      <div className="flex h-10 w-10 md:h-11 lg:h-14 md:w-11 lg:w-14 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/10 text-primary transition-all duration-500 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground">
                        {step.icon}
                      </div>

                      {/* Step Number Badge */}
                      <div className="absolute -end-1 md:-end-2 -top-1 md:-top-2 flex h-6 w-6 md:h-7 lg:h-8 md:w-7 lg:w-8 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-bold text-primary-foreground shadow-lg">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="mb-1.5 md:mb-2 lg:mb-3 text-sm md:text-base lg:text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-[200px] md:max-w-[250px] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
