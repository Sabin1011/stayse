import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";

export interface UpdateUserProfileInput {
  userId: string;
  fullName: string;
}

export class UpdateUserProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserProfileInput) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.changeFullName(input.fullName);

    const updatedUser = await this.userRepository.update(user);

    return {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email.getValue(),
      status: updatedUser.status,
      emailVerified: updatedUser.isEmailVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}