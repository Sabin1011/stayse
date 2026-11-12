
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import AuthLayout from "../../../components/layout/AuthLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import PasswordInput from "../components/PasswordInput";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Input from "../../../components/ui/Input";

import { useAppDispatch } from "../../../app/store/hooks";
import { setAccessToken, setUser } from "../../../app/store/authSlice";

import {
  registerSchema,
  type RegisterFormValues,
} from "../validation/register.schema";

import {
  registerUser,
  googleSignIn,
  getCurrentUser,
} from "../../../services/api/authApi";

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [apiError, setApiError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  // Complete authentication after Google sign-in.
  const completeGoogleLogin = async (accessToken: string) => {
    dispatch(setAccessToken(accessToken));

    try {
      const currentUserResponse = await getCurrentUser();

      dispatch(setUser(currentUserResponse.user));
      navigate("/");
    } catch (error) {
      dispatch({ type: "auth/clearCredentials" });
      throw error;
    }
  };

  // Google sign-in handler.
  const handleGoogleSuccess = useCallback(async (idToken: string) => {
    setApiError(null);
    setIsGoogleLoading(true);

    try {
      const response = await googleSignIn({ idToken });

      await completeGoogleLogin(response.data.accessToken);
    } catch (error) {
      console.error("Google sign-in failed:", error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error?.message;

        setApiError(
          typeof message === "string"
            ? message
            : "Google sign-in failed. Please try again.",
        );
      } else {
        setApiError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);

  const handleGoogleError = useCallback((message: string) => {
    setApiError(message);
  }, []);

  // Normal email/password registration.
  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null);

    try {
      const response = await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      navigate("/verify-email", {
        state: {
          email: response.user.email,
        },
      });
    } catch (error) {
      console.error("Registration failed:", error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        setApiError(
          typeof message === "string"
            ? message
            : "Registration failed. Please try again.",
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join Stayse and discover places worth staying."
    >
      <Card className="space-y-5">
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField
            label="Full name"
            name="fullName"
            required
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              placeholder="Enter your full name"
              {...register("fullName")}
              hasError={Boolean(errors.fullName)}
            />
          </FormField>

          <FormField
            label="Email address"
            name="email"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register("email")}
              hasError={Boolean(errors.email)}
            />
          </FormField>

          <FormField
            label="Password"
            name="password"
            required
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              hasError={Boolean(errors.password)}
              {...register("password")}
            />
          </FormField>

          <FormField
            label="Confirm password"
            name="confirmPassword"
            required
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm your password"
              hasError={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
          </FormField>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <input
                id="termsAccepted"
                type="checkbox"
                className="mt-1 accent-primary"
                {...register("termsAccepted")}
              />

              <label
                htmlFor="termsAccepted"
                className="text-sm text-text-secondary"
              >
                I agree to the Terms of Service and Privacy Policy.
              </label>
            </div>

            {errors.termsAccepted?.message && (
              <p className="text-xs text-error" role="alert">
                {errors.termsAccepted.message}
              </p>
            )}
          </div>

          {apiError && (
            <p className="text-sm text-error" role="alert">
              {apiError}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting || isGoogleLoading}
          >
            Create account
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-text-secondary">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div
          className={
            isGoogleLoading ? "pointer-events-none opacity-60" : ""
          }
        >
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isGoogleLoading || isSubmitting}
          />
        </div>

        {isGoogleLoading && (
          <p className="text-center text-sm text-text-secondary">
            Creating your account...
          </p>
        )}

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}

export default RegisterPage;
