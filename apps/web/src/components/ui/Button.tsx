
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

const baseStyles = [
  "inline-flex items-center justify-center gap-2",
  "rounded-xl font-semibold",
  "transition-all duration-200 ease-out",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "active:scale-[0.98]",
].join(" ");

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md",

  secondary:
    "border border-transparent bg-surface-secondary text-text hover:border-border hover:bg-surface-secondary/80",

  outline:
    "border border-border bg-surface text-text shadow-sm hover:border-primary/40 hover:bg-surface-secondary",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "rounded-lg px-3.5 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "rounded-2xl px-6 py-3.5 text-base",
};

function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}

export default Button;
