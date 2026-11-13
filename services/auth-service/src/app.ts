
import express from "express";
import cookieParser from "cookie-parser";

import {
  registerUser,
  emailSender,
  verifyEmailOtp,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUserController,
  authenticateMiddleware,
  authorizeRolesMiddleware,
  resendEmailVerificationOtpController,
  requestPasswordResetOtpController,
  verifyPasswordResetOtpController,
  resetPasswordController,
  changePassword,
  googleSignIn,
  updateUserProfile,
  uploadProfileImage,
} from "./infrastructure/di/container.js";

import { createAuthRoutes } from "./presentation/http/routes/auth.routes.js";
import { errorHandler } from "./presentation/http/middlewares/error-handler.js";


const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "stayse-auth-service",
  });
});

app.use(
  "/auth",
  createAuthRoutes(
    registerUser,
    emailSender,
    verifyEmailOtp,
    loginUser,
    refreshAccessToken,
    logoutUser,
    authenticateMiddleware,
    authorizeRolesMiddleware,
    resendEmailVerificationOtpController,
    getCurrentUserController,
    requestPasswordResetOtpController,
    verifyPasswordResetOtpController,
    resetPasswordController,
    changePassword,
    googleSignIn,
    updateUserProfile,
    uploadProfileImage,
  ),
);


app.use(errorHandler);

export default app;
