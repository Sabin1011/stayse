import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import AuthLayout from "../../../components/layout/AuthLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";

import { requestPasswordResetOtp } from "../../../services/api/authApi";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../validation/forgotPassword.schema";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setApiError("");

    try {
      const response = await requestPasswordResetOtp({
        email: data.email.trim().toLowerCase(),
      });

      navigate("/verify-reset-otp", {
        state: {
          email: data.email.trim().toLowerCase(),
          message: response.message,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(
          error.response?.data?.error?.message ??
            error.response?.data?.message ??
            "Unable to process your request. Please try again.",
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter the email address associated with your Stayse account."
    >
      <Card className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text">
            Reset your password
          </h2>

          <p className="text-sm text-text-secondary">
            We'll send a six-digit verification code to your registered
            email address.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            label="Email address"
            name="email"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              autoComplete="email"
              {...register("email")}
              hasError={Boolean(errors.email)}
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
            Send verification code
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

export default ForgotPasswordPage;