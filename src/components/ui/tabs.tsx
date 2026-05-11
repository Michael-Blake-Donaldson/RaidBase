"use client";

import { type ReactNode } from "react";

type Tab = {
  id: string;
  label: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={[
        "flex gap-1 rounded-2xl p-1 rb-surface-soft",
        className,
      ].join(" ")}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition",
            activeTab === tab.id
              ? "rb-button-primary shadow-sm"
              : "rb-text-muted hover:rb-text-body",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
