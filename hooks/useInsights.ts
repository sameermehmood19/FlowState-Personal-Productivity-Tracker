"use client";

import { useState, useEffect } from "react";
import type { Insight } from "@/types";

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      if (json.data) {
        setInsights(json.data);
        setUnreadCount(json.data.filter((i: Insight) => !i.read).length);
      }
    } catch {
      console.error("Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setInsights((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnreadCount(0);
  };

  return { insights, loading, unreadCount, markRead, markAllRead, refresh: fetchInsights };
}
