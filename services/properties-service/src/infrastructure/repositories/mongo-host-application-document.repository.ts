
import { randomUUID } from "node:crypto";

import type {
  HostApplicationDocumentRepository,
  SaveHostDocumentInput,
  StoredHostDocument,
  RetrievedHostDocument,
} from "../../domain/repositories/host-application-document.repository.js";

import { HostApplicationDocumentModel } from "../database/mongodb/models/host-application-document.model.js";

import { LocalHostDocumentStorage } from "../storage/local-host-document.storage.js";

export class MongoHostApplicationDocumentRepository
  implements HostApplicationDocumentRepository
{
  constructor(
    private readonly storage: LocalHostDocumentStorage,
  ) {}

  async save(
    input: SaveHostDocumentInput,
  ): Promise<StoredHostDocument> {
    const extension =
      input.mimeType === "application/pdf"
        ? "pdf"
        : input.mimeType === "image/jpeg"
          ? "jpg"
          : "png";

    // Save the actual file in private storage.
    const storageKey = await this.storage.save(
      input.buffer,
      extension,
    );

    const uploadedAt = new Date();
    const reference = randomUUID();

    try {
      // Save only metadata in MongoDB.
      await HostApplicationDocumentModel.create({
        reference,
        ownerUserId: input.ownerUserId,
        documentType: input.documentType,
        mimeType: input.mimeType,
        storageKey,
        sizeBytes: input.sizeBytes,
        uploadedAt,
      });
    } catch (error) {
      // If MongoDB persistence fails, remove the physical file.
      await this.storage.delete(storageKey);

      throw error;
    }

    return {
      reference,
      documentType: input.documentType,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      uploadedAt,
    };
  }

  async findOwnedDocument(
    reference: string,
    ownerUserId: string,
  ): Promise<RetrievedHostDocument | null> {
    const document = await HostApplicationDocumentModel.findOne({
      reference,
      ownerUserId,
    }).lean();

    if (!document) {
      return null;
    }

    const buffer = await this.storage.read(
      document.storageKey,
    );

    return {
      metadata: {
        reference: document.reference,
        documentType: document.documentType,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        uploadedAt: document.uploadedAt,
      },
      buffer,
    };
  }


  async findOwnedDocuments(
    references: string[],
    ownerUserId: string,
  ): Promise<StoredHostDocument[]> {
    if (references.length === 0) {
      return [];
    }

    const documents = await HostApplicationDocumentModel.find({
      reference: { $in: references },
      ownerUserId,
    })
      .select({
        reference: 1,
        documentType: 1,
        mimeType: 1,
        sizeBytes: 1,
        uploadedAt: 1,
        _id: 0,
      })
      .lean();

    return documents.map((document) => ({
      reference: document.reference,
      documentType: document.documentType,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      uploadedAt: document.uploadedAt,
    }));
  }

}
