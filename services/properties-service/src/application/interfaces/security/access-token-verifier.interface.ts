export interface VerifiedAccessToken {
  userId: string;
  email: string;
}

export interface AccessTokenVerifier {
  verify(token: string): VerifiedAccessToken;
}