
import type {
  ApplicantDetails,
  BusinessDetails,
  HostDocumentReference,
} from "../../domain/entities/host-application.entity.js";

import type { VerificationType } from "../../domain/enums/host-application.enum.js";

export interface SubmitHostApplicationDTO {
  hostId: string;
  verificationType: VerificationType;
  applicantDetails: ApplicantDetails;
  businessDetails?: BusinessDetails;
  documentReferences: HostDocumentReference[];
}
