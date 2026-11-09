import { useRef } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
}

function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from(
    { length },
    (_, index) => value[index] ?? "",
  );

  const handleChange = (
    index: number,
    inputValue: string,
  ) => {
    const digit = inputValue.replace(/\D/g, "").slice(-1);

    const updatedDigits = [...digits];
    updatedDigits[index] = digit;

    onChange(updatedDigits.join(""));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < length - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    onChange(pastedDigits);

    const nextIndex = Math.min(
      pastedDigits.length,
      length - 1,
    );

    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) =>
            handleChange(index, event.target.value)
          }
          onKeyDown={(event) =>
            handleKeyDown(index, event)
          }
          onPaste={handlePaste}
          aria-label={`OTP digit ${index + 1}`}
          aria-invalid={hasError}
          className={`
            h-12 w-11 rounded-lg border
            bg-surface text-center text-lg font-semibold
            text-text outline-none transition-colors
            focus:border-primary focus:ring-2 focus:ring-primary/15
            disabled:cursor-not-allowed disabled:opacity-50
            sm:h-14 sm:w-12
            ${
              hasError
                ? "border-error"
                : "border-border"
            }
          `}
        />
      ))}
    </div>
  );
}

export default OTPInput;