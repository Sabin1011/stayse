
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      hasError = false,
      className = "",
      ...props
    },
    ref,
  ) {
    return (
      <input
        ref={ref}
        className={`
          w-full rounded-xl border bg-surface
          px-4 py-3.5 text-sm text-text
          placeholder:text-text-secondary/70
          outline-none
          transition-all duration-200
          focus:border-primary focus:ring-4 focus:ring-primary/10
          disabled:cursor-not-allowed disabled:opacity-50
          ${
            hasError
              ? "border-error focus:border-error focus:ring-error/10"
              : "border-border hover:border-primary/40"
          }
          ${className}
        `}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
