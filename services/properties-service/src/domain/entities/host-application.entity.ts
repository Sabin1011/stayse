import {
  VerificationType,
  HostApplicationStatus,
  HostApplicationAction,
} from "../enums/host-application.enum.js";

import { HostApplicationError } from "../errors/host-application.error.js";

export interface ResidentialAddress {
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface ApplicantDetails {
  legalName: string;
  contactPhone: string;
  contactEmail: string;
  residentialAddress: ResidentialAddress;
}

export interface BusinessDetails {
  businessName: string;
  registrationNumber?: string | undefined;
}

export interface HostDocumentReference {
  documentType:
    | "ID_PROOF"
    | "ADDRESS_PROOF"
    | "OWNERSHIP_PROOF"
    | "LICENSE"
    | "OTHER";

  protectedStorageRef: string;
  uploadedAt: Date;
}

export interface ApplicationReview {
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
}

export interface ApplicationHistory {
  action: HostApplicationAction;
  actorUserId: string;
  note: string | null;
  at: Date;
}

export interface HostApplicationProps {
  id: string | null;
  hostId: string;

  verificationType: VerificationType;

  applicantDetails: ApplicantDetails;
  businessDetails?: BusinessDetails;

  documentReferences: HostDocumentReference[];

  status: HostApplicationStatus;

  review: ApplicationReview;

  applicationHistory: ApplicationHistory[];

  isActive: boolean;

  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class HostApplication {
  constructor(public readonly props: HostApplicationProps) {}

  private recordHistory(
    action: HostApplicationAction,
    actorUserId: string,
    note: string | null = null,
  ): void {
    this.props.applicationHistory.push({
      action,
      actorUserId,
      note,
      at: new Date(),
    });

    // Keep history bounded.
    if (this.props.applicationHistory.length > 50) {
      this.props.applicationHistory.shift();
    }

    this.props.updatedAt = new Date();
  }

  private ensureStatus(expected: HostApplicationStatus): void {
    if (this.props.status !== expected) {
      throw new HostApplicationError(
        `Operation not allowed while application is ${this.props.status}`,
      );
    }
  }

  submit(actorUserId: string): void {
    if (
      this.props.status !== HostApplicationStatus.DRAFT &&
      this.props.status !== HostApplicationStatus.CHANGES_REQUESTED
    ) {
      throw new HostApplicationError(
        "Only draft or changes-requested applications can be submitted",
      );
    }

    if (
      this.props.verificationType === VerificationType.BUSINESS &&
      !this.props.businessDetails?.businessName
    ) {
      throw new HostApplicationError(
        "Business name is required for business applications",
      );
    }

    this.props.status = HostApplicationStatus.SUBMITTED;
    this.props.isActive = true;
    this.props.submittedAt = new Date();

    this.recordHistory(
      this.props.applicationHistory.length === 0
        ? HostApplicationAction.SUBMITTED
        : HostApplicationAction.RESUBMITTED,
      actorUserId,
    );
  }

  startReview(adminUserId: string): void {
    this.ensureStatus(HostApplicationStatus.SUBMITTED);

    this.props.status = HostApplicationStatus.UNDER_REVIEW;

    this.props.review = {
      reviewedByUserId: adminUserId,
      reviewedAt: null,
      reviewNote: null,
    };

    this.recordHistory(
      HostApplicationAction.REVIEW_STARTED,
      adminUserId,
    );
  }

  approve(adminUserId: string, note: string): void {
    this.ensureStatus(HostApplicationStatus.UNDER_REVIEW);

    this.props.status = HostApplicationStatus.APPROVED;
    this.props.isActive = false;

    this.props.review = {
      reviewedByUserId: adminUserId,
      reviewedAt: new Date(),
      reviewNote: note,
    };

    this.recordHistory(
      HostApplicationAction.APPROVED,
      adminUserId,
      note,
    );
  }

  reject(adminUserId: string, note: string): void {
    this.ensureStatus(HostApplicationStatus.UNDER_REVIEW);

    this.props.status = HostApplicationStatus.REJECTED;
    this.props.isActive = false;

    this.props.review = {
      reviewedByUserId: adminUserId,
      reviewedAt: new Date(),
      reviewNote: note,
    };

    this.recordHistory(
      HostApplicationAction.REJECTED,
      adminUserId,
      note,
    );
  }

  requestChanges(adminUserId: string, note: string): void {
    this.ensureStatus(HostApplicationStatus.UNDER_REVIEW);

    if (!note.trim()) {
      throw new HostApplicationError(
        "A review note is required when requesting changes",
      );
    }

    this.props.status = HostApplicationStatus.CHANGES_REQUESTED;
    this.props.isActive = true;

    this.props.review = {
      reviewedByUserId: adminUserId,
      reviewedAt: new Date(),
      reviewNote: note,
    };

    this.recordHistory(
      HostApplicationAction.CHANGES_REQUESTED,
      adminUserId,
      note,
    );
  }
}