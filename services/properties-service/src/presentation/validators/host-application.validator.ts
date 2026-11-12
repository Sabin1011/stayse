import { z } from "zod";
import { VerificationType } from "../../domain/enums/host-application.enum.js";

const residentialAddressSchema = z.object({
  addressLine: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(4).max(12),
  countryCode: z.string().length(2).default("IN"),
});

const applicantDetailsSchema = z.object({
  legalName: z.string().trim().min(2).max(100),
  contactPhone: z.string().trim().min(8).max(20),
  contactEmail: z.string().trim().email().max(255),
  residentialAddress: residentialAddressSchema,
});

const businessDetailsSchema = z.object({
  businessName: z.string().trim().min(2).max(150),
  registrationNumber: z.string().trim().max(100).optional(),
});

const documentReferenceSchema = z.object({
  documentType: z.enum([
    "ID_PROOF",
    "ADDRESS_PROOF",
    "OWNERSHIP_PROOF",
    "LICENSE",
    "OTHER",
  ]),
  protectedStorageRef: z.string().min(1).max(500),
  uploadedAt: z.coerce.date(),
});

export const submitHostApplicationSchema = z
  .object({
    verificationType: z.nativeEnum(VerificationType),
    applicantDetails: applicantDetailsSchema,
    businessDetails: businessDetailsSchema.optional(),
    documentReferences: z.array(documentReferenceSchema).max(10).default([]),
  })
  .superRefine((data, context) => {
    if (
      data.verificationType === "BUSINESS" &&
      !data.businessDetails
    ) {
      context.addIssue({
        code: "custom",
        path: ["businessDetails"],
        message: "Business details are required for business applications",
      });
    }

    if (
      data.verificationType === "INDIVIDUAL" &&
      data.businessDetails
    ) {
      context.addIssue({
        code: "custom",
        path: ["businessDetails"],
        message: "Business details are not allowed for individual applications",
      });
    }
  });

export type SubmitHostApplicationRequest = z.infer<
  typeof submitHostApplicationSchema
>;
