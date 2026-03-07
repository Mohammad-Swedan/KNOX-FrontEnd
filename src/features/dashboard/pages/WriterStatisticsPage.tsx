import { useTranslation } from "react-i18next";
import {
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

const WriterStatisticsPage = () => {
  const { t } = useTranslation();

  // Mock statistics data
  const stats = {
    totalMaterials: 156,
    totalQuizzes: 42,
    thisMonth: 23,
    avgRating: 4.7,
    totalViews: 12543,
    activeHours: 127,
  };

  const recentActivity = [
    {
      id: 1,
      type: "Material",
      title: "Data Structures - Introduction to Trees",
      date: "2 hours ago",
      views: 145,
    },
    {
      id: 2,
      type: "Quiz",
      title: "Object-Oriented Programming Quiz #5",
      date: "5 hours ago",
      views: 89,
    },
    {
      id: 3,
      type: "Material",
      title: "Database Design Best Practices",
      date: "1 day ago",
      views: 234,
    },
    {
      id: 4,
      type: "Material",
      title: "Advanced JavaScript Concepts",
      date: "2 days ago",
      views: 312,
    },
  ];

  const topContent = [
    { title: "React Hooks Deep Dive", views: 1847, type: "Material" },
    { title: "Python Final Exam Practice", views: 1523, type: "Quiz" },
    { title: "Web Security Fundamentals", views: 1401, type: "Material" },
    { title: "Algorithms Mid-term Quiz", views: 1276, type: "Quiz" },
    { title: "Cloud Computing Introduction", views: 1198, type: "Material" },
  ];

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex size-10 md:size-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-5 md:size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                {t("dashboard.writer.title")}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm">
                {t("dashboard.writer.subtitle")}
              </p>
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="w-fit px-2 md:px-3 py-1 md:py-1.5 text-xs"
        >
          {t("dashboard.writer.lastUpdated")}: {t("dashboard.writer.justNow")}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-4 lg:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {t("dashboard.writer.stats.totalMaterials.title")}
            </CardTitle>
            <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="text-lg md:text-xl lg:text-2xl font-bold">
              {stats.totalMaterials}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              {t("dashboard.writer.stats.totalMaterials.change", { count: 12 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-4 lg:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {t("dashboard.writer.stats.totalQuizzes.title")}
            </CardTitle>
            <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="text-lg md:text-xl lg:text-2xl font-bold">
              {stats.totalQuizzes}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              {t("dashboard.writer.stats.totalQuizzes.change", { count: 5 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-4 lg:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {t("dashboard.writer.stats.thisMonth.title")}
            </CardTitle>
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="text-lg md:text-xl lg:text-2xl font-bold">
              {stats.thisMonth}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              {t("dashboard.writer.stats.thisMonth.description")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-4 lg:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {t("dashboard.writer.stats.avgRating.title")}
            </CardTitle>
            <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="text-lg md:text-xl lg:text-2xl font-bold">
              {stats.avgRating}/5.0
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              {t("dashboard.writer.stats.avgRating.description")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-4 lg:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {t("dashboard.writer.stats.totalViewsCard.title")}
            </CardTitle>
            <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="text-lg md:text-xl lg:text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              {t("dashboard.writer.stats.totalViewsCard.change")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-4 lg:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {t("dashboard.writer.stats.activeHours.title")}
            </CardTitle>
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="text-lg md:text-xl lg:text-2xl font-bold">
              {stats.activeHours}h
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              {t("dashboard.writer.stats.activeHours.description")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="p-3 md:p-4 lg:p-6">
            <CardTitle className="text-sm md:text-base lg:text-lg">
              {t("dashboard.writer.recentActivity.title")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("dashboard.writer.recentActivity.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="space-y-3 md:space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 md:gap-4 border-b pb-3 md:pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5 md:space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Badge
                        variant={
                          item.type === "Material" ? "default" : "secondary"
                        }
                        className="text-[10px] md:text-xs"
                      >
                        {item.type === "Material"
                          ? t("dashboard.writer.recentActivity.material")
                          : t("dashboard.writer.recentActivity.quiz")}
                      </Badge>
                    </div>
                    <p className="font-medium text-xs md:text-sm truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {item.date}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-xs md:text-sm font-semibold">
                      {item.views}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {t("dashboard.writer.recentActivity.views")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader className="p-3 md:p-4 lg:p-6">
            <CardTitle className="text-sm md:text-base lg:text-lg">
              {t("dashboard.writer.topContent.title")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("dashboard.writer.topContent.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
            <div className="space-y-3 md:space-y-4">
              {topContent.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 md:gap-4 border-b pb-3 md:pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-center size-6 md:size-8 rounded-full bg-primary/10 font-bold text-primary shrink-0 text-xs md:text-sm">
                    {index + 1}
                  </div>
                  <div className="space-y-0.5 md:space-y-1 flex-1 min-w-0">
                    <p className="font-medium text-xs md:text-sm truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Badge
                        variant={
                          item.type === "Material" ? "default" : "secondary"
                        }
                        className="text-[10px] md:text-xs"
                      >
                        {item.type === "Material"
                          ? t("dashboard.writer.recentActivity.material")
                          : t("dashboard.writer.recentActivity.quiz")}
                      </Badge>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {item.views.toLocaleString()}{" "}
                        {t("dashboard.writer.topContent.views")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader className="p-3 md:p-4 lg:p-6">
          <CardTitle className="text-sm md:text-base lg:text-lg">
            {t("dashboard.writer.performanceOverview.title")}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t("dashboard.writer.performanceOverview.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
          <div className="flex items-center justify-center h-48 md:h-56 lg:h-64 bg-muted/30 rounded-lg border-2 border-dashed">
            <div className="text-center space-y-1.5 md:space-y-2">
              <BarChart3 className="size-8 md:size-10 lg:size-12 mx-auto text-muted-foreground" />
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                {t("dashboard.writer.performanceOverview.chartComingSoon")}
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {t("dashboard.writer.performanceOverview.metricsPlaceholder")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WriterStatisticsPage;
