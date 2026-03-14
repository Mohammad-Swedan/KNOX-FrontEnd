import { Clock } from "lucide-react";
import SEO from "@/shared/components/seo/SEO";
import { useTranslation } from "react-i18next";

const WriterStatisticsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t("seo.dashboard.title")}
        description={t("seo.dashboard.description")}
        noIndex={true}
        hreflang={false}
      />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10">
          <Clock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Coming Soon</h1>
        <p className="text-muted-foreground max-w-md">
          Writer statistics and analytics are currently under development. Stay
          tuned!
        </p>
      </div>
    </>
  );
};

export default WriterStatisticsPage;
