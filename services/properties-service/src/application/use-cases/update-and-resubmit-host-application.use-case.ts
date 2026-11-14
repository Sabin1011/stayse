
import { HostApplicationStatus } from "../../domain/enums/host-application.enum.js";

import {
  HostApplicationError,
} from "../../domain/errors/host-application.error.js";

import {
  InvalidHostDocumentReferenceError,
} from "../../domain/errors/invalid-host-document-reference.error.js";

import type {
  HostApplicationRepository,
} from "../../domain/repositories/host-application.repository.js";

import type {
  HostApplicationDocumentRepository,
} from "../../domain/repositories/host-application-document.repository.js";

import type {
  SubmitHostApplicationDTO,
} from "../dto/submit-host-application.dto.js";

import type {
  HostApplication,
} from "../../domain/entities/host-application.entity.js";

export class UpdateAndResubmitHostApplicationUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
    private readonly hostDocumentRepository: HostApplicationDocumentRepository,
  ) {}

  async execute(
    dto: SubmitHostApplicationDTO,
  ): Promise<HostApplication> {
    // 1. Find the authenticated host's active application.
    const application =
      await this.hostApplicationRepository.findActiveByHostId(
        dto.hostId,
      );

    if (!application) {
      throw new HostApplicationError(
        "No active host application was found to update",
      );
    }

    // 2. Only drafts and applications requiring changes are editable.
    if (
      application.props.status !== HostApplicationStatus.DRAFT &&
      application.props.status !== HostApplicationStatus.CHANGES_REQUESTED
    ) {
      throw new HostApplicationError(
        "Only draft or changes-requested applications can be updated",
      );
    }

    // 3. Reject duplicate document references.
    const references = dto.documentReferences.map(
      (document) => document.protectedStorageRef,
    );

    if (new Set(references).size !== references.length) {
      throw new InvalidHostDocumentReferenceError();
    }

    // 4. Verify that all submitted documents belong to this host.
    const ownedDocuments =
      await this.hostDocumentRepository.findOwnedDocuments(
        references,
        dto.hostId,
      );

    if (ownedDocuments.length !== references.length) {
      throw new InvalidHostDocumentReferenceError();
    }

    // 5. Verify that the document types match their stored metadata.
    const documentsByReference = new Map(
      ownedDocuments.map((document) => [
        document.reference,
        document,
      ]),
    );

    for (const submittedDocument of dto.documentReferences) {
      const storedDocument = documentsByReference.get(
        submittedDocument.protectedStorageRef,
      );

      if (
        !storedDocument ||
        storedDocument.documentType !== submittedDocument.documentType
      ) {
        throw new InvalidHostDocumentReferenceError();
      }
    }

    // 6. Update the existing domain entity.
    application.updateDetails({
      verificationType: dto.verificationType,
      applicantDetails: dto.applicantDetails,
      ...(dto.businessDetails
        ? { businessDetails: dto.businessDetails }
        : {}),
      documentReferences: dto.documentReferences,
    });

    // 7. Apply the domain submission rules.
    // This records RESUBMITTED when the application already has history.
    application.submit(dto.hostId);

    // 8. Update the existing MongoDB document, not create a new one.
    return this.hostApplicationRepository.update(application);
  }
}
