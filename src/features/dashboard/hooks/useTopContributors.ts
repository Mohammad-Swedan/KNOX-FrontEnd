import { useState, useEffect, useCallback } from "react";
import { fetchTopContributors } from "../api";
import type { TopContributor, TopContributorsFilter } from "../types";

export function useTopContributors(filter?: TopContributorsFilter) {
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTopContributors(filter)
      .then((data) => {
        if (!cancelled) setContributors(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load contributors",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter?.majorId,
    filter?.facultyId,
    filter?.universityId,
    filter?.topN,
    refetchTrigger,
  ]);

  return { contributors, loading, error, refetch };
}
