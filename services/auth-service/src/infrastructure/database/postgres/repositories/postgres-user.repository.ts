
import type { Pool, QueryResultRow } from "pg";
import crypto from "node:crypto";

import type {
  CreateGoogleUserData,
  CreateUserData,
  UserRepository,
} from "../../../../application/interfaces/repositories/user-repository.interface.js";

import {
  User,
  type UserStatus,
} from "../../../../domain/entities/user.entity.js";

interface UserRow extends QueryResultRow {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  profileImageUrl: string | null;
  profileImagePublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  private toDomain(row: UserRow): User {
    return User.reconstitute({
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      passwordHash: row.passwordHash,
      status: row.status,
      emailVerifiedAt: row.emailVerifiedAt,
      profileImageUrl: row.profileImageUrl,
      profileImagePublicId: row.profileImagePublicId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          password_hash AS "passwordHash",
          status,
          email_verified_at AS "emailVerifiedAt",
          profile_image_url AS "profileImageUrl",
          profile_image_public_id AS "profileImagePublicId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email],
    );

    const row = result.rows[0];

    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          password_hash AS "passwordHash",
          status,
          email_verified_at AS "emailVerifiedAt",
          profile_image_url AS "profileImageUrl",
          profile_image_public_id AS "profileImagePublicId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    const row = result.rows[0];

    return row ? this.toDomain(row) : null;
  }
  async findRolesByUserId(userId: string): Promise<string[]> {
    const result = await this.pool.query<{ role: string }>(
      `
        SELECT r.name AS role
        FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1
      `,
      [userId],
    );

    return result.rows.map((row) => row.role);
  }

  async registerWithDefaultRole(data: CreateUserData): Promise<User> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query<UserRow>(
        `
          INSERT INTO users (full_name, email, password_hash,status)
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            full_name AS "fullName",
            email,
            password_hash AS "passwordHash",
            status,
            email_verified_at AS "emailVerifiedAt",
            profile_image_url AS "profileImageUrl",
            profile_image_public_id AS "profileImagePublicId",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `,
        [data.fullName, data.email, data.passwordHash, data.status,],
      );

      const row = result.rows[0];

      if (!row) {
        throw new Error("Failed to register user: no record returned");
      }

      const roleResult = await client.query(
        `
          INSERT INTO user_roles (user_id, role_id)
          SELECT $1, id
          FROM roles
          WHERE name = $2
        `,
        [row.id, "guest"],
      );

      if (roleResult.rowCount !== 1) {
        throw new Error("Failed to assign the default guest role");
      }

      await client.query("COMMIT");

      return this.toDomain(row);
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          "Registration failed and transaction rollback also failed",
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new Error("Cannot update a user without an ID");
    }

    const result = await this.pool.query<UserRow>(
      `
        UPDATE users
        SET
          full_name = $1,
          password_hash = $2,
          status = $3,
          email_verified_at = $4,
          updated_at = $5
        WHERE id = $6
        RETURNING
          id,
          full_name AS "fullName",
          email,
          password_hash AS "passwordHash",
          status,
          email_verified_at AS "emailVerifiedAt",
          profile_image_url AS "profileImageUrl",
          profile_image_public_id AS "profileImagePublicId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        user.fullName,
        user.passwordHash,
        user.status,
        user.emailVerifiedAt,
        user.updatedAt,
        user.id,
      ],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("User not found or update failed");
    }

    return this.toDomain(row);
  }

  async registerGoogleUser(data: CreateGoogleUserData): Promise<User> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query<UserRow>(
        `
          INSERT INTO users (
            full_name,
            email,
            password_hash,
            status,
            email_verified_at
          )
          VALUES ($1, $2, $3, 'active', NOW())
          RETURNING
            id,
            full_name AS "fullName",
            email,
            password_hash AS "passwordHash",
            status,
            email_verified_at AS "emailVerifiedAt",
            profile_image_url AS "profileImageUrl",
            profile_image_public_id AS "profileImagePublicId",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `,
        [
          data.fullName,
          data.email,
          `google-oauth:${crypto.randomUUID()}`,
        ],
      );

      const row = result.rows[0];

      if (!row) {
        throw new Error("Failed to create Google user");
      }

      const roleResult = await client.query(
        `
          INSERT INTO user_roles (user_id, role_id)
          SELECT $1, id
          FROM roles
          WHERE name = $2
        `,
        [row.id, "guest"],
      );

      if (roleResult.rowCount !== 1) {
        throw new Error("Failed to assign the default guest role");
      }

      await client.query("COMMIT");

      return this.toDomain(row);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateProfile(user: User): Promise<User> {
    if (!user.id) {
      throw new Error("Cannot update a user without an ID");
    }

    const result = await this.pool.query<UserRow>(
      `
        UPDATE users
        SET
          full_name = $1,
          profile_image_url = $2,
          profile_image_public_id = $3,
          updated_at = $4
        WHERE id = $5
        RETURNING
          id,
          full_name AS "fullName",
          email,
          password_hash AS "passwordHash",
          status,
          email_verified_at AS "emailVerifiedAt",
          profile_image_url AS "profileImageUrl",
          profile_image_public_id AS "profileImagePublicId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        user.fullName,
        user.profileImageUrl,
        user.profileImagePublicId,
        user.updatedAt,
        user.id,
      ],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("User not found or profile update failed");
    }

    return this.toDomain(row);
  }
}
