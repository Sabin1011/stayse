
import { DomainError } from "../errors/domain-error.js";

export type ChallengeType = "email_verification"  | "password_reset";

export interface VerificationChallengeProps {
  id: string | null;
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

export class VerificationChallenge {
  private constructor(
    private readonly props: VerificationChallengeProps,
  ) {}

  static create(input: {
    userId: string;
    challengeType: ChallengeType;
    target: string;
    tokenHash: string;
    expiresAt: Date;
    maxAttempts?: number;
  }): VerificationChallenge {
    if (!input.userId.trim()) {
      throw new DomainError("User ID is required", "INVALID_USER_ID");
    }

    if (!input.target.trim() || !input.tokenHash.trim()) {
      throw new DomainError(
        "Target and token hash are required",
        "INVALID_CHALLENGE_DATA",
      );
    }

    if (  
        Number.isNaN(input.expiresAt.getTime()) ||
        input.expiresAt.getTime() <= Date.now()
    ) {
      throw new DomainError(
        "Expiration must be in the future",
        "INVALID_CHALLENGE_EXPIRY",
      );
    }

    const maxAttempts = input.maxAttempts ?? 5;

    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
      throw new DomainError(
        "Maximum attempts must be a positive integer",
        "INVALID_MAX_ATTEMPTS",
      );
    }

    return new VerificationChallenge({
      id: null,
      userId: input.userId,
      challengeType: input.challengeType,
      target: input.target.trim().toLowerCase(),
      tokenHash: input.tokenHash,
      expiresAt: new Date(input.expiresAt),
      consumedAt: null,
      attemptCount: 0,
      maxAttempts,
      createdAt: new Date(),
    });
  }

  static reconstitute(
    props: VerificationChallengeProps,
  ): VerificationChallenge {
    if (!props.id) {
      throw new DomainError(
        "Persisted challenge requires an ID",
        "INVALID_CHALLENGE_ID",
      );
    }

    if (
       !Number.isInteger(props.maxAttempts) ||
       props.maxAttempts < 1 ||
       !Number.isInteger(props.attemptCount) ||
       props.attemptCount < 0 ||
       props.attemptCount > props.maxAttempts
    ) {
      throw new DomainError(
        "Invalid challenge attempt configuration",
        "INVALID_CHALLENGE_ATTEMPTS",
      );
    }

    return new VerificationChallenge({
      ...props,
      expiresAt: new Date(props.expiresAt),
      consumedAt: props.consumedAt
        ? new Date(props.consumedAt)
        : null,
      createdAt: new Date(props.createdAt),
    });
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get target() { return this.props.target; }
  get tokenHash() { return this.props.tokenHash; }
  get attemptCount() { return this.props.attemptCount; }
  get maxAttempts() { return this.props.maxAttempts; }

  get expiresAt() { return new Date(this.props.expiresAt); }
  get consumedAt() {
    return this.props.consumedAt
      ? new Date(this.props.consumedAt)
      : null;
  }

  get isExpired() {
    return Date.now() >= this.props.expiresAt.getTime();
  }

  get isConsumed() {
    return this.props.consumedAt !== null;
  }

  get isLocked() {
    return this.props.attemptCount >= this.props.maxAttempts;
  }

  get isUsable() {
    return !this.isExpired && !this.isConsumed && !this.isLocked;
  }

  get challengeType() {
    return this.props.challengeType;
  }

  get createdAt() {
    return new Date(this.props.createdAt);
  }

  recordFailedAttempt(): void {
    if (!this.isUsable) {
      throw new DomainError(
        "Challenge is no longer usable",
        "CHALLENGE_NOT_USABLE",
      );
    }

    this.props.attemptCount++;
  }

  consume(at: Date = new Date()): void {
    if (!this.isUsable) {
      throw new DomainError(
        "Challenge is no longer usable",
        "CHALLENGE_NOT_USABLE",
      );
    }

    this.props.consumedAt = new Date(at);
  }
}
