
import { Schema, model } from "mongoose";

import { HostDocumentType } from "../../../../domain/enums/host-document-type.enum.js";

export interface HostApplicationDocumentMetadata {
  reference: string;
  ownerUserId: string;
  documentType: HostDocumentType;
  mimeType: string;
  storageKey: string;
  sizeBytes: number;
  uploadedAt: Date;
}

const hostApplicationDocumentSchema =
  new Schema<HostApplicationDocumentMetadata>(
    {
      reference: {
        type: String,
        required: true,
        unique: true,
      },
      ownerUserId: {
        type: String,
        required: true,
        index: true,
      },
      documentType: {
        type: String,
        enum: Object.values(HostDocumentType),
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      storageKey: {
        type: String,
        required: true,
        unique: true,
      },
      sizeBytes: {
        type: Number,
        required: true,
      },
      uploadedAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: false,
      collection: "host_application_documents",
      versionKey: false,
    },
  );

hostApplicationDocumentSchema.index({
  ownerUserId: 1,
  uploadedAt: -1,
});

export const HostApplicationDocumentModel =
  model<HostApplicationDocumentMetadata>(
    "HostApplicationDocument",
    hostApplicationDocumentSchema,
  );
