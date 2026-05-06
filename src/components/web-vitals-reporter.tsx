"use client";

import { useReportWebVitals } from "next/web-vitals";

type VitalsMetric = {
  id: string;
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
};

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload: VitalsMetric = {
      id: metric.id,
      name: metric.name as VitalsMetric["name"],
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
    };

    if (process.env.NODE_ENV !== "production") {
      // Keep local diagnostics visible during development.
      console.info("[web-vitals]", payload);
      return;
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", JSON.stringify(payload));
      return;
    }

    void fetch("/api/vitals", {
      method: "POST",
      body: JSON.stringify(payload),
      keepalive: true,
      headers: {
        "content-type": "application/json",
      },
    });
  });

  return null;
}
