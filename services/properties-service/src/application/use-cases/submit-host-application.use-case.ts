import { HostApplication } from "../../domain/entities/host-application.entity.js";

import {
  HostApplicationStatus,
} from "../../domain/enums/host-application.enum.js";

import type {
  HostApplicationRepository,
} from "../../domain/repositories/host-application.repository.js";

import {
  ActiveHostApplicationExistsError,
} from "../../domain/errors/active-host-application-exists.error.js";

import type {
  SubmitHostApplicationDTO,
} from "../dto/submit-host-application.dto.js";

export class SubmitHostApplicationUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
  ) {}

  async execute(
    dto: SubmitHostApplicationDTO,
  ): Promise<HostApplication> {
    // 1. Check whether the host already has an active application.
    const existingApplication =
      await this.hostApplicationRepository.findActiveByHostId(
        dto.hostId,
      );

    if (existingApplication) {
      throw new ActiveHostApplicationExistsError();
    }

    // 2. Create a new domain entity.
    const now = new Date();

    const application = new HostApplication({
      id: null,
      hostId: dto.hostId,
      verificationType: dto.verificationType,
      applicantDetails: dto.applicantDetails,
      ...(dto.businessDetails
        ? { businessDetails: dto.businessDetails }
        : {}),
      documentReferences: dto.documentReferences,
      status: HostApplicationStatus.DRAFT,
      review: {
        reviewedByUserId: null,
        reviewedAt: null,
        reviewNote: null,
      },
      applicationHistory: [],
      isActive: true,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Apply the domain submission rules.
    application.submit(dto.hostId);

    // 4. Persist through the repository abstraction.
    return this.hostApplicationRepository.create(application);
  }
}