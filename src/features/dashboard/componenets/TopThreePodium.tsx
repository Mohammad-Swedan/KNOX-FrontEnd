import {
  Crown,
  Medal,
  Award,
  FileText,
  HelpCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import type { TopContributor } from "../types";

interface PodiumCardProps {
  contributor: TopContributor;
  variant: "gold" | "silver" | "bronze";
}

function PodiumCard({ contributor, variant }: PodiumCardProps) {
  const { t } = useTranslation();
  const initials = contributor.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const isGold = variant === "gold";

  const config = {
    gold: {
      order: "order-2",
      ring: "ring-yellow-400 dark:ring-yellow-500",
      avatarSize: "h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28",
      iconBg: "bg-yellow-400 shadow-yellow-400/50",
      icon: <Crown className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-yellow-900" />,
      podiumBg:
        "bg-linear-to-t from-yellow-500 to-yellow-300 dark:from-yellow-600 dark:to-yellow-400",
      podiumH: "h-24 sm:h-32 md:h-36",
      glow: "shadow-[0_0_40px_8px_rgba(234,179,8,0.15)] dark:shadow-[0_0_40px_8px_rgba(234,179,8,0.10)]",
      nameClass: "text-sm sm:text-lg md:text-xl font-bold",
      totalSize: "text-xl sm:text-2xl md:text-3xl",
      label: "#1",
    },
    silver: {
      order: "order-1",
      ring: "ring-slate-300 dark:ring-slate-500",
      avatarSize: "h-12 w-12 sm:h-18 sm:w-18 md:h-20 md:w-20",
      iconBg: "bg-slate-300 shadow-slate-300/50",
      icon: <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-slate-700" />,
      podiumBg:
        "bg-linear-to-t from-slate-400 to-slate-200 dark:from-slate-600 dark:to-slate-400",
      podiumH: "h-18 sm:h-24 md:h-28",
      glow: "",
      nameClass: "text-xs sm:text-base font-semibold",
      totalSize: "text-base sm:text-xl md:text-2xl",
      label: "#2",
    },
    bronze: {
      order: "order-3",
      ring: "ring-orange-300 dark:ring-orange-500",
      avatarSize: "h-12 w-12 sm:h-18 sm:w-18 md:h-20 md:w-20",
      iconBg: "bg-orange-300 shadow-orange-300/50",
      icon: <Award className="h-3 w-3 sm:h-4 sm:w-4 text-orange-800" />,
      podiumBg:
        "bg-linear-to-t from-orange-400 to-orange-200 dark:from-orange-600 dark:to-orange-400",
      podiumH: "h-16 sm:h-20 md:h-24",
      glow: "",
      nameClass: "text-xs sm:text-base font-semibold",
      totalSize: "text-base sm:text-xl md:text-2xl",
      label: "#3",
    },
  }[variant];

  return (
    <div
      className={`flex flex-col items-center ${config.order} w-full min-w-0 ${isGold ? "max-w-[120px] sm:max-w-[200px] md:max-w-[230px] -mt-2 sm:-mt-4 md:-mt-6 z-10" : "max-w-[100px] sm:max-w-[180px] md:max-w-[200px]"}`}
    >
      {/* Floating avatar + info above the podium */}
      <div
        className={`flex flex-col items-center mb-0 relative ${config.glow} rounded-full`}
      >
        {/* Rank icon floating top-right */}
        <div
          className={`absolute -top-1 -right-1 z-10 ${config.iconBg} rounded-full p-1 sm:p-1.5 shadow-lg`}
        >
          {config.icon}
        </div>
        <Avatar
          className={`${config.avatarSize} ring-4 ${config.ring} shadow-xl`}
        >
          <AvatarImage
            src={contributor.profilePictureUrl ?? undefined}
            alt={contributor.name}
          />
          <AvatarFallback
            className={`${isGold ? "text-base" : "text-sm"} font-bold bg-muted`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name + affiliation */}
      <div className="text-center mt-2 sm:mt-3 mb-1.5 sm:mb-2 px-0.5 sm:px-1 w-full min-w-0">
        <p className={`${config.nameClass} text-foreground truncate`}>
          {contributor.name}
        </p>
        <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
          {contributor.universityName} · {contributor.facultyName} ·{" "}
          {contributor.majorName}
        </p>
      </div>

      {/* Podium block */}
      <div
        className={`w-full ${config.podiumH} ${config.podiumBg} rounded-t-xl sm:rounded-t-2xl flex flex-col items-center justify-center px-1.5 sm:px-3 relative overflow-hidden`}
      >
        {/* Decorative shimmer for gold */}
        {isGold && (
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        )}

        {/* Total score */}
        <span
          className={`${config.totalSize} font-extrabold text-white drop-shadow-md`}
        >
          {contributor.totalCount}
        </span>
        <span className="text-[8px] sm:text-[10px] md:text-xs text-white/80 font-medium uppercase tracking-wider">
          {t("topContributors.contributions")}
        </span>

        {/* Breakdown row */}
        <div className="flex items-center gap-1.5 sm:gap-3 mt-1 sm:mt-2 text-white/90">
          <span
            className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px]"
            title={t("topContributors.materials")}
          >
            <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {contributor.materialsCount}
          </span>
          <span
            className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px]"
            title={t("topContributors.quizzes")}
          >
            <HelpCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {contributor.quizzesCount}
          </span>
          <span
            className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px]"
            title={t("topContributors.courses")}
          >
            <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {contributor.coursesCount}
          </span>
        </div>
      </div>
    </div>
  );
}

interface TopThreePodiumProps {
  contributors: TopContributor[];
}

export function TopThreePodium({ contributors }: TopThreePodiumProps) {
  const { t } = useTranslation();
  const [first, second, third] = contributors;

  if (!first) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center gap-2 mb-10">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        <h2 className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
          {t("topContributors.podiumTitle")}
        </h2>
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </div>
      <div className="flex items-end justify-center gap-1.5 sm:gap-3 md:gap-5 px-2 sm:px-0">
        {second && <PodiumCard contributor={second} variant="silver" />}
        <PodiumCard contributor={first} variant="gold" />
        {third && <PodiumCard contributor={third} variant="bronze" />}
      </div>
      {/* Podium base */}
      <div className="mx-auto max-w-lg h-2 bg-linear-to-r from-transparent via-border to-transparent rounded-full mt-0" />
    </div>
  );
}
