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
          w-full rounded-lg border bg-surface px-4 py-3
          text-sm text-text placeholder:text-text-secondary
          outline-none transition-colors duration-200
          focus:border-primary focus:ring-2 focus:ring-primary/15
          disabled:cursor-not-allowed disabled:opacity-50
          ${hasError ? "border-error focus:border-error focus:ring-error/15" : "border-border"}
          ${className}
        `}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;