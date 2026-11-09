import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "../../../components/layout/AuthLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import OTPInput from "../components/OTPInput";
import {
  verifyEmail,
  resendEmailVerificationOtp,
} from "../../../services/api/authApi";

import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "../validation/verifyEmail.schema";
import axios from "axios";

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email as string | undefined;

  const [otpTimeLeft, setOtpTimeLeft] = useState(5 * 60);
  const [resendTimeLeft, setResendTimeLeft] = useState(30);

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const [verifyError, setVerifyError] = useState("");


  useEffect(() => {
    const timer = window.setInterval(() => {
      setOtpTimeLeft((previous) => Math.max(previous - 1, 0));
      setResendTimeLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otp = watch("otp");
  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!email || resendTimeLeft > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setResendMessage("");
    setResendError("");

    try {
      const response = await resendEmailVerificationOtp({ email });

      setResendMessage(response.message);

      setOtpTimeLeft(5 * 60);
      setResendTimeLeft(30);

      setValue("otp", "", {
        shouldValidate: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setResendError(
          error.response?.data?.message ??
            "Unable to resend OTP. Please try again.",
        );
      } else {
        setResendError("Something went wrong. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

    const onSubmit = async (data: VerifyEmailFormValues) => {
      if (!email) {
        setVerifyError("Email address is missing.");
        return;
      }

      setVerifyError("");

      try {
        const response = await verifyEmail({
          email,
          otp: data.otp,
        });

        console.log("Email verification successful:", response);

        navigate("/login", {
          state: {
            email,
            message: "Email verified successfully. You can now sign in.",
          },
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setVerifyError(
            error.response?.data?.message ??
              "Invalid OTP. Please try again.",
          );
        } else {
          setVerifyError("Something went wrong. Please try again.");
        }
      }
    };

  return (
    <AuthLayout
      title="Verify your email"
      description="Enter the six-digit verification code sent to your email."
    >
      <Card className="space-y-5">
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Verification email sent to:
          </p>

          <p className="font-semibold text-text">
            {email || "No email address provided"}
          </p>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-text-secondary">
            {otpTimeLeft > 0
              ? `OTP expires in ${formatTime(otpTimeLeft)}`
              : "OTP has expired. Please request a new one."}
          </p>

          <p className="text-sm text-text-secondary">
            {resendTimeLeft > 0
              ? `You can resend OTP in ${formatTime(resendTimeLeft)}`
              : "You can request a new OTP now."}
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <OTPInput
            value={otp}
            onChange={(value) =>
              setValue("otp", value, {
                shouldValidate: true,
              })
            }
            disabled={isSubmitting}
            hasError={Boolean(errors.otp)}
          />

          {errors.otp?.message && (
            <p className="text-center text-xs text-error" role="alert">
              {errors.otp.message}
            </p>
          )}

          {verifyError && (
            <p className="text-center text-xs text-error" role="alert">
              {verifyError}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Verify email
          </Button>
        </form>

        <div className="space-y-2">
          <Button
            type="button"
            fullWidth
            disabled={resendTimeLeft > 0 || isResending || !email}
            isLoading={isResending}
            onClick={handleResendOtp}
          >
            {resendTimeLeft > 0
              ? `Resend OTP in ${formatTime(resendTimeLeft)}`
              : "Resend OTP"}
          </Button>

          {resendMessage && (
            <p className="text-center text-sm text-success" role="status">
              {resendMessage}
            </p>
          )}

          {resendError && (
            <p className="text-center text-sm text-error" role="alert">
              {resendError}
            </p>
          )}
        </div>

      </Card>
    </AuthLayout>
  );
}

export default VerifyEmailPage;