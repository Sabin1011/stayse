
import { Types } from "mongoose";

import {
  HostApplication,
  type ApplicantDetails,
  type HostDocumentReference,
  type ApplicationReview,
  type ApplicationHistory,
} from "../../domain/entities/host-application.entity.js";

import type {
  VerificationType,
  HostApplicationStatus,
} from "../../domain/enums/host-application.enum.js";

// MongoDB persistence structure
export interface HostApplicationPersistence {
  _id?: Types.ObjectId | string;

  hostId: string;
  verificationType: VerificationType;

  applicantDetails: ApplicantDetails;

  businessDetails?: {
    businessName: string;
    registrationNumber?: string;
  };

  documentReferences: HostDocumentReference[];

  status: HostApplicationStatus;

  review: ApplicationReview;

  applicationHistory: ApplicationHistory[];

  isActive: boolean;
  submittedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

// MongoDB document that has already been persisted.
// Unlike a new persistence object, this always has an ID.
export type PersistedHostApplication =
  Omit<HostApplicationPersistence, "_id"> & {
    _id: Types.ObjectId | string;
  };

export class HostApplicationMapper {
  // MongoDB document -> Domain entity
  static toDomain(
    document: PersistedHostApplication,
  ): HostApplication {
    const { _id, ...properties } = document;

    return new HostApplication({
      ...properties,
      id: _id.toString(),
    });
  }

  // Domain entity -> MongoDB-compatible object
  static toPersistence(
    application: HostApplication,
  ): Omit<
    HostApplicationPersistence,
    "_id" | "createdAt" | "updatedAt"
  > {
    const {
      id,
      businessDetails,
      createdAt,
      updatedAt,
      ...properties
    } = application.props;

    return {
      ...properties,

      ...(businessDetails
        ? {
            businessDetails: {
              businessName: businessDetails.businessName,

              ...(businessDetails.registrationNumber !== undefined
                ? {
                    registrationNumber:
                      businessDetails.registrationNumber,
                  }
                : {}),
            },
          }
        : {}),
    };
  }
}
