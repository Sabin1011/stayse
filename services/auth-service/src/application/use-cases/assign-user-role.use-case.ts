import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";

export class AssignUserRole {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: { userId: string }): Promise<void> {
    await this.userRepository.assignRoleToUser(
      input.userId,
      "host",
    );
  }
}