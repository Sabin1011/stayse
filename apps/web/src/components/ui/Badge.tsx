
import type { ReactNode } from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success ring-1 ring-inset ring-success/15",
  warning: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/15",
  error: "bg-error/10 text-error ring-1 ring-inset ring-error/15",
  info: "bg-info/10 text-info ring-1 ring-inset ring-info/15",
  neutral:
    "bg-surface-secondary text-text-secondary ring-1 ring-inset ring-border",
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        px-3 py-1.5 text-xs font-semibold
        tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
