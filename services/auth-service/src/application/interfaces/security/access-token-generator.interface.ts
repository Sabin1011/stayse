export interface AccessTokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface AccessTokenGenerator {
  generate(payload: AccessTokenPayload): string;
}