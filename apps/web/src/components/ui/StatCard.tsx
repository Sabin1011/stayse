
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  iconClassName?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  iconClassName = "bg-primary/10 text-primary",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-text">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>

      {description && (
        <p className="mt-4 text-xs text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
