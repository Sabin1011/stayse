
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import AuthLayout from "../../../components/layout/AuthLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import PasswordInput from "../components/PasswordInput";
import GoogleSignInButton from "../components/GoogleSignInButton";

import { useAppDispatch } from "../../../app/store/hooks";
import { setAccessToken, setUser } from "../../../app/store/authSlice";

import {
  loginSchema,
  type LoginFormValues,
} from "../validation/login.schema";

import {
  loginUser,
  googleSignIn,
  getCurrentUser,
} from "../../../services/api/authApi";

import { store } from "../../../app/store/store";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const successMessage = location.state?.message as string | undefined;

  const [apiError, setApiError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const completeLogin = async (accessToken: string) => {
    console.log("Received access token:", !!accessToken);

    dispatch(setAccessToken(accessToken));

    console.log(
      "Redux access token:",
      !!store.getState().auth.accessToken,
    );

    try {
      const currentUserResponse = await getCurrentUser();
      dispatch(setUser(currentUserResponse.user));
      navigate("/");
    } catch (error) {
      dispatch(setAccessToken(""));
      throw error;
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);

    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      await completeLogin(response.accessToken);
    } catch (error) {
      console.error("Login failed:", error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;
        setApiError(
          typeof message === "string"
            ? message
            : "Login failed. Please check your credentials.",
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  const handleGoogleSuccess = useCallback(async (idToken: string) => {
    setApiError(null);
    setIsGoogleLoading(true);

    try {
      const response = await googleSignIn({ idToken });
      await completeLogin(response.data.accessToken);
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

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue your Stayse journey."
    >
      <Card className="space-y-5">
        {successMessage && (
          <p
            className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
            role="status"
          >
            {successMessage}
          </p>
        )}

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

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
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
            Sign in
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-text-secondary">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className={isGoogleLoading ? "pointer-events-none opacity-60" : ""}>
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isGoogleLoading || isSubmitting}
          />
        </div>

        {isGoogleLoading && (
          <p className="text-center text-sm text-text-secondary">
            Signing in with Google...
          </p>
        )}

        <p className="text-center text-sm text-text-secondary">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}

export default LoginPage;
