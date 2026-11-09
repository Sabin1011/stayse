import type { Pool } from "pg";

import type {
  CreateRefreshSessionData,
  RefreshSession,
  RefreshSessionRepository,
} from "../../../../application/interfaces/repositories/refresh-session-repository.interface.js";

interface RefreshSessionRow {
  id: string;
  user_id: string;
  token_hash: string;
  family_id: string;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_session_id: string | null;
  last_used_at: Date | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: Date;
}

export class PostgresRefreshSessionRepository
  implements RefreshSessionRepository
{
  constructor(private readonly pool: Pool) {}

  private toDomain(row: RefreshSessionRow): RefreshSession {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      familyId: row.family_id,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      replacedBySessionId: row.replaced_by_session_id,
      lastUsedAt: row.last_used_at,
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    };
  }

  async create(data: CreateRefreshSessionData): Promise<RefreshSession> {
    const result = await this.pool.query<RefreshSessionRow>(
      `INSERT INTO refresh_sessions (
        user_id,
        token_hash,
        family_id,
        expires_at,
        user_agent,
        ip_address
      )
      VALUES ($1, $2, COALESCE($3, gen_random_uuid()), $4, $5, $6)
      RETURNING *`,
      [
        data.userId,
        data.tokenHash,
        data.familyId ?? null,
        data.expiresAt,
        data.userAgent ?? null,
        data.ipAddress ?? null,
      ],
    );

    const row = result.rows[0];

    if (!row) {
        throw new Error("Failed to create refresh session");
    }

    return this.toDomain(row);
  }

  async rotate(
    oldSessionId: string,
    newSession: CreateRefreshSessionData,
  ): Promise<RefreshSession> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Create the replacement refresh session
      const insertResult = await client.query<RefreshSessionRow>(
        `INSERT INTO refresh_sessions (
          user_id,
          token_hash,
          family_id,
          expires_at,
          user_agent,
          ip_address
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          newSession.userId,
          newSession.tokenHash,
          newSession.familyId,
          newSession.expiresAt,
          newSession.userAgent ?? null,
          newSession.ipAddress ?? null,
        ],
      );

      const newRow = insertResult.rows[0];

      if (!newRow) {
        throw new Error("Failed to create replacement refresh session");
      }

      // Revoke the previous session and link it to the replacement
      const updateResult = await client.query(
        `UPDATE refresh_sessions
        SET revoked_at = NOW(),
            replaced_by_session_id = $2,
            last_used_at = NOW()
        WHERE id = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()`,
        [oldSessionId, newRow.id],
      );

      if (updateResult.rowCount !== 1) {
        throw new Error("Refresh session is no longer active");
      }

      await client.query("COMMIT");

      return this.toDomain(newRow);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<RefreshSession | null> {
    const result = await this.pool.query<RefreshSessionRow>(
      `SELECT *
       FROM refresh_sessions
       WHERE token_hash = $1
         AND revoked_at IS NULL
         AND expires_at > NOW()`,
      [tokenHash],
    );

    return result.rows[0] ? this.toDomain(result.rows[0]) : null;
  }

  async revoke(
    sessionId: string,
    replacedBySessionId?: string,
  ): Promise<void> {
    await this.pool.query(
      `UPDATE refresh_sessions
       SET revoked_at = NOW(),
           replaced_by_session_id = $2
       WHERE id = $1
         AND revoked_at IS NULL`,
      [sessionId, replacedBySessionId ?? null],
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
  await this.pool.query(
    `
      UPDATE refresh_sessions
      SET revoked_at = NOW()
      WHERE user_id = $1
        AND revoked_at IS NULL
    `,
    [userId],
  );
}
}