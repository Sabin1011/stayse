
import { Schema, model, Types } from "mongoose";

import {
  VerificationType,
  HostApplicationStatus,
  HostApplicationAction,
} from "../../../../domain/enums/host-application.enum.js";


// MongoDB document interface
// --------------------------------------------------

interface HostApplicationDocument {
  _id?: Types.ObjectId;

  hostId: string;

  verificationType: VerificationType;

  applicantDetails: {
    legalName: string;
    contactPhone: string;
    contactEmail: string;

    residentialAddress: {
      addressLine: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
    };
  };

  businessDetails?: {
    businessName: string;
    registrationNumber?: string;
  };

  documentReferences: {
    documentType: string;
    protectedStorageRef: string;
    uploadedAt: Date;
  }[];

  status: HostApplicationStatus;

  review: {
    reviewedByUserId: string | null;
    reviewedAt: Date | null;
    reviewNote: string | null;
  };

  applicationHistory: {
    action: HostApplicationAction;
    actorUserId: string;
    note: string | null;
    at: Date;
  }[];

  isActive: boolean;

  submittedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

// --------------------------------------------------
// Embedded schemas
// --------------------------------------------------

const residentialAddressSchema = new Schema(
  {
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    countryCode: {
      type: String,
      required: true,
      default: "IN",
    },
  },
  { _id: false },
);

const applicantDetailsSchema = new Schema(
  {
    legalName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    residentialAddress: {
      type: residentialAddressSchema,
      required: true,
    },
  },
  { _id: false },
);

const businessDetailsSchema = new Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
    },
  },
  { _id: false },
);

const documentReferenceSchema = new Schema(
  {
    documentType: {
      type: String,
      enum: [
        "ID_PROOF",
        "ADDRESS_PROOF",
        "OWNERSHIP_PROOF",
        "LICENSE",
        "OTHER",
      ],
      required: true,
    },
    protectedStorageRef: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

const applicationReviewSchema = new Schema(
  {
    reviewedByUserId: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const applicationHistorySchema = new Schema(
  {
    action: {
      type: String,
      enum: Object.values(HostApplicationAction),
      required: true,
    },
    actorUserId: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: null,
    },
    at: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

// --------------------------------------------------
// Main host application schema
// --------------------------------------------------

const hostApplicationSchema =
  new Schema<HostApplicationDocument>(
    {
      hostId: {
        type: String,
        required: true,
        index: false,
      },

      verificationType: {
        type: String,
        enum: Object.values(VerificationType),
        required: true,
      },

      applicantDetails: {
        type: applicantDetailsSchema,
        required: true,
      },

      businessDetails: {
        type: businessDetailsSchema,
        required: false,
      },

      documentReferences: {
        type: [documentReferenceSchema],
        default: [],
      },

      status: {
        type: String,
        enum: Object.values(HostApplicationStatus),
        required: true,
      },

      review: {
        type: applicationReviewSchema,
        required: true,
      },

      applicationHistory: {
        type: [applicationHistorySchema],
        default: [],
      },

      isActive: {
        type: Boolean,
        required: true,
        default: true,
      },

      submittedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
      collection: "host_verification_applications",
      versionKey: false,
    },
  );

// --------------------------------------------------
// Indexes
// --------------------------------------------------

// One active application per host.
hostApplicationSchema.index(
  { hostId: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    name: "unique_active_application_per_host",
  },
);

// Admin application listing.
hostApplicationSchema.index(
  { status: 1, createdAt: -1 },
  {
    name: "application_status_created_at",
  },
);

// Applicant application history.
hostApplicationSchema.index(
  { hostId: 1, createdAt: -1 },
  {
    name: "host_application_history",
  },
);

// --------------------------------------------------
// Mongoose model
// --------------------------------------------------

export const HostApplicationModel =
  model<HostApplicationDocument>(
    "HostApplication",
    hostApplicationSchema,
  );
