export interface CreateRefreshSessionData {
  userId: string;
  tokenHash: string;
  familyId?: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface RefreshSession {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBySessionId: string | null;
  lastUsedAt: Date | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface RefreshSessionRepository {
  create(data: CreateRefreshSessionData): Promise<RefreshSession>;

  findActiveByTokenHash(
    tokenHash: string,
  ): Promise<RefreshSession | null>;

  rotate(
    oldSessionId: string,
    newSession: CreateRefreshSessionData,
  ): Promise<RefreshSession>;

  revoke(
    sessionId: string,
    replacedBySessionId?: string,
  ): Promise<void>;

  revokeAllForUser(userId: string): Promise<void>;
}