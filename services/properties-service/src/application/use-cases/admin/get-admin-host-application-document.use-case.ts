
import type { HostApplicationRepository } from "../../interfaces/host-application.repository.js";

import type { HostApplicationDocumentRepository } from "../../interfaces/host-application-document.repository.js";

export class GetAdminHostApplicationDocumentUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
    private readonly documentRepository: HostApplicationDocumentRepository,
  ) {}

  async execute(applicationId: string, reference: string) {
    // 1. Find the host application.
    const application =
      await this.hostApplicationRepository.findById(applicationId);

    if (!application) {
      return null;
    }

    // 2. Confirm that the requested document belongs
    // to this particular host application.
    const documentBelongsToApplication =
      application.props.documentReferences.some(
        (document) =>
          document.protectedStorageRef === reference,
      );

    if (!documentBelongsToApplication) {
      return null;
    }

    // 3. Retrieve the document using the application's
    // host ID as the owner.
    return this.documentRepository.findOwnedDocument(
      reference,
      application.props.hostId,
    );
  }
}
