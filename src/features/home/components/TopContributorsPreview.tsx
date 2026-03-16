import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Crown,
  Medal,
  Award,
  FileText,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Building2,
  Heart,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { fetchTopContributors } from "@/features/dashboard/api";
import type { TopContributor } from "@/features/dashboard/types";

const rankConfig = [
  {
    icon: <Crown className="h-4 w-4" />,
    iconBg: "bg-yellow-400",
    iconText: "text-yellow-900",
    ring: "ring-yellow-400",
    accent:
      "from-yellow-400/10 to-yellow-400/5 dark:from-yellow-500/10 dark:to-yellow-500/5",
    border: "border-yellow-300/50 dark:border-yellow-500/30",
  },
  {
    icon: <Medal className="h-4 w-4" />,
    iconBg: "bg-slate-300",
    iconText: "text-slate-700",
    ring: "ring-slate-300",
    accent:
      "from-slate-200/30 to-slate-100/20 dark:from-slate-500/10 dark:to-slate-500/5",
    border: "border-slate-200/60 dark:border-slate-500/30",
  },
  {
    icon: <Award className="h-4 w-4" />,
    iconBg: "bg-orange-300",
    iconText: "text-orange-800",
    ring: "ring-orange-300",
    accent:
      "from-orange-300/10 to-orange-200/5 dark:from-orange-500/10 dark:to-orange-500/5",
    border: "border-orange-200/50 dark:border-orange-500/30",
  },
];

function PreviewCard({
  contributor,
  index,
}: {
  contributor: TopContributor;
  index: number;
}) {
  const { t } = useTranslation();
  const cfg = rankConfig[index];
  const initials = contributor.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative flex flex-col items-center text-center rounded-2xl border ${cfg.border} bg-linear-to-b ${cfg.accent} p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      {/* Rank icon */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 ${cfg.iconBg} ${cfg.iconText} rounded-full p-1.5 shadow-md`}
      >
        {cfg.icon}
      </div>

      {/* Avatar */}
      <Avatar
        className={`h-14 w-14 sm:h-16 sm:w-16 ring-2 ${cfg.ring} shadow-md mb-3 mt-1`}
      >
        <AvatarImage
          src={contributor.profilePictureUrl ?? undefined}
          alt={contributor.name}
        />
        <AvatarFallback className="text-sm font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <p className="font-bold text-sm sm:text-base text-foreground truncate max-w-40">
        {contributor.name}
      </p>

      {/* Affiliation */}
      <div className="flex items-center gap-1 mt-0.5 mb-3">
        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1 max-w-[180px]">
          {contributor.universityName} · {contributor.facultyName}
        </p>
      </div>

      {/* Score */}
      <div className="text-2xl font-extrabold text-foreground">
        {contributor.totalCount}
      </div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
        {t("topContributors.contributions")}
      </p>

      {/* Breakdown */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span
          className="flex items-center gap-1"
          title={t("topContributors.materials")}
        >
          <FileText className="h-3 w-3 text-blue-500" />
          {contributor.materialsCount}
        </span>
        <span
          className="flex items-center gap-1"
          title={t("topContributors.quizzes")}
        >
          <HelpCircle className="h-3 w-3 text-violet-500" />
          {contributor.quizzesCount}
        </span>
        <span
          className="flex items-center gap-1"
          title={t("topContributors.courses")}
        >
          <BookOpen className="h-3 w-3 text-emerald-500" />
          {contributor.coursesCount}
        </span>
      </div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-2xl border p-5 sm:p-6"
        >
          <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full mb-3" />
          <Skeleton className="h-4 w-24 rounded mb-1" />
          <Skeleton className="h-3 w-32 rounded mb-3" />
          <Skeleton className="h-7 w-10 rounded mb-1" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

const TopContributorsPreview = () => {
  const { t } = useTranslation();
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTopContributors({ topN: 3 })
      .then((data) => {
        if (!cancelled) setContributors(data);
      })
      .catch(() => {
        // silently fail — section just won't render
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Don't render if no data and not loading
  if (!loading && contributors.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Subtle top divider */}
      <div className="absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        {/* Community header + intro */}
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Heart className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t("home.topContributorsPreview.title")}
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            {t("home.topContributorsPreview.subtitle")}
          </p>

          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{t("home.topContributorsPreview.statLine")}</span>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <PreviewSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {contributors.map((c, i) => (
              <PreviewCard key={c.userId} contributor={c} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group rounded-full px-6"
          >
            <Link to="/top-contributors">
              {t("home.topContributorsPreview.viewAll")}
              <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopContributorsPreview;
