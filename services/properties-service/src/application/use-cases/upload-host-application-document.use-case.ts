
import type {
  HostApplicationDocumentRepository,
  StoredHostDocument,
} from "../../domain/repositories/host-application-document.repository.js";

import type { HostDocumentType } from "../../domain/enums/host-document-type.enum.js";

interface UploadHostDocumentInput {
  ownerUserId: string;
  documentType: HostDocumentType;
  mimeType: string;
  buffer: Buffer;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export class UploadHostApplicationDocumentUseCase {
  constructor(
    private readonly repository: HostApplicationDocumentRepository,
  ) {}

  async execute(
    input: UploadHostDocumentInput,
  ): Promise<StoredHostDocument> {
    if (!input.ownerUserId) {
      throw new Error("Authenticated user is required");
    }

    if (input.buffer.length === 0) {
      throw new Error("The uploaded file is empty");
    }

    if (input.buffer.length > MAX_FILE_SIZE) {
      throw new Error("File size cannot exceed 5 MB");
    }

    const detectedMimeType = this.detectMimeType(input.buffer);

    if (!detectedMimeType || detectedMimeType !== input.mimeType) {
      throw new Error("Unsupported or invalid document format");
    }

    return this.repository.save({
      ownerUserId: input.ownerUserId,
      documentType: input.documentType,
      mimeType: detectedMimeType,
      sizeBytes: input.buffer.length,
      buffer: input.buffer,
    });
  }

  private detectMimeType(buffer: Buffer): string | null {
    // PDF signature
    if (
      buffer.length >= 5 &&
      buffer.subarray(0, 5).toString("ascii") === "%PDF-"
    ) {
      return "application/pdf";
    }

    // JPEG signature
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return "image/jpeg";
    }

    // PNG signature
    if (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47,
          0x0d, 0x0a, 0x1a, 0x0a,
        ]),
      )
    ) {
      return "image/png";
    }

    return null;
  }
}
