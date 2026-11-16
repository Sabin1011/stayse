
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-border/80
        bg-surface p-5
        shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)]
        transition-all duration-200
        sm:rounded-[24px] sm:p-7
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
