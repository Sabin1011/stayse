export const HostDocumentType = {
  ID_PROOF: "ID_PROOF",
  ADDRESS_PROOF: "ADDRESS_PROOF",
  OWNERSHIP_PROOF: "OWNERSHIP_PROOF",
  LICENSE: "LICENSE",
  OTHER: "OTHER",
} as const;

export type HostDocumentType =
  (typeof HostDocumentType)[keyof typeof HostDocumentType];