import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
import { useAuth } from "@/app/providers/useAuth";
import { Skeleton } from "@/shared/ui/skeleton";
import { useTopContributors } from "../hooks/useTopContributors";
import { TopThreePodium } from "../componenets/TopThreePodium";
import { ContributorList } from "../componenets/ContributorList";
import { ContributorScopeFilter } from "../componenets/ContributorScopeFilter";
import type { ContributorScope, TopContributorsFilter } from "../types";

function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      {/* Podium skeleton */}
      <div className="flex items-end justify-center gap-1.5 sm:gap-3 md:gap-5 px-2 sm:px-0">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <Skeleton className="h-12 w-12 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-full" />
          <Skeleton className="h-3 w-16 sm:h-4 sm:w-24 rounded" />
          <Skeleton className="h-18 w-full max-w-[100px] sm:h-24 sm:max-w-[180px] md:h-28 rounded-t-xl sm:rounded-t-2xl" />
        </div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <Skeleton className="h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full" />
          <Skeleton className="h-3 w-20 sm:h-4 sm:w-28 rounded" />
          <Skeleton className="h-24 w-full max-w-[120px] sm:h-32 sm:max-w-[200px] md:h-36 rounded-t-xl sm:rounded-t-2xl" />
        </div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <Skeleton className="h-12 w-12 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-full" />
          <Skeleton className="h-3 w-16 sm:h-4 sm:w-24 rounded" />
          <Skeleton className="h-16 w-full max-w-[100px] sm:h-20 sm:max-w-[180px] md:h-24 rounded-t-xl sm:rounded-t-2xl" />
        </div>
      </div>
      {/* List skeleton */}
      <div className="rounded-2xl border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40 rounded" />
              <Skeleton className="h-3 w-56 rounded" />
            </div>
            <Skeleton className="h-7 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TopContributorsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Default filter: faculty scope for logged-in users, global for guests
  const getDefaultScope = (): ContributorScope => {
    if (user?.facultyId) return "faculty";
    return "global";
  };

  const getDefaultFilter = (): TopContributorsFilter => {
    if (user?.facultyId) return { facultyId: user.facultyId };
    return {};
  };

  const [activeScope, setActiveScope] =
    useState<ContributorScope>(getDefaultScope);
  const [activeFilter, setActiveFilter] =
    useState<TopContributorsFilter>(getDefaultFilter);

  const { contributors, loading, error } = useTopContributors(activeFilter);

  const handleScopeChange = (
    scope: ContributorScope,
    filter: TopContributorsFilter,
  ) => {
    setActiveScope(scope);
    setActiveFilter(filter);
  };

  const topThree = contributors.slice(0, 3);
  const rest = contributors.slice(3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header with gradient */}
      <div className="relative overflow-hidden border-b bg-linear-to-b from-yellow-50/60 via-background to-background dark:from-yellow-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-yellow-200/20 via-transparent to-transparent dark:from-yellow-500/5" />
        <div className="container relative mx-auto px-4 pt-12 pb-8 sm:px-6 lg:px-8 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-linear-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/25 mb-5">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("topContributors.title")}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            {t("topContributors.subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        {/* Scope filter — only for logged-in users */}
        {user && (
          <ContributorScopeFilter
            activeScope={activeScope}
            universityId={user.universityId ?? 0}
            universityName={user.universityName ?? ""}
            facultyId={user.facultyId ?? 0}
            facultyName={user.facultyName ?? ""}
            majorId={user.majorId ?? 0}
            majorName={user.majorName ?? ""}
            onScopeChange={handleScopeChange}
          />
        )}

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <p className="text-sm">{t("topContributors.error")}</p>
          </div>
        ) : contributors.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-muted/50 mb-5">
              <Trophy className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-sm">
              {t("topContributors.empty")}
            </p>
          </div>
        ) : (
          <>
            <TopThreePodium contributors={topThree} />
            <ContributorList contributors={rest} />
          </>
        )}
      </div>
    </div>
  );
}
