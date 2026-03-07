import { useTranslation } from "react-i18next";
import {
  Brain,
  BookOpen,
  Trophy,
  Sparkles,
  Users,
  Zap,
  Shield,
  Clock,
  BarChart3,
  Globe,
  Headphones,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";

interface BentoItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  span?: "default" | "wide" | "tall" | "large";
  stats?: { value: string; label: string };
}

const BentoCard = ({ item }: { item: BentoItem }) => {
  const spanClasses = {
    default: "",
    wide: "md:col-span-2",
    tall: "md:row-span-2",
    large: "md:col-span-2 md:row-span-2",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1",
        spanClasses[item.span || "default"],
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          item.gradient,
        )}
      />

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-30" />

      {/* Inner Border */}
      <div className="absolute inset-px rounded-xl bg-card/90 backdrop-blur-xl" />

      <CardContent className="relative flex h-full flex-col justify-between p-4 md:p-6">
        {/* Icon */}
        <div
          className={cn(
            "mb-3 md:mb-4 inline-flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-linear-to-br transition-all duration-300 group-hover:scale-110",
            item.gradient,
          )}
        >
          <span className="text-foreground [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-8 md:[&>svg]:w-8">
            {item.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="mb-1.5 md:mb-2 text-base md:text-xl font-bold text-foreground">
            {item.title}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Stats */}
        {item.stats && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {item.stats.value}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {item.stats.label}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Feature = () => {
  const { t } = useTranslation();

  const bentoItems: BentoItem[] = [
    {
      icon: <BookOpen />,
      title: t("home.features.studyMaterials.title"),
      description: t("home.features.studyMaterials.description"),
      gradient: "from-blue-500/20 to-cyan-500/20",
      span: "wide",
    },
    {
      icon: <Trophy />,
      title: t("home.features.quizBank.title"),
      description: t("home.features.quizBank.description"),
      gradient: "from-amber-500/20 to-orange-500/20",
      span: "default",
    },
    {
      icon: <Brain />,
      title: t("home.features.aiSupervisor.title"),
      description: t("home.features.aiSupervisor.description"),
      gradient: "from-purple-500/20 to-pink-500/20",
      span: "tall",
    },
    {
      icon: <Users />,
      title: t("home.features.community.title"),
      description: t("home.features.community.description"),
      gradient: "from-green-500/20 to-emerald-500/20",
      span: "default",
    },
    {
      icon: <BarChart3 />,
      title: t("home.features.progressTracking.title"),
      description: t("home.features.progressTracking.description"),
      gradient: "from-rose-500/20 to-red-500/20",
      span: "default",
    },
    {
      icon: <Globe />,
      title: t("home.features.universityNetwork.title"),
      description: t("home.features.universityNetwork.description"),
      gradient: "from-indigo-500/20 to-blue-500/20",
      span: "wide",
    },
  ];

  const features = [
    {
      icon: <Zap className="h-4 w-4 md:h-5 md:w-5" />,
      title: t("home.features.lightningFast.title"),
      description: t("home.features.lightningFast.description"),
    },
    {
      icon: <Shield className="h-4 w-4 md:h-5 md:w-5" />,
      title: t("home.features.securePrivate.title"),
      description: t("home.features.securePrivate.description"),
    },
    {
      icon: <Clock className="h-4 w-4 md:h-5 md:w-5" />,
      title: t("home.features.alwaysUpdated.title"),
      description: t("home.features.alwaysUpdated.description"),
    },
    {
      icon: <Headphones className="h-4 w-4 md:h-5 md:w-5" />,
      title: t("home.features.support247.title"),
      description: t("home.features.support247.description"),
    },
  ];

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute start-0 top-1/4 h-48 w-48 md:h-96 md:w-96 rounded-full bg-primary/10 blur-[80px] md:blur-[120px]" />
        <div className="absolute end-0 bottom-1/4 h-48 w-48 md:h-96 md:w-96 rounded-full bg-primary/10 blur-[80px] md:blur-[120px]" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 lg:mb-16 text-center">
          <Badge
            variant="secondary"
            className="mb-3 md:mb-4 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium"
          >
            <Sparkles className="me-1.5 md:me-2 h-3 w-3 md:h-4 md:w-4" />
            {t("home.features.sectionBadge")}
          </Badge>
          <h2 className="mb-3 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {t("home.features.sectionTitle")}
            <span className="block mt-1 md:mt-2 bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {t("home.features.sectionTitleHighlight")}
            </span>
          </h2>
          <p className="mx-auto max-w-xl md:max-w-2xl text-sm md:text-base lg:text-lg text-muted-foreground px-2">
            {t("home.features.sectionDescription")}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 lg:gap-6">
          {bentoItems.map((item, index) => (
            <BentoCard key={index} item={item} />
          ))}
        </div>

        {/* Mini Features */}
        <div className="mt-8 md:mt-12 lg:mt-16 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center gap-2 md:gap-3 rounded-xl md:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 md:p-4 lg:p-6 text-center transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
            >
              <div className="flex h-9 w-9 md:h-10 lg:h-12 md:w-10 lg:w-12 items-center justify-center rounded-lg md:rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                {feature.icon}
              </div>
              <h4 className="text-xs md:text-sm lg:text-base font-semibold text-foreground">
                {feature.title}
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed hidden sm:block">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
