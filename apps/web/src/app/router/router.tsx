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
import HostApplicationPage from "../../features/host-application/pages/HostApplicationPage";

import HostLayout from "../../features/host/layout/HostLayout";
import HostDashboardPage from "../../features/host/pages/HostDashboardPage";

import AdminHostApplicationsPage from "../../features/admin/pages/AdminHostApplicationsPage";

import AdminLayout from "../../features/admin/layout/AdminLayout";

import AdminHostApplicationDetailsPage from "../../features/admin/pages/AdminHostApplicationDetailsPage";

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

      // Guest experience: accessible to guests and approved hosts
      {
        element: <RoleBasedRoute allowedRoles={["guest", "host"]} />,
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

      // Guest host-application route
      {
        element: <RoleBasedRoute allowedRoles={["guest"]} />,
        children: [
          {
            path: "/host-application",
            element: <HostApplicationPage />,
          },
        ],
      },


      // Host routes
      {
        element: <RoleBasedRoute allowedRoles={["host"]} />,
        children: [
          {
            element: <HostLayout />,
            children: [
              {
                path: "/host/dashboard",
                element: <HostDashboardPage />,
              },
              {
                path: "/host/application",
                element: <HostApplicationPage />,
              },
            ],
          },
        ],
      },
      
      // Admin routes
      {
        element: <RoleBasedRoute allowedRoles={["admin"]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: "/admin/dashboard",
                element: <AdminHostApplicationsPage />,
              },
              {
                path: "/admin/host-applications",
                element: <AdminHostApplicationsPage />,
              },
              {
                path: "/admin/host-applications/:applicationId",
                element: <AdminHostApplicationDetailsPage />,
              },
            ],
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