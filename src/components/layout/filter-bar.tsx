"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

type FilterBarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  className?: string;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  className = "",
}: FilterBarProps) {
  return (
    <div className={["flex flex-wrap items-center gap-3", className].join(" ")}>
      {onSearchChange !== undefined ? (
        <label className="relative flex-1">
          <span className="sr-only">Search</span>
          <Search className="rb-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rb-field w-full rounded-xl py-2 pl-9 pr-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          />
        </label>
      ) : null}
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
    </div>
  );
}
