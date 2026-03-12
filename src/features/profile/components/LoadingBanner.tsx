import { RefreshCw } from "lucide-react";

export const LoadingBanner = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/20 rounded-lg">
      <RefreshCw className="h-5 w-5 text-primary animate-spin shrink-0" />
      <p className="text-sm text-foreground">
        Loading complete user information...
      </p>
    </div>
  );
};
