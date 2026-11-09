import type { Pool, QueryResultRow } from "pg";

import type {
  CreateVerificationChallengeData,
  VerificationChallengeRepository,
} from "../../../../application/interfaces/repositories/verification-challenge-repository.interface.js";

import {
  VerificationChallenge,
  type ChallengeType,
} from "../../../../domain/entities/verification-challenge.entity.js";

interface VerificationChallengeRow extends QueryResultRow {
  id: string;
  userId: string | null;
  challengeType: ChallengeType;
  target: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attemptCount: number;
  maxAttempts: number;
  createdAt: Date;
}

export class PostgresVerificationChallengeRepository
  implements VerificationChallengeRepository
{
  constructor(private readonly pool: Pool) {}

  private toDomain(
    row: VerificationChallengeRow,
  ): VerificationChallenge {
    return VerificationChallenge.reconstitute({
      id: row.id,
      userId: row.userId,
      challengeType: row.challengeType,
      target: row.target,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      consumedAt: row.consumedAt,
      attemptCount: row.attemptCount,
      maxAttempts: row.maxAttempts,
      createdAt: row.createdAt,
    });
  }

  async create(
    data: CreateVerificationChallengeData,
  ): Promise<VerificationChallenge> {
    const result = await this.pool.query<VerificationChallengeRow>(
      `
        INSERT INTO verification_challenges (
          user_id,
          challenge_type,
          target,
          token_hash,
          expires_at,
          max_attempts
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          user_id AS "userId",
          challenge_type AS "challengeType",
          target,
          token_hash AS "tokenHash",
          expires_at AS "expiresAt",
          consumed_at AS "consumedAt",
          attempt_count AS "attemptCount",
          max_attempts AS "maxAttempts",
          created_at AS "createdAt"
      `,
      [
        data.userId,
        data.challengeType,
        data.target.trim().toLowerCase(),
        data.tokenHash,
        data.expiresAt,
        data.maxAttempts ?? 5,
      ],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("Failed to create verification challenge");
    }

    return this.toDomain(row);
  }

  async findActiveByTargetAndType(
    target: string,
    challengeType: ChallengeType,
  ): Promise<VerificationChallenge | null> {
    const result = await this.pool.query<VerificationChallengeRow>(
      `
        SELECT
          id,
          user_id AS "userId",
          challenge_type AS "challengeType",
          target,
          token_hash AS "tokenHash",
          expires_at AS "expiresAt",
          consumed_at AS "consumedAt",
          attempt_count AS "attemptCount",
          max_attempts AS "maxAttempts",
          created_at AS "createdAt"
        FROM verification_challenges
        WHERE LOWER(target) = LOWER($1)
          AND challenge_type = $2
          AND consumed_at IS NULL
          AND expires_at > NOW()
          AND attempt_count < max_attempts
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [target, challengeType],
    );

    const row = result.rows[0];

    return row ? this.toDomain(row) : null;
  }

  async incrementAttemptCount(id: string): Promise<void> {
    const result = await this.pool.query(
      `
        UPDATE verification_challenges
        SET attempt_count = attempt_count + 1
        WHERE id = $1
          AND consumed_at IS NULL
          AND expires_at > NOW()
          AND attempt_count < max_attempts
      `,
      [id],
    );

    if (result.rowCount !== 1) {
      throw new Error("Verification challenge is no longer usable");
    }
  }

  async consume(id: string): Promise<void> {
    const result = await this.pool.query(
      `
        UPDATE verification_challenges
        SET consumed_at = NOW()
        WHERE id = $1
          AND consumed_at IS NULL
          AND expires_at > NOW()
          AND attempt_count < max_attempts
      `,
      [id],
    );

    if (result.rowCount !== 1) {
      throw new Error("Verification challenge is no longer usable");
    }
  }

  async invalidateActiveByTargetAndType(
    target: string,
    challengeType: ChallengeType,
  ): Promise<void> {
    await this.pool.query(
      `
        UPDATE verification_challenges
        SET consumed_at = NOW()
        WHERE LOWER(target) = LOWER($1)
          AND challenge_type = $2
          AND consumed_at IS NULL
          AND expires_at > NOW()
          AND attempt_count < max_attempts
      `,
      [target, challengeType],
    );
  }

  async findLatestByTargetAndType(
    target: string,
    challengeType: ChallengeType,
  ): Promise<VerificationChallenge | null> {
    const result = await this.pool.query<VerificationChallengeRow>(
      `
        SELECT
          id,
          user_id AS "userId",
          challenge_type AS "challengeType",
          target,
          token_hash AS "tokenHash",
          expires_at AS "expiresAt",
          consumed_at AS "consumedAt",
          attempt_count AS "attemptCount",
          max_attempts AS "maxAttempts",
          created_at AS "createdAt"
        FROM verification_challenges
        WHERE LOWER(target) = LOWER($1)
          AND challenge_type = $2
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [target.trim().toLowerCase(), challengeType],
    );

    const row = result.rows[0];

    return row ? this.toDomain(row) : null;
  }

}