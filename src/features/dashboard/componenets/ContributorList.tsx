import { useTranslation } from "react-i18next";
import { FileText, HelpCircle, BookOpen, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import type { TopContributor } from "../types";

interface ContributorListProps {
  contributors: TopContributor[];
}

export function ContributorList({ contributors }: ContributorListProps) {
  const { t } = useTranslation();

  if (contributors.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
        {t("topContributors.rankingsTitle")}
      </h2>
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {contributors.map((contributor, index) => {
          const initials = contributor.name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <div
              key={contributor.userId}
              className={`group flex items-center gap-4 px-5 py-4 ${
                index < contributors.length - 1
                  ? "border-b border-border/60"
                  : ""
              } hover:bg-muted/50 transition-all duration-200`}
            >
              {/* Rank number */}
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-bold text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {contributor.rank}
              </div>

              {/* Avatar */}
              <Avatar className="h-11 w-11 shrink-0 ring-2 ring-border/50">
                <AvatarImage
                  src={contributor.profilePictureUrl ?? undefined}
                  alt={contributor.name}
                />
                <AvatarFallback className="text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Name & affiliation */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {contributor.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground truncate">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {contributor.universityName} · {contributor.facultyName} ·{" "}
                    {contributor.majorName}
                  </span>
                </div>
              </div>

              {/* Counts breakdown — visible on sm+ */}
              <div className="hidden sm:flex items-center gap-3">
                <div
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-1"
                  title={t("topContributors.materials")}
                >
                  <FileText className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">
                    {contributor.materialsCount}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-1"
                  title={t("topContributors.quizzes")}
                >
                  <HelpCircle className="h-3 w-3 text-violet-500" />
                  <span className="font-medium">
                    {contributor.quizzesCount}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-1"
                  title={t("topContributors.courses")}
                >
                  <BookOpen className="h-3 w-3 text-emerald-500" />
                  <span className="font-medium">
                    {contributor.coursesCount}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="text-right shrink-0 min-w-[50px]">
                <span className="text-lg font-bold text-foreground">
                  {contributor.totalCount}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {t("topContributors.total")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
