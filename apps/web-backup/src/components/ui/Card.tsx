import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-border
        bg-surface p-6 shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;