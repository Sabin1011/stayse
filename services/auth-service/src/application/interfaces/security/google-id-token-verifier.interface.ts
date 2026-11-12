export interface GoogleUserInfo {
  googleId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  profileImage?: string;
}

export interface GoogleIdTokenVerifier {
  verify(idToken: string): Promise<GoogleUserInfo>;
}