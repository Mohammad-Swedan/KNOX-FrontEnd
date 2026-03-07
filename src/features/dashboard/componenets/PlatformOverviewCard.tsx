import { useTranslation } from "react-i18next";
import {
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  GraduationCapIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  totalMajors: number;
  totalCourses: number;
  totalQuizzes: number;
  totalMaterials: number;
  className?: string;
};

const PlatformOverviewCard = ({
  totalMajors,
  totalCourses,
  totalQuizzes,
  totalMaterials,
  className,
}: Props) => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: <GraduationCapIcon className="size-3.5 md:size-4" />,
      label: t("dashboard.platformOverview.majors.label"),
      value: totalMajors.toLocaleString(),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <BookOpenIcon className="size-3.5 md:size-4" />,
      label: t("dashboard.platformOverview.courses.label"),
      value: totalCourses.toLocaleString(),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: <ClipboardListIcon className="size-3.5 md:size-4" />,
      label: t("dashboard.totalQuizzes"),
      value: totalQuizzes.toLocaleString(),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: <FileTextIcon className="size-3.5 md:size-4" />,
      label: t("dashboard.totalMaterials"),
      value: totalMaterials.toLocaleString(),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <Card className={cn("gap-3 md:gap-4", className)}>
      <CardHeader className="flex justify-between p-3 md:p-4 lg:p-6">
        <div className="flex flex-col gap-0.5 md:gap-1">
          <span className="text-sm md:text-base lg:text-lg font-semibold">
            {t("dashboard.platformOverview.title")}
          </span>
          <span className="text-muted-foreground text-xs md:text-sm">
            {t("dashboard.platformOverview.keyMetrics")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 p-3 md:p-4 lg:p-6 pt-0">
        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-2 md:gap-3 rounded-md border p-2.5 md:p-3 lg:p-4"
            >
              <div
                className={cn(
                  "flex size-8 md:size-9 lg:size-10 items-center justify-center rounded-md",
                  stat.bgColor,
                  stat.color,
                )}
              >
                {stat.icon}
              </div>
              <div className="flex flex-col gap-0 md:gap-0.5">
                <span className="text-muted-foreground text-[10px] md:text-xs font-medium">
                  {stat.label}
                </span>
                <span className="text-base md:text-lg lg:text-xl font-bold">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformOverviewCard;
