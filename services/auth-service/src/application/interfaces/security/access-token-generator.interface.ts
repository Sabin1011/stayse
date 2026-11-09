export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface AccessTokenGenerator {
  generate(payload: AccessTokenPayload): string;
}