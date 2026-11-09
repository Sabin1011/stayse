export interface PasswordResetGrantRepository {
  create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  consumeAndResetPassword(
    tokenHash: string,
    passwordHash: string,
  ): Promise<boolean>;
}