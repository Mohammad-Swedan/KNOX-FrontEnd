import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/shared/ui/card";

import { cn } from "@/lib/utils";

// Statistics card data type
type StatisticsCardProps = {
  icon: ReactNode;
  value: string;
  title: string;
  changePercentage: string;
  className?: string;
};

const StatisticsCard = ({
  icon,
  value,
  title,
  changePercentage,
  className,
}: StatisticsCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className={cn("gap-3 md:gap-4", className)}>
      <CardHeader className="flex items-center p-3 md:p-4 lg:p-6">
        <div className="bg-primary/10 text-primary flex size-6 md:size-7 lg:size-8 shrink-0 items-center justify-center rounded-md">
          {icon}
        </div>
        <span className="text-lg md:text-xl lg:text-2xl">{value}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 md:gap-2 p-3 md:p-4 lg:p-6 pt-0">
        <span className="font-semibold text-xs md:text-sm lg:text-base">
          {title}
        </span>
        <p className="space-x-1 md:space-x-2">
          <span className="text-[10px] md:text-xs lg:text-sm">
            {changePercentage}
          </span>
          <span className="text-muted-foreground text-[10px] md:text-xs lg:text-sm">
            {t("dashboard.statisticsCard.thanLastMonth")}
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
