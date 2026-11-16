import axiosInstance from "./axiosInstance";

import type {
  HostDocumentType,
  SubmitHostApplicationRequest,
  SubmitHostApplicationResponse,
  GetMyHostApplicationResponse,
  UpdateHostApplicationResponse,
  UploadHostApplicationDocumentResponse,
} from "../../features/host-application/types/hostApplication.types";

export const uploadHostApplicationDocument = async (
  file: File,
  documentType: HostDocumentType
): Promise<UploadHostApplicationDocumentResponse> => {
  const formData = new FormData();

  formData.append("document", file);
  formData.append("documentType", documentType);

  const response =
    await axiosInstance.post<UploadHostApplicationDocumentResponse>(
      "/properties/host-applications/documents",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

  return response.data;
};

export const submitHostApplication = async (
  data: SubmitHostApplicationRequest
): Promise<SubmitHostApplicationResponse> => {
  const response =
    await axiosInstance.post<SubmitHostApplicationResponse>(
      "/properties/host-applications",
      data
    );

  return response.data;
};

export const updateAndResubmitHostApplication = async (
  data: SubmitHostApplicationRequest
): Promise<UpdateHostApplicationResponse> => {
  const response =
    await axiosInstance.put<UpdateHostApplicationResponse>(
      "/properties/host-applications/me",
      data
    );

  return response.data;
};

export const getMyHostApplication =
  async (): Promise<GetMyHostApplicationResponse> => {
    try {
      const response =
        await axiosInstance.get<GetMyHostApplicationResponse>(
          "/properties/host-applications/me"
        );

      return response.data;
    } catch (error: unknown) {
      const status = (
        error as { response?: { status?: number } }
      ).response?.status;

      // No application is a valid state for a new applicant.
      if (status === 404) {
        return {
          success: false,
          data: null,
        };
      }

      throw error;
    }
  };