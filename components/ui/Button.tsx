import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-black hover:bg-accent-hover",
  secondary: "border border-border bg-surface text-text hover:bg-surface-hover",
  ghost: "text-text-muted hover:text-text",
  danger: "border border-red-500/30 text-red-400 hover:bg-red-500/10",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variantClasses[variant]} ${className}`} {...props} />;
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  href: string;
  children: ReactNode;
}

export function LinkButton({ variant = "primary", className = "", href, children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
