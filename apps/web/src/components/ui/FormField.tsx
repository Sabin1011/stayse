import type { ReactNode } from "react";
import Input from "./Input";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  children?: ReactNode;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

function FormField({
  label,
  name,
  error,
  children,
  required = false,
  type = "text",
  placeholder,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-sm font-medium text-text"
      >
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </label>

      {children ?? (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          hasError={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}

      {error && (
        <p
          id={`${name}-error`}
          className="text-xs text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;