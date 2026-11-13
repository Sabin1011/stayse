import { RegisterUser } from "../../application/use-cases/register-user.use-case.js";
import { SendEmailVerificationOtp } from "../../application/use-cases/send-email-verification-otp.use-case.js";

import { PostgresUserRepository } from "../database/postgres/repositories/postgres-user.repository.js";
import { PostgresVerificationChallengeRepository } from "../database/postgres/repositories/postgres-verification-challenge.repository.js";

import { postgresPool } from "../database/postgres/pool.js";

import { BcryptPasswordHasher } from "../security/bcrypt-password-hasher.js";
import { NodemailerEmailSender } from "../email/nodemailer-email-sender.js";
import { CryptoOtpGenerator } from "../security/crypto-otp-generator.js";
import { HmacOtpHasher } from "../security/hmac-otp-hasher.js";
import { VerifyEmailOtp } from "../../application/use-cases/verify-email-otp.use-case.js";
import { VerifyEmailOtpController } from "../../presentation/http/controllers/verify-email-otp.controller.js";

import { CryptoRefreshTokenGenerator } from "../security/crypto-refresh-token-generator.js";
import { JwtAccessTokenGenerator } from "../security/jwt-access-token-generator.js";
import { PostgresRefreshSessionRepository } from "../database/postgres/repositories/postgres-refresh-session.repository.js";

import { LoginUser } from "../../application/use-cases/login-user.use-case.js";

import { RefreshAccessToken } from "../../application/use-cases/refresh-access-token.use-case.js";
import { LogoutUser } from "../../application/use-cases/logout-user.use-case.js";
import { JwtAccessTokenVerifier } from "../security/jwt-access-token-verifier.js";
import { AuthenticateMiddleware } from "../../presentation/http/middlewares/authenticate.middleware.js";
import { GetCurrentUserController } from "../../presentation/http/controllers/get-current-user.controller.js";

import { AuthorizeRolesMiddleware } from "../../presentation/http/middlewares/authorize-roles.middleware.js";
import { ResendEmailVerificationOtpController } from "../../presentation/http/controllers/resend-email-verification-otp.controller.js";


import { RequestPasswordResetOtp } from "../../application/use-cases/request-password-reset-otp.use-case.js";
import { VerifyPasswordResetOtp } from "../../application/use-cases/verify-password-reset-otp.use-case.js";
import { ResetPassword } from "../../application/use-cases/reset-password.use-case.js";

import { PostgresPasswordResetGrantRepository } from "../database/postgres/repositories/postgres-password-reset-grant.repository.js";

import { CryptoPasswordResetTokenGenerator } from "../security/crypto-password-reset-token-generator.js";

import { RequestPasswordResetOtpController } from "../../presentation/http/controllers/request-password-reset-otp.controller.js";
import { VerifyPasswordResetOtpController } from "../../presentation/http/controllers/verify-password-reset-otp.controller.js";
import { ResetPasswordController } from "../../presentation/http/controllers/reset-password.controller.js";
import { ChangePassword } from "../../application/use-cases/change-password.use-case.js";

import { GoogleIdTokenVerifierImpl } from "../security/google-id-token-verifier.js";

import { GoogleSignIn } from "../../application/use-cases/google-sign-in.use-case.js";

import { PostgresExternalIdentityRepository } from "../database/postgres/repositories/postgres-external-identity.repository.js";
import { GoogleSignInController } from "../../presentation/http/controllers/google-sign-in.controller.js";

import { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case.js";
import { UpdateUserProfileUseCase } from "../../application/use-cases/update-user-profile.use-case.js";

import { CloudinaryImageStorage } from "../cloudinary/cloudinary-image-storage.js";
import { UploadProfileImageUseCase } from "../../application/use-cases/upload-profile-image.use-case.js";

const userRepository = new PostgresUserRepository(postgresPool);

const passwordResetGrantRepository =
  new PostgresPasswordResetGrantRepository(postgresPool);

export const passwordResetTokenGenerator =
  new CryptoPasswordResetTokenGenerator();

const verificationChallengeRepository =
  new PostgresVerificationChallengeRepository(postgresPool);

const passwordHasher = new BcryptPasswordHasher();

export const emailSender = new NodemailerEmailSender();

export const otpGenerator = new CryptoOtpGenerator();
export const otpHasher = new HmacOtpHasher();

export { verificationChallengeRepository };

export const sendEmailVerificationOtp = new SendEmailVerificationOtp(
  userRepository,
  verificationChallengeRepository,
  otpGenerator,
  otpHasher,
  emailSender,
);

export const registerUser = new RegisterUser(
  userRepository,
  passwordHasher,
  sendEmailVerificationOtp,
);

export const verifyEmailOtp = new VerifyEmailOtp(
  userRepository,
  verificationChallengeRepository,
  otpHasher,
);

export const verifyEmailOtpController = new VerifyEmailOtpController(
  verifyEmailOtp,
);

export const resendEmailVerificationOtpController =
  new ResendEmailVerificationOtpController(
    userRepository,
    sendEmailVerificationOtp,
  );

const refreshSessionRepository = new PostgresRefreshSessionRepository(postgresPool);
export const refreshTokenGenerator = new CryptoRefreshTokenGenerator();

export const accessTokenGenerator = new JwtAccessTokenGenerator();
export const accessTokenVerifier = new JwtAccessTokenVerifier();


export const authenticateMiddleware = new AuthenticateMiddleware(
  accessTokenVerifier,
);

export const authorizeRolesMiddleware = new AuthorizeRolesMiddleware(userRepository);

export const getCurrentUserUseCase = new GetCurrentUserUseCase(
  userRepository,
)

export const getCurrentUserController = new GetCurrentUserController(
  getCurrentUserUseCase,
);


export const loginUser = new LoginUser(
  userRepository,
  passwordHasher,
  accessTokenGenerator,
  refreshTokenGenerator,
  refreshSessionRepository,
);

export const refreshAccessToken = new RefreshAccessToken(
  userRepository,
  refreshSessionRepository,
  accessTokenGenerator,
  refreshTokenGenerator,
);

export const logoutUser = new LogoutUser(
  refreshSessionRepository,
  refreshTokenGenerator,
);

export const changePassword = new ChangePassword(
  userRepository,
  refreshSessionRepository,
  passwordHasher,
);

// Password reset: request OTP
export const requestPasswordResetOtp =
  new RequestPasswordResetOtp(
    userRepository,
    verificationChallengeRepository,
    otpGenerator,
    otpHasher,
    emailSender,
  );

export const requestPasswordResetOtpController =
  new RequestPasswordResetOtpController(
    requestPasswordResetOtp,
  );


// Password reset: verify OTP
export const verifyPasswordResetOtp =
  new VerifyPasswordResetOtp(
    userRepository,
    verificationChallengeRepository,
    passwordResetGrantRepository,
    otpHasher,
    passwordResetTokenGenerator,
  );

export const verifyPasswordResetOtpController =
  new VerifyPasswordResetOtpController(
    verifyPasswordResetOtp,
  );


// Password reset: update password
export const resetPassword =
  new ResetPassword(
    passwordResetGrantRepository,
    passwordHasher,
    passwordResetTokenGenerator,
  );

export const resetPasswordController =
  new ResetPasswordController(
    resetPassword,
  );


export const googleIdTokenVerifier = new GoogleIdTokenVerifierImpl();

const externalIdentityRepository =
  new PostgresExternalIdentityRepository(postgresPool);

export const googleSignIn = new GoogleSignIn(
  googleIdTokenVerifier,
  userRepository,
  externalIdentityRepository,
  accessTokenGenerator,
  refreshTokenGenerator,
  refreshSessionRepository,
);

export const googleSignInController = new GoogleSignInController(
  googleSignIn,
);

export const updateUserProfile = new UpdateUserProfileUseCase(
  userRepository,
);

export const imageStorage = new CloudinaryImageStorage();

export const uploadProfileImage = new UploadProfileImageUseCase(
  userRepository,
  imageStorage,
);