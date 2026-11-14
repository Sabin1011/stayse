import axiosInstance from "./axiosInstance";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    fullName: string;
    email: string;
    status: string;
    createdAt: string;
  };
}

export const registerUser = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(
    "/auth/register",
    data,
  );

  return response.data;
};


export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export const verifyEmail = async (
  data: VerifyEmailRequest,
): Promise<VerifyEmailResponse> => {
  const response = await axiosInstance.post<VerifyEmailResponse>(
    "/auth/verify-email",
    data,
  );

  return response.data;
};

export interface ResendEmailVerificationOtpRequest {
  email: string;
}

export interface ResendEmailVerificationOtpResponse {
  message: string;
}

export const resendEmailVerificationOtp = async (
  data: ResendEmailVerificationOtpRequest,
): Promise<ResendEmailVerificationOtpResponse> => {
  const response =
    await axiosInstance.post<ResendEmailVerificationOtpResponse>(
      "/auth/resend-otp",
      data,
    );

  return response.data;
};


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
}

export const loginUser = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/auth/login",
    data,
  );

  return response.data;
};

export interface GoogleSignInRequest {
  idToken: string;
}

export interface GoogleSignInResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export const googleSignIn = async (
  data: GoogleSignInRequest,
): Promise<GoogleSignInResponse> => {
  const response = await axiosInstance.post<GoogleSignInResponse>(
    "/auth/google",
    data,
  );

  return response.data;
};


export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}

export const refreshAccessToken = async (): Promise<RefreshTokenResponse> => {
  const response = await axiosInstance.post<RefreshTokenResponse>(
    "/auth/refresh",
  );

  return response.data;
};


export interface LogoutResponse {
  message: string;
}

export const logoutUser = async (): Promise<LogoutResponse> => {
  const response = await axiosInstance.post<LogoutResponse>(
    "/auth/logout",
  );

  return response.data;
};

export interface CurrentUserResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    emailVerified: boolean;
    roles: string[];
    createdAt: string;
    profileImageUrl: string | null;
  };
}

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await axiosInstance.get<CurrentUserResponse>(
    "/auth/me",
  );

  return response.data;
};

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const requestPasswordResetOtp = async (
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> => {
  const response = await axiosInstance.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    data,
  );

  return response.data;
};

export interface VerifyPasswordResetOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResponse {
  message: string;
  resetToken: string;
}

export const verifyPasswordResetOtp = async (
  data: VerifyPasswordResetOtpRequest,
): Promise<VerifyPasswordResetOtpResponse> => {
  const response =
    await axiosInstance.post<VerifyPasswordResetOtpResponse>(
      "/auth/verify-reset-otp",
      data,
    );

  return response.data;
};

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  const response = await axiosInstance.post<ResetPasswordResponse>(
    "/auth/reset-password",
    data,
  );

  return response.data;
};

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> => {
  const response = await axiosInstance.post<ChangePasswordResponse>(
    "/auth/change-password",
    data,
  );

  return response.data;
};