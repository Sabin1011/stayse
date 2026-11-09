
import { User } from "../../domain/entities/user.entity.js";
import { AppError } from "../errors/app-error.js";

import type {
  UserRepository,
} from "../interfaces/repositories/user-repository.interface.js";

import type {
  PasswordHasher,
} from "../interfaces/security/password-hasher.interface.js";

import { SendEmailVerificationOtp } from "./send-email-verification-otp.use-case.js";

export interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sendEmailVerificationOtp: SendEmailVerificationOtp,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // 1. Hash the plain-text password
    const passwordHash = await this.passwordHasher.hash(input.password);

    // 2. Create the domain entity
    const user = User.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });

    // 3. Check whether the email already exists
    const existingUser = await this.userRepository.findByEmail(
      user.email.getValue(),
    );

    if (existingUser) {
      throw new AppError(
        "An account with this email already exists",
        "EMAIL_ALREADY_EXISTS",
      );
    }

    // 4. Persist user and assign default guest role
    let registeredUser: User;
    
    try {
      registeredUser = await this.userRepository.registerWithDefaultRole({
        fullName: user.fullName,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        status: user.status,
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new AppError(
          "An account with this email already exists",
          "EMAIL_ALREADY_EXISTS",
        );
      }

      throw error;
    }

    // 5. Send email verification OTP
    await this.sendEmailVerificationOtp.execute({
      userId: registeredUser.id!,
    });

    return registeredUser;
  }
}
