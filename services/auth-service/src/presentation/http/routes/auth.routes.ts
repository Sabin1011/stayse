import { Router } from "express";

import { RegisterUserController } from "../controllers/register-user.controller.js";
import type { RegisterUser } from "../../../application/use-cases/register-user.use-case.js";

import { VerifyEmailOtpController } from "../controllers/verify-email-otp.controller.js";

import type { EmailSender } from "../../../application/interfaces/email/email-sender.interface.js";
import { TestEmailController } from "../controllers/test-email.controller.js";

import type { VerifyEmailOtp } from "../../../application/use-cases/verify-email-otp.use-case.js";

import type { LoginUser } from "../../../application/use-cases/login-user.use-case.js";
import { LoginUserController } from "../controllers/login-user.controller.js";

import type { RefreshAccessToken } from "../../../application/use-cases/refresh-access-token.use-case.js";
import { RefreshTokenController } from "../controllers/refresh-token.controller.js";
import { LogoutController } from "../controllers/logout.controller.js";
import type { LogoutUser } from "../../../application/use-cases/logout-user.use-case.js";

import type { GetCurrentUserController } from "../controllers/get-current-user.controller.js";
import type { AuthenticateMiddleware } from "../middlewares/authenticate.middleware.js";

import type { AuthorizeRolesMiddleware } from "../middlewares/authorize-roles.middleware.js";
import type { ResendEmailVerificationOtpController } from "../controllers/resend-email-verification-otp.controller.js";

import type { RequestPasswordResetOtpController } from "../controllers/request-password-reset-otp.controller.js";
import type { VerifyPasswordResetOtpController } from "../controllers/verify-password-reset-otp.controller.js";
import type { ResetPasswordController } from "../controllers/reset-password.controller.js";
import type { ChangePassword } from "../../../application/use-cases/change-password.use-case.js";
import { ChangePasswordController } from "../controllers/change-password.controller.js";

import type { GoogleSignIn } from "../../../application/use-cases/google-sign-in.use-case.js";
import { GoogleSignInController } from "../controllers/google-sign-in.controller.js";


export function createAuthRoutes(
  registerUser: RegisterUser,
  emailSender: EmailSender,
  verifyEmailOtp: VerifyEmailOtp,
  loginUser: LoginUser,
  refreshAccessToken: RefreshAccessToken,
  logoutUser: LogoutUser,
  authenticateMiddleware: AuthenticateMiddleware,
  authorizeRolesMiddleware: AuthorizeRolesMiddleware,
  resendEmailVerificationOtpController: ResendEmailVerificationOtpController,
  getCurrentUserController: GetCurrentUserController,
  requestPasswordResetOtpController: RequestPasswordResetOtpController,
  verifyPasswordResetOtpController: VerifyPasswordResetOtpController,
  resetPasswordController: ResetPasswordController,
  changePassword: ChangePassword,
  googleSignIn: GoogleSignIn,
): Router {
  const router = Router();

  const registerUserController = new RegisterUserController(registerUser);
  const testEmailController = new TestEmailController(emailSender);
  const verifyEmailOtpController = new VerifyEmailOtpController(verifyEmailOtp);
  const loginUserController = new LoginUserController(loginUser);
  const refreshTokenController = new RefreshTokenController(refreshAccessToken);
  const logoutController = new LogoutController(logoutUser);
  const changePasswordController = new ChangePasswordController(changePassword);
  const googleSignInController = new GoogleSignInController(googleSignIn);



  router.post("/register", registerUserController.handle);
  router.post(
    "/forgot-password",
    requestPasswordResetOtpController.handle,
  );

  router.post(
    "/verify-reset-otp",
    verifyPasswordResetOtpController.handle,
  );

  router.post(
    "/reset-password",
    resetPasswordController.handle,
  );
  router.post(
    "/change-password",
    authenticateMiddleware.handle,
    changePasswordController.handle,
  );

  router.post("/verify-email", verifyEmailOtpController.handle);
  router.post("/resend-otp", resendEmailVerificationOtpController.handle,);
  router.post("/test-email", testEmailController.handle);
  router.post("/login", loginUserController.handle);
  router.post("/refresh", refreshTokenController.handle);
  router.post("/logout", logoutController.handle);

  router.get("/me", authenticateMiddleware.handle, getCurrentUserController.handle,);

  router.post("/google", googleSignInController.handle);

  return router;


}