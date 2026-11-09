import { DomainError } from "../errors/domain-error.js";

export class EmailAddress {
  private constructor(
    private readonly value: string,
  ) {}

  static create(email: string): EmailAddress {
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new DomainError(
        "Invalid email address",
        "INVALID_EMAIL",
      );
    }

    return new EmailAddress(normalizedEmail);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}