"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyLog, LogsResponse } from "@/types";

export function useLogs(options?: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  minMood?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const [data, setData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.page) params.set("page", String(options.page));
      if (options?.limit) params.set("limit", String(options.limit));
      if (options?.search) params.set("search", options.search);
      if (options?.startDate) params.set("startDate", options.startDate);
      if (options?.endDate) params.set("endDate", options.endDate);
      if (options?.minMood) params.set("minMood", String(options.minMood));
      if (options?.sortBy) params.set("sortBy", options.sortBy);
      if (options?.sortOrder) params.set("sortOrder", options.sortOrder);

      const res = await fetch(`/api/logs?${params}`);
      const json = await res.json();
      if (json.data) setData(json.data);
      else setError(json.error ?? "Failed to fetch logs");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { data, loading, error, refresh: fetch_ };
}
