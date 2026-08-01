import type { SVGProps } from "react";

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="9" className="fill-surface" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" className="stroke-border" />
      <rect x="8" y="17" width="4" height="8" rx="2" className="fill-accent" />
      <rect x="14" y="10" width="4" height="15" rx="2" className="fill-accent" />
      <rect x="20" y="14" width="4" height="11" rx="2" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="text-[15px] font-semibold tracking-tight text-text">
        README <span className="font-normal text-text-muted">Cards</span>
      </span>
    </span>
  );
}
