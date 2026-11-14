import { createBrowserRouter } from "react-router-dom";

import RegisterPage from "../../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import HomePage from "../../features/home/pages/HomePage";

import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import VerifyResetOtpPage from "../../features/auth/pages/VerifyResetOtpPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import ChangePasswordPage from "../../features/auth/pages/ChangePasswordPage";

import SearchResultsPage from "../../features/home/pages/SearchResultsPage";

import ProfilePage from "../../features/profile/pages/ProfilePage";
import EditProfilePage from "../../features/profile/pages/EditProfilePage";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Authenticated routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/account/profile",
        element: <ProfilePage />,
      },
      {
        path: "/account/profile/edit",
        element: <EditProfilePage />,
      },
      {
        path: "/account/change-password",
        element: <ChangePasswordPage />,
      },
      // Guest routes
      {
        element: <RoleBasedRoute allowedRoles={["guest"]} />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },

          {
            path: "/search",
            element: <SearchResultsPage />,
          },
        ],
      },

      // Host routes
      {
        element: <RoleBasedRoute allowedRoles={["host"]} />,
        children: [
          {
            path: "/host/dashboard",
            element: <div>Host Dashboard</div>,
          },
        ],
      },

      // Admin routes
      {
        element: <RoleBasedRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: "/admin/dashboard",
            element: <div>Admin Dashboard</div>,
          },
        ],
      },
    ],
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/verify-reset-otp",
    element: <VerifyResetOtpPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);