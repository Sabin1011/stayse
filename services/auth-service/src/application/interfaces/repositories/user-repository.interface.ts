import type { User, UserStatus } from "../../../domain/entities/user.entity.js";

export interface CreateUserData {
  fullName: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;
  findRolesByUserId(userId: string): Promise<string[]>;

  registerWithDefaultRole(data: CreateUserData): Promise<User>;
  update(user: User): Promise<User>;
}