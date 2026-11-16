
export type VerificationType = "INDIVIDUAL" | "BUSINESS";


export type HostApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED";

export type HostDocumentType =
  | "ID_PROOF"
  | "ADDRESS_PROOF"
  | "OWNERSHIP_PROOF"
  | "LICENSE"
  | "OTHER";

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
  registrationNumber?: string;
}

export interface HostDocumentReference {
  documentType: HostDocumentType;
  protectedStorageRef: string;
  uploadedAt: string;
}

export interface SubmitHostApplicationRequest {
  verificationType: VerificationType;
  applicantDetails: ApplicantDetails;
  businessDetails?: BusinessDetails;
  documentReferences: HostDocumentReference[];
}


export interface HostApplicationApplicant {
  legalName: string;
  contactEmail: string;
  contactPhone?: string | null;
  city?: string;
  state?: string;
  residentialAddress?: ResidentialAddress | null;
}

export interface HostApplication {
  id: string;
  hostId?: string;
  verificationType: VerificationType;

  applicant: HostApplicationApplicant;

  businessDetails?: BusinessDetails | null;

  documentReferences?: HostDocumentReference[];

  status: HostApplicationStatus;

  review?: {
    reviewedByUserId: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };

  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface SubmitHostApplicationResponse {
  success: boolean;
  message: string;
  data: {
    applicationId: string;
    status: HostApplicationStatus;
    verificationType: VerificationType;
    submittedAt: string;
  };
}

export interface UploadHostApplicationDocumentResponse {
  success: boolean;
  message: string;
  data: {
    documentType: HostDocumentType;
    protectedStorageRef: string;
    uploadedAt: string;
  };
}


export interface MyHostApplicationDocument {
  documentType: HostDocumentType;
  uploadedAt: string;
}

export interface MyHostApplication {
  id: string;
  verificationType: VerificationType;
  applicantDetails: ApplicantDetails;
  businessDetails?: BusinessDetails | null;
  documentReferences: MyHostApplicationDocument[];
  status: HostApplicationStatus;
  review?: {
    reviewedByUserId: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetMyHostApplicationResponse {
  success: boolean;
  data: MyHostApplication | null;
}

export interface UpdateHostApplicationResponse {
  success: boolean;
  message: string;
  data: {
    applicationId: string;
    status: HostApplicationStatus;
    verificationType: VerificationType;
    submittedAt: string;
  };
}