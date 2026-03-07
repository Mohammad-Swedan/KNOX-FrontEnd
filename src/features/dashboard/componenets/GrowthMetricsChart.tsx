"use client";

import { useTranslation } from "react-i18next";
import { TrendingUpIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";

type GrowthData = {
  month: string;
  count: number;
};

type Props = {
  quizzesGrowth: GrowthData[];
  materialsGrowth: GrowthData[];
  usersGrowth: GrowthData[];
  className?: string;
};

const chartConfig = {
  quizzes: {
    label: "Quizzes",
    color: "#8b5cf6",
  },
  materials: {
    label: "Materials",
    color: "#3b82f6",
  },
  users: {
    label: "Users",
    color: "#10b981",
  },
} satisfies ChartConfig;

const GrowthMetricsChart = ({
  quizzesGrowth,
  materialsGrowth,
  usersGrowth,
  className,
}: Props) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Transform data for the chart
  const chartData = quizzesGrowth.map((quiz, index) => {
    const monthDate = new Date(quiz.month);
    const monthName = monthDate.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      month: "short",
    });

    return {
      month: monthName,
      quizzes: quiz.count,
      materials: materialsGrowth[index]?.count || 0,
      users: usersGrowth[index]?.count || 0,
    };
  });

  // Calculate total growth
  const totalQuizzes = quizzesGrowth.reduce((sum, item) => sum + item.count, 0);
  const totalMaterials = materialsGrowth.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const totalUsers = usersGrowth.reduce((sum, item) => sum + item.count, 0);

  // Calculate growth percentage (comparing last month to previous)
  const quizGrowth =
    quizzesGrowth.length >= 2
      ? (
          ((quizzesGrowth[quizzesGrowth.length - 1].count -
            quizzesGrowth[quizzesGrowth.length - 2].count) /
            quizzesGrowth[quizzesGrowth.length - 2].count) *
          100
        ).toFixed(1)
      : "0";

  return (
    <Card className={className}>
      <CardHeader className="p-3 md:p-4 lg:p-6">
        <CardTitle className="text-sm md:text-base lg:text-lg">
          {t("dashboard.growthAnalytics.growthTrends")}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("dashboard.growthAnalytics.showingGrowth")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-4 lg:p-6">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillQuizzes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-quizzes)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-quizzes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMaterials" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-materials)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-materials)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="materials"
              type="natural"
              fill="url(#fillMaterials)"
              fillOpacity={0.4}
              stroke="var(--color-materials)"
              stackId="a"
            />
            <Area
              dataKey="users"
              type="natural"
              fill="url(#fillUsers)"
              fillOpacity={0.4}
              stroke="var(--color-users)"
              stackId="a"
            />
            <Area
              dataKey="quizzes"
              type="natural"
              fill="url(#fillQuizzes)"
              fillOpacity={0.4}
              stroke="var(--color-quizzes)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="p-3 md:p-4 lg:p-6">
        <div className="flex w-full items-start gap-2 text-xs md:text-sm">
          <div className="grid gap-1.5 md:gap-2">
            <div className="flex items-center gap-1.5 md:gap-2 font-medium leading-none">
              {parseFloat(quizGrowth) >= 0
                ? t("dashboard.growthAnalytics.trendingUp")
                : t("dashboard.growthAnalytics.trendingDown")}{" "}
              {Math.abs(parseFloat(quizGrowth))}%{" "}
              {t("dashboard.growthAnalytics.thisMonth")}{" "}
              <TrendingUpIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
            <div className="flex flex-wrap items-center gap-1 md:gap-2 leading-none text-muted-foreground text-[10px] md:text-sm">
              {t("dashboard.growthAnalytics.total")}:{" "}
              {totalQuizzes.toLocaleString()}{" "}
              {t("dashboard.growthAnalytics.quizzes")},{" "}
              {totalMaterials.toLocaleString()}{" "}
              {t("dashboard.growthAnalytics.materials")},{" "}
              {totalUsers.toLocaleString()}{" "}
              {t("dashboard.growthAnalytics.users")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GrowthMetricsChart;
