"use client";

import { useCallback, useEffect, useState } from "react";
import { getUsage } from "@/lib/api";
import type { UsageCategory, UsageResponse } from "@/types/api";

interface UsageState {
  proposals: UsageCategory;
  cover_letters: UsageCategory;
}

const EMPTY_USAGE: UsageState = {
  proposals: { used: 0, limit: 0, remaining: 0 },
  cover_letters: { used: 0, limit: 0, remaining: 0 },
};

function normalizeUsage(data: UsageResponse): UsageState {
  const proposals = data.proposals ?? {
    used: data.proposals_used ?? 0,
    limit: data.proposals_limit ?? 0,
  };

  const coverLetters = data.cover_letters ?? {
    used: data.cover_letters_used ?? 0,
    limit: data.cover_letters_limit ?? 0,
  };

  return {
    proposals: {
      ...proposals,
      remaining:
        proposals.remaining ?? Math.max(0, proposals.limit - proposals.used),
    },
    cover_letters: {
      ...coverLetters,
      remaining:
        coverLetters.remaining ??
        Math.max(0, coverLetters.limit - coverLetters.used),
    },
  };
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageState>(EMPTY_USAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUsage();
      setUsage(normalizeUsage(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load usage.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { usage, loading, error, refresh };
}
