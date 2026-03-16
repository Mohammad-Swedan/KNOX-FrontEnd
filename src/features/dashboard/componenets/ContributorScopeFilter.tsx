import { useTranslation } from "react-i18next";
import { Globe, Building2, BookOpen, GraduationCap } from "lucide-react";
import type { ContributorScope, TopContributorsFilter } from "../types";

interface ScopeOption {
  scope: ContributorScope;
  labelKey: string;
  sublabel: string;
  icon: React.ReactNode;
  disabled: boolean;
  filter: TopContributorsFilter;
}

interface ContributorScopeFilterProps {
  activeScope: ContributorScope;
  universityId: number;
  universityName: string;
  facultyId: number;
  facultyName: string;
  majorId: number;
  majorName: string;
  onScopeChange: (
    scope: ContributorScope,
    filter: TopContributorsFilter,
  ) => void;
}

export function ContributorScopeFilter({
  activeScope,
  universityId,
  universityName,
  facultyId,
  facultyName,
  majorId,
  majorName,
  onScopeChange,
}: ContributorScopeFilterProps) {
  const { t } = useTranslation();

  const options: ScopeOption[] = [
    {
      scope: "global",
      labelKey: "topContributors.scopeGlobal",
      sublabel: t("topContributors.scopeGlobalSub"),
      icon: <Globe className="h-4 w-4" />,
      disabled: false,
      filter: {},
    },
    {
      scope: "university",
      labelKey: "topContributors.scopeUniversity",
      sublabel: universityName,
      icon: <Building2 className="h-4 w-4" />,
      disabled: !universityId,
      filter: { universityId },
    },
    {
      scope: "faculty",
      labelKey: "topContributors.scopeFaculty",
      sublabel: facultyName,
      icon: <BookOpen className="h-4 w-4" />,
      disabled: !facultyId,
      filter: { facultyId },
    },
    {
      scope: "major",
      labelKey: "topContributors.scopeMajor",
      sublabel: majorName,
      icon: <GraduationCap className="h-4 w-4" />,
      disabled: !majorId,
      filter: { majorId },
    },
  ];

  return (
    <div className="mb-8">
      <p className="text-sm text-muted-foreground mb-3">
        {t("topContributors.filterLabel")}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = activeScope === opt.scope;
          return (
            <button
              key={opt.scope}
              disabled={opt.disabled}
              onClick={() => onScopeChange(opt.scope, opt.filter)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all
                ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }
                ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {opt.icon}
              <span>{t(opt.labelKey)}</span>
              {opt.sublabel && !opt.disabled && (
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  } hidden sm:inline`}
                >
                  · {opt.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
