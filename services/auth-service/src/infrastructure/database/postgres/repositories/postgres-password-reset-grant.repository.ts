
import type { Pool, QueryResultRow } from "pg";

import type { PasswordResetGrantRepository } from "../../../../application/interfaces/repositories/password-reset-grant-repository.interface.js";

interface PasswordResetGrantRow extends QueryResultRow {
  id: string;
  user_id: string;
}

export class PostgresPasswordResetGrantRepository
  implements PasswordResetGrantRepository
{
  constructor(private readonly pool: Pool) {}

  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO password_reset_grants (
          user_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3)
      `,
      [
        data.userId,
        data.tokenHash,
        data.expiresAt,
      ],
    );
  }

  async consumeAndResetPassword(
    tokenHash: string,
    passwordHash: string,
  ): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Lock the reset grant so concurrent requests
      // cannot successfully use the same grant.
      const grantResult =
        await client.query<PasswordResetGrantRow>(
          `
            SELECT
              prg.id,
              prg.user_id
            FROM password_reset_grants prg
            INNER JOIN users u
              ON u.id = prg.user_id
            WHERE prg.token_hash = $1
              AND prg.consumed_at IS NULL
              AND prg.expires_at > NOW()
              AND u.status = 'active'
              AND u.email_verified_at IS NOT NULL
            FOR UPDATE OF prg
          `,
          [tokenHash],
        );

      const grant = grantResult.rows[0];

      if (!grant) {
        await client.query("ROLLBACK");
        return false;
      }

      // 2. Update the user's password.
      const userResult = await client.query(
        `
          UPDATE users
          SET
            password_hash = $1,
            updated_at = NOW()
          WHERE id = $2
            AND status = 'active'
            AND email_verified_at IS NOT NULL
        `,
        [
          passwordHash,
          grant.user_id,
        ],
      );

      if (userResult.rowCount !== 1) {
        throw new Error("Failed to update user password");
      }

      // 3. Consume the reset grant.
      const consumeResult = await client.query(
        `
          UPDATE password_reset_grants
          SET consumed_at = NOW()
          WHERE id = $1
            AND consumed_at IS NULL
            AND expires_at > NOW()
        `,
        [grant.id],
      );

      if (consumeResult.rowCount !== 1) {
        throw new Error("Failed to consume password reset grant");
      }

      // 4. Revoke all existing refresh sessions.
      await client.query(
        `
          UPDATE refresh_sessions
          SET revoked_at = NOW()
          WHERE user_id = $1
            AND revoked_at IS NULL
        `,
        [grant.user_id],
      );

      // 5. Invalidate any remaining password-reset OTPs.
      await client.query(
        `
          UPDATE verification_challenges
          SET consumed_at = NOW()
          WHERE user_id = $1
            AND challenge_type = 'password_reset'
            AND consumed_at IS NULL
        `,
        [grant.user_id],
      );

      // 6. Commit all changes together.
      await client.query("COMMIT");

      return true;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          "Password reset failed and transaction rollback also failed",
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }
}
