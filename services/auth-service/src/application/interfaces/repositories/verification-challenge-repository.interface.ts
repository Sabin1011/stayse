import type {
  ChallengeType,
  VerificationChallenge,
} from "../../../domain/entities/verification-challenge.entity.js";

export interface CreateVerificationChallengeData {
  userId: string;
  challengeType: ChallengeType;
  target: string;
  tokenHash: string;
  expiresAt: Date;
  maxAttempts?: number;
}

export interface VerificationChallengeRepository {
  create(
    data: CreateVerificationChallengeData,
  ): Promise<VerificationChallenge>;

  findActiveByTargetAndType(
    target: string,
    challengeType: ChallengeType,
  ): Promise<VerificationChallenge | null>;

  incrementAttemptCount(
    id: string,
  ): Promise<void>;

  consume(
    id: string,
  ): Promise<void>;

  invalidateActiveByTargetAndType(
    target: string,
    challengeType: ChallengeType,
  ): Promise<void>;

  findLatestByTargetAndType(
    target: string,
    challengeType: ChallengeType,
  ): Promise<VerificationChallenge | null>;
}