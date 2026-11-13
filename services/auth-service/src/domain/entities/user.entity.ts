import { DomainError } from "../errors/domain-error.js";
import { EmailAddress } from "../value-objects/email-address.vo.js";

export type UserStatus =   
  | "pending_verification"
  | "active"
  | "suspended"
  | "deleted";

export interface CreateUserProps {
  fullName: string;
  email: string;
  passwordHash: string;
  profileImageUrl?: string | null;
  profileImagePublicId?: string | null;
}

export interface UserProps {
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

export class User {
  private constructor(
    private readonly _id: string | null,
    private _fullName: string,
    private readonly _email: EmailAddress,
    private _passwordHash: string,
    private _status: UserStatus,
    private _emailVerifiedAt: Date | null,
    private _profileImageUrl: string | null,
    private _profileImagePublicId: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Creates a new user before database persistence
  static create(props: CreateUserProps): User {
    const fullName = props.fullName.trim();

    if (!fullName) {
      throw new DomainError(
        "Full name is required",
        "INVALID_FULL_NAME",
      );
    }

    if (!props.passwordHash.trim()) {
      throw new DomainError(
        "Password hash is required",
        "INVALID_PASSWORD_HASH",
      );
    }

    const now = new Date();

    return new User(
      null,
      fullName,
      EmailAddress.create(props.email),
      props.passwordHash,
      "pending_verification",
      null,
      props.profileImageUrl ?? null,
      props.profileImagePublicId ?? null,
      now,
      now,
    );
  }

  // Reconstructs a user retrieved from the database
  static reconstitute(props: UserProps): User {
    if (!props.id.trim()) {
      throw new DomainError("User ID is required", "INVALID_USER_ID");
    }

    if (!props.passwordHash.trim()) {
      throw new DomainError(
        "Password hash is required",
        "INVALID_PASSWORD_HASH",
      );
    }

    return new User(
      props.id,
      props.fullName.trim(),
      EmailAddress.create(props.email),
      props.passwordHash,
      props.status,
      props.emailVerifiedAt,
      props.profileImageUrl,
      props.profileImagePublicId,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): string | null {
    return this._id;
  }

  get fullName(): string {
    return this._fullName;
  }

  get email(): EmailAddress {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get status(): UserStatus {
    return this._status;
  }

  get emailVerifiedAt(): Date | null {
    return this._emailVerifiedAt
      ? new Date(this._emailVerifiedAt)
      : null;
  }

  get profileImageUrl(): string | null {
    return this._profileImageUrl;
  }

  get profileImagePublicId(): string | null {
    return this._profileImagePublicId;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get isEmailVerified(): boolean {
    return this._emailVerifiedAt !== null;
  }

  verifyEmail(at: Date = new Date()): void {
    if (this._status !== "pending_verification") {
      throw new DomainError(
        "Only users pending verification can verify their email",
        "USER_NOT_PENDING_VERIFICATION",
      );
    }

    if (this.isEmailVerified) {
      throw new DomainError(
        "Email is already verified",
        "EMAIL_ALREADY_VERIFIED",
      );
    }

    this._emailVerifiedAt = new Date(at);
    this._status = "active";
    this._updatedAt = new Date(at);
  }

  suspend(at: Date = new Date()): void {
    if (this._status !== "active") {
      throw new DomainError(
        "Only active users can be suspended",
        "USER_NOT_ACTIVE",
      );
    }

    this._status = "suspended";
    this._updatedAt = new Date(at);
  }

  activate(at: Date = new Date()): void {
    if (this._status !== "suspended") {
      throw new DomainError(
        "Only suspended users can be activated",
        "USER_NOT_SUSPENDED",
      );
    }

    this._status = "active";
    this._updatedAt = new Date(at);
  }

  changeFullName(fullName: string, at: Date = new Date()): void {
    const normalizedName = fullName.trim();

    if (!normalizedName) {
      throw new DomainError(
        "Full name cannot be empty",
        "INVALID_FULL_NAME",
      );
    }

    this._fullName = normalizedName;
    this._updatedAt = new Date(at);
  }

  changeProfileImage(
    imageUrl: string,
    publicId: string,
    at: Date = new Date(),
  ): void {
    if (!imageUrl.trim()) {
      throw new DomainError(
        "Profile image URL cannot be empty",
        "INVALID_PROFILE_IMAGE_URL",
      );
    }

    if (!publicId.trim()) {
      throw new DomainError(
        "Profile image public ID cannot be empty",
        "INVALID_PROFILE_IMAGE_PUBLIC_ID",
      );
    }

    this._profileImageUrl = imageUrl;
    this._profileImagePublicId = publicId;
    this._updatedAt = new Date(at);
  }

  changePasswordHash(passwordHash: string, at: Date = new Date()): void {
    if (!passwordHash.trim()) {
      throw new DomainError(
        "Password hash cannot be empty",
        "INVALID_PASSWORD_HASH",
      );
    }

    this._passwordHash = passwordHash;
    this._updatedAt = new Date(at);
  }
}