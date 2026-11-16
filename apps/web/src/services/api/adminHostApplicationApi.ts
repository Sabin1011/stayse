
import axiosInstance from "./axiosInstance";

import type {
  ApplicantDetails,
  BusinessDetails,
  HostApplication,
  HostApplicationStatus,
} from "../../features/host-application/types/hostApplication.types";
const BASE_URL = "/properties/admin/host-applications";

export interface AdminHostApplicationDocument {
  reference: string;
  documentType: string;
  uploadedAt: string;
}

export interface AdminHostApplicationDetails {
  id: string;
  hostId: string;
  verificationType: "INDIVIDUAL" | "BUSINESS";
  applicantDetails: ApplicantDetails;
  businessDetails: BusinessDetails | null;
  documents: AdminHostApplicationDocument[];
  status: HostApplication["status"];
  review?: {
    reviewedByUserId: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
  applicationHistory?: Array<{
    action: string;
    actorUserId: string;
    note: string | null;
    at: string;
  }>;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminHostApplicationDetailsResponse {
  message: string;
  data: AdminHostApplicationDetails;
}

export interface AdminHostApplicationsResponse {
  message: string;
  data: HostApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface AdminHostApplicationResponse {
  message: string;
  data: HostApplication;
}

export type HostApplicationReviewAction =
  | "start-review"
  | "approve"
  | "reject"
  | "request-changes";

export const getAdminHostApplications = async (
  page = 1,
  limit = 10,
  status?: HostApplicationStatus,
): Promise<AdminHostApplicationsResponse> => {
  const response = await axiosInstance.get(BASE_URL, {
    params: {
      page,
      limit,
      ...(status ? { status } : {}),
    },
  });

  return response.data;
};

export const getAdminHostApplicationById = async (
  applicationId: string,
): Promise<AdminHostApplicationDetailsResponse> => {
  const response = await axiosInstance.get(
    `${BASE_URL}/${applicationId}`,
  );

  return response.data;
};

export const reviewAdminHostApplication = async (
  applicationId: string,
  action: HostApplicationReviewAction,
  note?: string,
): Promise<AdminHostApplicationResponse> => {
  const response = await axiosInstance.patch(
    `${BASE_URL}/${applicationId}/${action}`,
    note ? { note } : {},
  );

  return response.data;
};

export const downloadHostApplicationDocument = async (
  applicationId: string,
  reference: string,
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `${BASE_URL}/${applicationId}/documents/${encodeURIComponent(reference)}`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};
