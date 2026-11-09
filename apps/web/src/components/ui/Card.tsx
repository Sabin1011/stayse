import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
