import type { HostApplicationRepository } from "../../interfaces/host-application.repository.js";

export class GetHostApplicationByIdUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
  ) {}

  async execute(id: string) {
    const application =
      await this.hostApplicationRepository.findById(id);

    if (!application) {
      return null;
    }

    const props = application.props;

    return {
      id: props.id,
      hostId: props.hostId,
      verificationType: props.verificationType,

      applicantDetails: {
        legalName: props.applicantDetails.legalName,
        contactPhone: props.applicantDetails.contactPhone,
        contactEmail: props.applicantDetails.contactEmail,
        residentialAddress: {
          ...props.applicantDetails.residentialAddress,
        },
      },

      businessDetails: props.businessDetails
        ? {
            businessName: props.businessDetails.businessName,
            registrationNumber:
              props.businessDetails.registrationNumber ?? null,
          }
        : null,

      documents: props.documentReferences.map((document) => ({
        reference: document.protectedStorageRef,
        documentType: document.documentType,
        uploadedAt: document.uploadedAt,
      })),

      status: props.status,

      review: {
        reviewedByUserId: props.review.reviewedByUserId,
        reviewedAt: props.review.reviewedAt,
        reviewNote: props.review.reviewNote,
      },

      applicationHistory: props.applicationHistory.map((entry) => ({
        action: entry.action,
        actorUserId: entry.actorUserId,
        note: entry.note,
        at: entry.at,
      })),

      submittedAt: props.submittedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}