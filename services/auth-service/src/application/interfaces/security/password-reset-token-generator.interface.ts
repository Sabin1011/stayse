export interface PasswordResetTokenGenerator {
  generate(): string;
  hash(token: string): string;
}