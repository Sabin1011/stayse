import type { HostDocumentType } from "../../domain/enums/host-document-type.enum.js";


export interface SaveHostDocumentInput {
  ownerUserId: string;
  documentType: HostDocumentType;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
}

export interface StoredHostDocument {
  reference: string;
  documentType: HostDocumentType;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

export interface RetrievedHostDocument {
  metadata: StoredHostDocument;
  buffer: Buffer;
}

export interface HostApplicationDocumentRepository {
  save(
    input: SaveHostDocumentInput,
  ): Promise<StoredHostDocument>;

  findOwnedDocument(
    reference: string,
    ownerUserId: string,
  ): Promise<RetrievedHostDocument | null>;

  findOwnedDocuments(
    references: string[],
    ownerUserId: string,
  ): Promise<StoredHostDocument[]>;
}