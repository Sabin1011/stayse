import bcrypt from "bcrypt";

import type { PasswordHasher } from "../../application/interfaces/security/password-hasher.interface.js";

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12;

  async hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, this.saltRounds);
  }

  async compare(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}