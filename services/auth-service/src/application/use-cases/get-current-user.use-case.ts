import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";

export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const roles = await this.userRepository.findRolesByUserId(userId);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email.getValue(),
      status: user.status,
      emailVerified: user.isEmailVerified,
      roles,
      createdAt: user.createdAt,
    };
  }
}