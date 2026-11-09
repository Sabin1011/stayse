import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import AuthLayout from "../../../components/layout/AuthLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import OTPInput from "../components/OTPInput";

import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
} from "../../../services/api/authApi";

import {
  verifyResetOtpSchema,
  type VerifyResetOtpFormValues,
} from "../validation/verifyResetOtp.schema";

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

function VerifyResetOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email as string | undefined;

  const [otpTimeLeft, setOtpTimeLeft] = useState(5 * 60);
  const [resendTimeLeft, setResendTimeLeft] = useState(30);

  const [verifyError, setVerifyError] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyResetOtpFormValues>({
    resolver: zodResolver(verifyResetOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otp = watch("otp");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOtpTimeLeft((previous) => Math.max(previous - 1, 0));
      setResendTimeLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const onSubmit = async (data: VerifyResetOtpFormValues) => {
    if (!email) {
      setVerifyError("Email address is missing.");
      return;
    }

    setVerifyError("");

    try {
      const response = await verifyPasswordResetOtp({
        email,
        otp: data.otp,
      });

      navigate("/reset-password", {
        state: {
          resetToken: response.resetToken,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setVerifyError(
          error.response?.data?.error?.message ??
            error.response?.data?.message ??
            "Invalid or expired OTP. Please try again.",
        );
      } else {
        setVerifyError("Something went wrong. Please try again.");
      }
    }
  };

  const handleResendOtp = async () => {
    if (!email || resendTimeLeft > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendMessage("");

    try {
      const response = await requestPasswordResetOtp({ email });

      setResendMessage(
        response.message || "A new OTP request has been submitted.",
      );

      setOtpTimeLeft(5 * 60);
      setResendTimeLeft(30);

      setValue("otp", "", {
        shouldValidate: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setResendError(
          error.response?.data?.error?.message ??
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

  if (!email) {
    return null;
  }

  return (
    <AuthLayout
      title="Verify your identity"
      description="Enter the six-digit password reset code sent to your email."
    >
      <Card className="space-y-5">
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Verification code sent to
          </p>

          <p className="font-semibold text-text">
            {email}
          </p>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-text-secondary">
            {otpTimeLeft > 0
              ? `OTP expires in ${formatTime(otpTimeLeft)}`
              : "OTP has expired. Request a new code."}
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
            disabled={isSubmitting || otpTimeLeft === 0}
            hasError={Boolean(errors.otp || verifyError)}
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
            disabled={isSubmitting || otpTimeLeft === 0}
          >
            Verify code
          </Button>
        </form>

        <div className="space-y-2">
          <Button
            type="button"
            fullWidth
            variant="outline"
            disabled={resendTimeLeft > 0 || isResending}
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

        <p className="text-center text-sm text-text-secondary">
          Entered the wrong email?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-primary hover:underline"
          >
            Change email
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}

export default VerifyResetOtpPage;