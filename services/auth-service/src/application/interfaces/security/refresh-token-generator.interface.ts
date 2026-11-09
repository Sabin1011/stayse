export interface RefreshTokenGenerator {
  generate(): string;
  hash(token: string): string;
}