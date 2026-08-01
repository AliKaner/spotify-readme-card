import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`shadow-card rounded-2xl border border-border bg-surface p-6 ${className}`} {...props} />;
}
