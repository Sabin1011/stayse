export interface OtpHasher {
  hash(otp: string): string;
  verify(otp: string, hashedOtp: string): boolean;
}