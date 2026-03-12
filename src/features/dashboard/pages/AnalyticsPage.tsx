import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  BuildingIcon,
  ClipboardListIcon,
  FileTextIcon,
  GraduationCapIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/lib/utils";

// Custom analytics components
import GrowthMetricsChart from "@/features/dashboard/componenets/GrowthMetricsChart";

// Analytics data structure
import type { AnalyticsData } from "../types";
import { fetchAnalyticsData } from "../api";

// Mock analytics data (replace with API call)

const analyticsData: AnalyticsData = await fetchAnalyticsData();

// Calculate growth percentages
const calculateGrowth = (data: { month: string; count: number }[]): number => {
  if (data.length < 2) return 0;
  const current = data[data.length - 1].count;
  const previous = data[data.length - 2].count;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

// Hero Metric Card Component
interface HeroMetricProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: number;
  gradient: string;
  iconBg: string;
}

const HeroMetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient,
  iconBg,
}: HeroMetricProps) => (
  <Card className="group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className={cn("absolute inset-0 opacity-5", gradient)} />
    <div className="absolute top-0 end-0 w-24 h-24 md:w-32 md:h-32 -me-6 md:-me-8 -mt-6 md:-mt-8 rounded-full opacity-10 bg-linear-to-br from-white to-transparent" />
    <CardContent className="relative p-4 md:p-5 lg:p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 md:gap-2">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </h3>
            {trend !== undefined && (
              <Badge
                variant={trend >= 0 ? "default" : "destructive"}
                className={cn(
                  "gap-0.5 md:gap-1 font-semibold text-xs",
                  trend >= 0
                    ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                    : "bg-red-500/15 text-red-600 hover:bg-red-500/20 border-red-500/20",
                )}
              >
                {trend >= 0 ? (
                  <ArrowUpIcon className="size-2.5 md:size-3" />
                ) : (
                  <ArrowDownIcon className="size-2.5 md:size-3" />
                )}
                {Math.abs(trend)}%
              </Badge>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div
          className={cn(
            "flex size-10 md:size-12 lg:size-14 items-center justify-center rounded-xl md:rounded-2xl transition-transform duration-300 group-hover:scale-110",
            iconBg,
          )}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Stats Card Component
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  color: string;
  bgColor: string;
}

const StatsCard = ({
  icon,
  label,
  value,
  description,
  color,
  bgColor,
}: StatsCardProps) => (
  <div className="group flex items-center gap-3 md:gap-4 rounded-lg md:rounded-xl border bg-card/50 p-3 md:p-4 transition-all duration-200 hover:bg-card hover:shadow-md">
    <div
      className={cn(
        "flex size-10 md:size-12 shrink-0 items-center justify-center rounded-lg md:rounded-xl transition-transform duration-200 group-hover:scale-105",
        bgColor,
        color,
      )}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg md:text-xl lg:text-2xl font-bold truncate">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {description && (
        <p className="text-[10px] md:text-xs text-muted-foreground truncate">
          {description}
        </p>
      )}
    </div>
  </div>
);

// Engagement Ring Component
interface EngagementRingProps {
  value: number;
  max: number;
  label: string;
  color: string;
}

const EngagementRing = ({ value, max, label, color }: EngagementRingProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      <div className="relative size-16 md:size-20 lg:size-24">
        <svg
          className="size-16 md:size-20 lg:size-24 -rotate-90"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-muted"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className={color}
            strokeWidth="2.5"
            strokeDasharray={`${percentage} 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm md:text-base lg:text-lg font-bold">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <span className="text-xs md:text-sm font-medium text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
};

// Quick Insight Card
interface QuickInsightProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtext: string;
  accentColor: string;
}

const QuickInsightCard = ({
  icon,
  title,
  value,
  subtext,
  accentColor,
}: QuickInsightProps) => (
  <Card className="relative overflow-hidden border-0 bg-linear-to-br from-card to-muted/30 shadow-md">
    <div className={cn("absolute start-0 top-0 bottom-0 w-1", accentColor)} />
    <CardContent className="p-3 md:p-4 lg:p-5">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex size-8 md:size-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="flex-1 space-y-0.5 md:space-y-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-lg md:text-xl lg:text-2xl font-bold">{value}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {subtext}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const { t } = useTranslation();

  // Calculate growth rates
  const usersGrowth = useMemo(
    () => calculateGrowth(analyticsData.usersGrowth),
    [],
  );
  const quizzesGrowth = useMemo(
    () => calculateGrowth(analyticsData.quizzesGrowth),
    [],
  );
  const materialsGrowth = useMemo(
    () => calculateGrowth(analyticsData.materialsGrowth),
    [],
  );

  // Hero metrics data
  const heroMetrics: HeroMetricProps[] = [
    {
      title: t("dashboard.heroMetrics.totalUsers.title"),
      value: analyticsData.totalUsers,
      subtitle: t("dashboard.heroMetrics.totalUsers.subtitle"),
      icon: <UsersIcon className="size-5 md:size-6 lg:size-7 text-secondary" />,
      trend: usersGrowth,
      gradient: "bg-gradient-to-br from-secondary to-secondary/80",
      iconBg: "bg-secondary/10 dark:bg-secondary/20",
    },
    {
      title: t("dashboard.heroMetrics.totalQuizzes.title"),
      value: analyticsData.totalQuizzes,
      subtitle: t("dashboard.heroMetrics.totalQuizzes.subtitle"),
      icon: (
        <ClipboardListIcon className="size-5 md:size-6 lg:size-7 text-primary" />
      ),
      trend: quizzesGrowth,
      gradient: "bg-gradient-to-br from-primary to-amber-600",
      iconBg: "bg-primary/10 dark:bg-primary/20",
    },
    {
      title: t("dashboard.heroMetrics.totalMaterials.title"),
      value: analyticsData.totalMaterials,
      subtitle: t("dashboard.heroMetrics.totalMaterials.subtitle"),
      icon: (
        <FileTextIcon className="size-5 md:size-6 lg:size-7 text-emerald-600" />
      ),
      trend: materialsGrowth,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    },
    {
      title: t("dashboard.heroMetrics.quizAttempts.title"),
      value: analyticsData.activeQuizAttemptsLast30Days,
      subtitle: t("dashboard.heroMetrics.quizAttempts.subtitle"),
      icon: (
        <ActivityIcon className="size-5 md:size-6 lg:size-7 text-amber-600" />
      ),
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconBg: "bg-amber-100 dark:bg-amber-500/20",
    },
  ];

  // Platform overview stats
  const platformStats: StatsCardProps[] = [
    {
      icon: <BuildingIcon className="size-4 md:size-5" />,
      label: t("dashboard.platformOverview.universities.label"),
      value: analyticsData.totalUniversities,
      description: t("dashboard.platformOverview.universities.description"),
      color: "text-secondary",
      bgColor: "bg-secondary/10 dark:bg-secondary/20",
    },
    {
      icon: <GraduationCapIcon className="size-4 md:size-5" />,
      label: t("dashboard.platformOverview.faculties.label"),
      value: analyticsData.totalFaculties,
      description: t("dashboard.platformOverview.faculties.description"),
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-500/20",
    },
    {
      icon: <BookOpenIcon className="size-4 md:size-5" />,
      label: t("dashboard.platformOverview.majors.label"),
      value: analyticsData.totalMajors,
      description: t("dashboard.platformOverview.majors.description"),
      color: "text-primary",
      bgColor: "bg-primary/10 dark:bg-primary/20",
    },
    {
      icon: <FileTextIcon className="size-4 md:size-5" />,
      label: t("dashboard.platformOverview.courses.label"),
      value: analyticsData.totalCourses,
      description: t("dashboard.platformOverview.courses.description"),
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-500/20",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1 md:space-y-2">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              {t("dashboard.platformAnalytics.title")}
            </h1>
            <div className="flex items-center">
              <Badge
                variant="outline"
                className="gap-1 md:gap-1.5 py-1 md:py-1.5 px-2 md:px-3 text-xs"
              >
                <div className="size-1.5 md:size-2 rounded-full bg-emerald-500 animate-pulse" />
                {t("dashboard.platformAnalytics.liveData")}
              </Badge>
            </div>
          </div>
          {/* <p className="text-muted-foreground max-w-2xl">
            Comprehensive insights into Uni-Hub's growth, engagement, and
            platform performance metrics.
          </p> */}
        </div>
      </div>

      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {heroMetrics.map((metric, index) => (
          <HeroMetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:gap-6 lg:grid-cols-3">
        {/* Platform Overview - Spans 2 columns */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="border-b bg-muted/30 p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex size-7 md:size-8 lg:size-9 items-center justify-center rounded-lg bg-primary/10">
                  <BuildingIcon className="size-3.5 md:size-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm md:text-base lg:text-lg">
                    {t("dashboard.platformOverview.title")}
                  </CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {t("dashboard.platformOverview.subtitle")}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="grid grid-cols-1 gap-2 md:gap-3 lg:gap-4 sm:grid-cols-2">
              {platformStats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-muted/30 p-3 md:p-4 lg:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex size-7 md:size-8 lg:size-9 items-center justify-center rounded-lg bg-amber-500/10">
                <ZapIcon className="size-3.5 md:size-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-sm md:text-base lg:text-lg">
                  {t("dashboard.engagement.title")}
                </CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t("dashboard.engagement.subtitle")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-around gap-2 md:gap-4">
              <EngagementRing
                value={analyticsData.activeQuizAttemptsLast30Days}
                max={5000}
                label={t("dashboard.engagement.quizCompletion")}
                color="stroke-primary"
              />
              <EngagementRing
                value={analyticsData.averageMaterialsPerCourse * 100}
                max={500}
                label={t("dashboard.engagement.resourceUsage")}
                color="stroke-emerald-500"
              />
            </div>
            <div className="mt-4 md:mt-5 lg:mt-6 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">
                  {t("dashboard.engagement.avgQuizzesPerCourse")}
                </span>
                <span className="font-semibold">
                  {analyticsData.averageQuizzesPerCourse.toFixed(2)}
                </span>
              </div>
              <Progress
                value={(analyticsData.averageQuizzesPerCourse / 3) * 100}
                className="h-1.5 md:h-2"
              />
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">
                  {t("dashboard.engagement.avgMaterialsPerCourse")}
                </span>
                <span className="font-semibold">
                  {analyticsData.averageMaterialsPerCourse.toFixed(2)}
                </span>
              </div>
              <Progress
                value={(analyticsData.averageMaterialsPerCourse / 5) * 100}
                className="h-1.5 md:h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart Section */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="border-b bg-muted/30 p-3 md:p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex size-7 md:size-8 lg:size-9 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUpIcon className="size-3.5 md:size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm md:text-base lg:text-lg">
                  {t("dashboard.growthAnalytics.title")}
                </CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t("dashboard.growthAnalytics.subtitle")}
                </p>
              </div>
            </div>
            <Tabs defaultValue="all" className="w-auto">
              <TabsList className="h-7 md:h-8">
                <TabsTrigger
                  value="all"
                  className="text-[10px] md:text-xs px-2 md:px-3"
                >
                  {t("dashboard.growthAnalytics.all")}
                </TabsTrigger>
                <TabsTrigger
                  value="quizzes"
                  className="text-[10px] md:text-xs px-2 md:px-3"
                >
                  {t("dashboard.growthAnalytics.quizzes")}
                </TabsTrigger>
                <TabsTrigger
                  value="materials"
                  className="text-[10px] md:text-xs px-2 md:px-3"
                >
                  {t("dashboard.growthAnalytics.materials")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <GrowthMetricsChart
            quizzesGrowth={analyticsData.quizzesGrowth}
            materialsGrowth={analyticsData.materialsGrowth}
            usersGrowth={analyticsData.usersGrowth}
            className="border-0 shadow-none"
          />
        </CardContent>
      </Card>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-5 md:grid-cols-3">
        <QuickInsightCard
          icon={<BookOpenIcon className="size-4 md:size-5 text-primary" />}
          title={t("dashboard.quickInsights.totalMajors.title")}
          value={analyticsData.totalMajors.toString()}
          subtext={t("dashboard.quickInsights.totalMajors.subtext")}
          accentColor="bg-primary"
        />
        <QuickInsightCard
          icon={<TargetIcon className="size-4 md:size-5 text-secondary" />}
          title={t("dashboard.quickInsights.quizToCourseRatio.title")}
          value={analyticsData.averageQuizzesPerCourse.toFixed(2)}
          subtext={t("dashboard.quickInsights.quizToCourseRatio.subtext")}
          accentColor="bg-secondary"
        />
        <QuickInsightCard
          icon={<ActivityIcon className="size-4 md:size-5 text-emerald-600" />}
          title={t("dashboard.quickInsights.monthlyActiveAttempts.title")}
          value={analyticsData.activeQuizAttemptsLast30Days.toLocaleString()}
          subtext={t("dashboard.quickInsights.monthlyActiveAttempts.subtext")}
          accentColor="bg-emerald-500"
        />
      </div>

      {/* Footer Stats Banner */}
      <Card className="border-0 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 shadow-lg">
        <CardContent className="py-4 md:py-5 lg:py-6">
          <div className="flex flex-col items-center justify-center gap-4 md:gap-6 md:flex-row md:justify-around">
            <div className="text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                {(
                  analyticsData.totalQuizzes + analyticsData.totalMaterials
                ).toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t("dashboard.footerStats.totalLearningResources")}
              </p>
            </div>
            <div className="hidden md:block h-10 lg:h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                {analyticsData.totalUniversities}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t("dashboard.footerStats.partnerUniversities")}
              </p>
            </div>
            <div className="hidden md:block h-10 lg:h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                {(
                  (analyticsData.totalQuizzes / analyticsData.totalCourses) *
                  100
                ).toFixed(0)}
                %
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t("dashboard.footerStats.courseQuizCoverage")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
