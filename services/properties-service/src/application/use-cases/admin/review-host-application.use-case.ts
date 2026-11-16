
import type { HostApplicationRepository } from "../../../application/interfaces/host-application.repository.js";
import type { HostRoleAssigner } from "../../interfaces/host-role-assigner.interface.js";

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
    private readonly hostRoleAssigner: HostRoleAssigner,
  ) {}

  async execute(input: ReviewHostApplicationInput) {
    const application =
      await this.hostApplicationRepository.findById(
        input.applicationId,
      );

    if (!application) {
      return null;
    }

    // An earlier approval may have succeeded in MongoDB
    // while role assignment failed in Auth Service.
    // Allow an admin to retry the role synchronization.
    if (
      input.action === "APPROVE" &&
      application.props.status === "APPROVED"
    ) {
      await this.hostRoleAssigner.assignHostRole(
        application.props.hostId,
      );

      return this.toResponse(application);
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

    // Assign the host role only after approval is persisted.
    if (input.action === "APPROVE") {
      await this.hostRoleAssigner.assignHostRole(
        updatedApplication.props.hostId,
      );
    }

    return this.toResponse(updatedApplication);
  }

  private toResponse(application: Awaited<
    ReturnType<HostApplicationRepository["findById"]>
  > & {}) {
    if (!application) {
      return null;
    }

    const props = application.props;

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
