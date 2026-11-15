
import type { HostApplicationRepository } from "../../../domain/repositories/host-application.repository.js";

export type HostApplicationReviewAction =
  | "START_REVIEW"
  | "APPROVE"
  | "REJECT"
  | "REQUEST_CHANGES";

interface ReviewHostApplicationInput {
  applicationId: string;
  adminUserId: string;
  action: HostApplicationReviewAction;
  note?: string;
}

export class ReviewHostApplicationUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
  ) {}

  async execute(input: ReviewHostApplicationInput) {
    const application =
      await this.hostApplicationRepository.findById(
        input.applicationId,
      );

    if (!application) {
      return null;
    }

    switch (input.action) {
      case "START_REVIEW":
        application.startReview(input.adminUserId);
        break;

      case "APPROVE":
        application.approve(
          input.adminUserId,
          input.note ?? "",
        );
        break;

      case "REJECT":
        application.reject(
          input.adminUserId,
          input.note ?? "",
        );
        break;

      case "REQUEST_CHANGES":
        application.requestChanges(
          input.adminUserId,
          input.note ?? "",
        );
        break;
    }

    const updatedApplication =
      await this.hostApplicationRepository.update(application);

    const props = updatedApplication.props;

    return {
      id: props.id,
      hostId: props.hostId,
      status: props.status,
      review: props.review,
      applicationHistory: props.applicationHistory,
      submittedAt: props.submittedAt,
      updatedAt: props.updatedAt,
    };
  }
}
