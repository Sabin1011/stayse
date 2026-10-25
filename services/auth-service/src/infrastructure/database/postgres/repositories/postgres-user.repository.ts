
import type { Pool } from "pg";

import type {
  CreateUserData,
  UserRecord,
  UserRepository,
} from "../../../../application/interfaces/repositories/user-repository.interface.js";

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.pool.query(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          password_hash AS "passwordHash",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.pool.query(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          password_hash AS "passwordHash",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async create(data: CreateUserData): Promise<UserRecord> {
    const result = await this.pool.query(
      `
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING
          id,
          full_name AS "fullName",
          email,
          password_hash AS "passwordHash",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [data.fullName, data.email, data.passwordHash],
    );

    const user = result.rows[0];
    if(!user) {
      throw new Error("Failed to create user: no record returned");
    }
    return user;
  }
}
