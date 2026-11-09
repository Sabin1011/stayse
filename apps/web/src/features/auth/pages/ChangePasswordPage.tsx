import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import AuthLayout from "../../../components/layout/AuthLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";

import PasswordInput from "../components/PasswordInput";

import { useAppDispatch } from "../../../app/store/hooks";
import { clearCredentials } from "../../../app/store/authSlice";

import { changePassword } from "../../../services/api/authApi";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../validation/changePassword.schema";

function ChangePasswordPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setApiError(null);

    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      // Backend revokes all refresh sessions.
      // Clear the current frontend authentication state too.
      dispatch(clearCredentials());

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Your password has been changed successfully. Please sign in again.",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error?.message ??
          error.response?.data?.message;

        setApiError(
          typeof message === "string"
            ? message
            : "Unable to change your password. Please try again.",
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout
      title="Change your password"
      description="Keep your Stayse account secure with a strong password."
    >
      <Card className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text">
            Update password
          </h2>

          <p className="text-sm text-text-secondary">
            Enter your current password and choose a new one.
            You'll need to sign in again after changing it.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            label="Current password"
            name="currentPassword"
            required
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="currentPassword"
              placeholder="Enter your current password"
              autoComplete="current-password"
              hasError={Boolean(errors.currentPassword)}
              {...register("currentPassword")}
            />
          </FormField>

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
              placeholder="Confirm your new password"
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
            Change password
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          <Link
            to="/"
            className="font-semibold text-primary hover:underline"
          >
            Back to home
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}

export default ChangePasswordPage;