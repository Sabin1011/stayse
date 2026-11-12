import type { Pool, QueryResultRow } from "pg";

import type {
  CreateExternalIdentityData,
  ExternalIdentity,
  ExternalIdentityRepository,
} from "../../../../application/interfaces/repositories/external-identity-repository.interface.js";

interface ExternalIdentityRow extends QueryResultRow {
  id: string;
  userId: string;
  providerUserId: string;
  email: string | null;
}

export class PostgresExternalIdentityRepository
  implements ExternalIdentityRepository
{
  constructor(private readonly pool: Pool) {}

  private toDomain(row: ExternalIdentityRow): ExternalIdentity {
    return {
      id: row.id,
      userId: row.userId,
      provider: "GOOGLE",
      providerUserId: row.providerUserId,
      email: row.email ?? "",
    };
  }

  async findByProviderUserId(
    provider: "GOOGLE",
    providerUserId: string,
  ): Promise<ExternalIdentity | null> {
    const result = await this.pool.query<ExternalIdentityRow>(
      `
        SELECT
          id,
          user_id AS "userId",
          provider_subject AS "providerUserId",
          provider_email AS email
        FROM external_identities
        WHERE provider = $1
          AND provider_subject = $2
        LIMIT 1
      `,
      [provider.toLowerCase(), providerUserId],
    );

    const row = result.rows[0];

    return row ? this.toDomain(row) : null;
  }

  async create(
    data: CreateExternalIdentityData,
  ): Promise<ExternalIdentity> {
    const result = await this.pool.query<ExternalIdentityRow>(
      `
        INSERT INTO external_identities (
          user_id,
          provider,
          provider_subject,
          provider_email,
          email_verified
        )
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING
          id,
          user_id AS "userId",
          provider_subject AS "providerUserId",
          provider_email AS email
      `,
      [
        data.userId,
        data.provider.toLowerCase(),
        data.providerUserId,
        data.email,
      ],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("Failed to create external identity");
    }

    return this.toDomain(row);
  }
}