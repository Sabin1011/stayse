import type { HostApplicationRepository } from "../../interfaces/host-application.repository.js";

import { HostApplicationStatus } from "../../../domain/enums/host-application.enum.js";

interface GetHostApplicationsInput {
  page: number;
  limit: number;
  status?: HostApplicationStatus;
}

export class GetHostApplicationsUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
  ) {}

  async execute(input: GetHostApplicationsInput) {
    const { page, limit, status } = input;

    const result =
      await this.hostApplicationRepository.findPaginated(
        page,
        limit,
        status,
      );

    const applications = result.applications.map((application) => ({
      id: application.props.id,
      hostId: application.props.hostId,
      verificationType: application.props.verificationType,

      applicant: {
        legalName: application.props.applicantDetails.legalName,
        contactEmail: application.props.applicantDetails.contactEmail,
        city: application.props.applicantDetails.residentialAddress.city,
        state: application.props.applicantDetails.residentialAddress.state,
      },

      businessDetails: application.props.businessDetails
        ? {
            businessName:
              application.props.businessDetails.businessName,
          }
        : null,

      status: application.props.status,
      submittedAt: application.props.submittedAt,
      createdAt: application.props.createdAt,
      updatedAt: application.props.updatedAt,
    }));

    return {
      applications,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page * limit < result.total,
        hasPreviousPage: page > 1,
      },
    };
  }
}