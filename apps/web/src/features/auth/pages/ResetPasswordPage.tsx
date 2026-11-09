import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import AuthLayout from "../../../components/layout/AuthLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import PasswordInput from "../components/PasswordInput";

import { resetPassword } from "../../../services/api/authApi";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../validation/resetPassword.schema";

interface ResetPasswordLocationState {
  resetToken?: string;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as ResetPasswordLocationState | null;
  const resetToken = state?.resetToken;

  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!resetToken) {
      setApiError("Password reset authorization is missing.");
      return;
    }

    setApiError("");

    try {
      const response = await resetPassword({
        resetToken,
        newPassword: data.newPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            response.message ||
            "Your password has been reset successfully. Please sign in.",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(
          error.response?.data?.error?.message ??
            error.response?.data?.message ??
            "Unable to reset your password. Please try again.",
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  if (!resetToken) {
    return null;
  }

  return (
    <AuthLayout
      title="Create a new password"
      description="Choose a strong password to secure your Stayse account."
    >
      <Card className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text">
            Reset your password
          </h2>

          <p className="text-sm text-text-secondary">
            Your new password must contain between 8 and 72 characters.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            label="New password"
            name="newPassword"
            required
            error={errors.newPassword?.message}
          >
            <PasswordInput
              id="newPassword"
              placeholder="Enter your new password"
              autoComplete="new-password"
              hasError={Boolean(errors.newPassword)}
              {...register("newPassword")}
            />
          </FormField>

          <FormField
            label="Confirm new password"
            name="confirmPassword"
            required
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              hasError={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
          </FormField>

          {apiError && (
            <p className="text-sm text-error" role="alert">
              {apiError}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Reset password
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Back to login
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}

export default ResetPasswordPage;