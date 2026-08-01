import type { HTMLAttributes } from "react";

type Tone = "accent" | "muted" | "violet";

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent",
  violet: "bg-violet-soft text-violet",
  muted: "bg-surface-hover text-text-muted",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "muted", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
