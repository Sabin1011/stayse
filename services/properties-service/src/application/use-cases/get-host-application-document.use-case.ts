
import type {
  HostApplicationDocumentRepository,
} from "../../domain/repositories/host-application-document.repository.js";

export class GetHostApplicationDocumentUseCase {
  constructor(
    private readonly repository: HostApplicationDocumentRepository,
  ) {}

  async execute(
    reference: string,
    ownerUserId: string,
  ) {
    return this.repository.findOwnedDocument(
      reference,
      ownerUserId,
    );
  }
}
