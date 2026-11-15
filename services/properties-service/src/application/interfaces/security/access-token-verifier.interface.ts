export interface VerifiedAccessToken {
  userId: string;
  email: string;
  roles: string[];
}

export interface AccessTokenVerifier {
  verify(token: string): VerifiedAccessToken;
}