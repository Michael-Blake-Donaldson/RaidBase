import type { ReactNode } from "react";

type Cols = 1 | 2 | 3 | 4;

type PageGridProps = {
  children: ReactNode;
  cols?: Cols;
  className?: string;
};

const colsClass: Record<Cols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function PageGrid({ children, cols = 2, className = "" }: PageGridProps) {
  return (
    <div className={["grid gap-6", colsClass[cols], className].join(" ")}>
      {children}
    </div>
  );
}
