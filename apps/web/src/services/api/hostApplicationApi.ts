
import axiosInstance from "./axiosInstance";

import type {
  HostDocumentType,
  SubmitHostApplicationRequest,
  SubmitHostApplicationResponse,
  GetMyHostApplicationResponse,
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
        // Let the browser/Axios generate the multipart boundary.
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

export const getMyHostApplication = async () => {
  const response =
    await axiosInstance.get<GetMyHostApplicationResponse>(
      "/properties/host-applications/me"
    );

  return response.data;
};
