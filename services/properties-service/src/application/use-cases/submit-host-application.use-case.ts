
import { HostApplication } from "../../domain/entities/host-application.entity.js";

import {
  HostApplicationStatus,
} from "../../domain/enums/host-application.enum.js";

import type {
  HostApplicationRepository,
} from "../../domain/repositories/host-application.repository.js";

import type {
  HostApplicationDocumentRepository,
} from "../../domain/repositories/host-application-document.repository.js";

import {
  ActiveHostApplicationExistsError,
} from "../../domain/errors/active-host-application-exists.error.js";

import {
  InvalidHostDocumentReferenceError,
} from "../../domain/errors/invalid-host-document-reference.error.js";

import type {
  SubmitHostApplicationDTO,
} from "../dto/submit-host-application.dto.js";

export class SubmitHostApplicationUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
    private readonly hostDocumentRepository: HostApplicationDocumentRepository,
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

    // 2. Reject duplicate document references.
    const references = dto.documentReferences.map(
      (document) => document.protectedStorageRef,
    );

    if (new Set(references).size !== references.length) {
      throw new InvalidHostDocumentReferenceError();
    }

    // 3. Verify that all documents belong to this applicant.
    const ownedDocuments =
      await this.hostDocumentRepository.findOwnedDocuments(
        references,
        dto.hostId,
      );

    if (ownedDocuments.length !== references.length) {
      throw new InvalidHostDocumentReferenceError();
    }

    // 4. Verify that each submitted document type matches
    // the type recorded when the file was uploaded.
    const ownedDocumentsByReference = new Map(
      ownedDocuments.map((document) => [
        document.reference,
        document,
      ]),
    );

    for (const submittedDocument of dto.documentReferences) {
      const storedDocument = ownedDocumentsByReference.get(
        submittedDocument.protectedStorageRef,
      );

      if (
        !storedDocument ||
        storedDocument.documentType !== submittedDocument.documentType
      ) {
        throw new InvalidHostDocumentReferenceError();
      }
    }

    // 5. Create a new domain entity.
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

    // 6. Apply the domain submission rules.
    application.submit(dto.hostId);

    // 7. Persist through the application repository.
    return this.hostApplicationRepository.create(application);
  }
}
