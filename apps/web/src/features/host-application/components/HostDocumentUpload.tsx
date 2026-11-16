import { useState } from "react";
import type { ChangeEvent } from "react";
import { CheckCircle2, FileUp, X } from "lucide-react";

import { uploadHostApplicationDocument } from "../../../services/api/hostApplicationApi";

import type {
  HostDocumentType,
  HostDocumentReference,
  MyHostApplicationDocument,
} from "../types/hostApplication.types";

interface Props {
  onDocumentsChange: (documents: HostDocumentReference[]) => void;
  existingDocuments?: MyHostApplicationDocument[];
}

const documentOptions: {
  type: HostDocumentType;
  label: string;
  description: string;
}[] = [
  {
    type: "ID_PROOF",
    label: "Identity proof",
    description: "Passport, Aadhaar card, driving licence, etc.",
  },
  {
    type: "ADDRESS_PROOF",
    label: "Address proof",
    description: "A document verifying your residential address.",
  },
  {
    type: "OWNERSHIP_PROOF",
    label: "Property ownership proof",
    description: "Documents showing ownership or authorization.",
  },
  {
    type: "LICENSE",
    label: "Business license",
    description: "Business registration or applicable license.",
  },
  {
    type: "OTHER",
    label: "Other supporting document",
    description: "Any additional supporting document.",
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export default function HostDocumentUpload({
  onDocumentsChange,
  existingDocuments = [],
}: Props) {
  const [documents, setDocuments] = useState<
    HostDocumentReference[]
  >([]);

  const [uploadingType, setUploadingType] =
    useState<HostDocumentType | null>(null);

  const [error, setError] = useState("");

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    documentType: HostDocumentType
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG and PNG files are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Each document must be 5 MB or smaller.");
      return;
    }

    try {
      setUploadingType(documentType);

      const response = await uploadHostApplicationDocument(
        file,
        documentType
      );

      const uploadedDocument: HostDocumentReference = {
        documentType: response.data.documentType,
        protectedStorageRef: response.data.protectedStorageRef,
        uploadedAt: response.data.uploadedAt,
      };

      setDocuments((previous) => {
        const updated = [
          ...previous.filter(
            (item) => item.documentType !== documentType
          ),
          uploadedDocument,
        ];

        onDocumentsChange(updated);
        return updated;
      });
    } catch (err: unknown) {
      const message = (
        err as {
          response?: { data?: { message?: string } };
        }
      ).response?.data?.message;

      setError(message ?? `Unable to upload ${file.name}. Please try again.`);
    } finally {
      setUploadingType(null);
    }
  };

  const removeDocument = (documentType: HostDocumentType) => {
    const updated = documents.filter(
      (item) => item.documentType !== documentType
    );

    setDocuments(updated);
    onDocumentsChange(updated);
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-text">
        Verification documents
      </h2>

      <p className="mt-1 text-sm text-text-secondary">
        Upload PDF, JPG or PNG files, up to 5 MB each.
        Existing documents are retained unless replaced.
      </p>

      <div className="mt-5 space-y-4">
        {documentOptions.map((option) => {
          const uploaded = documents.find(
            (document) => document.documentType === option.type
          );

          const existing = existingDocuments.find(
            (document) => document.documentType === option.type
          );

          const isUploading = uploadingType === option.type;

          return (
            <div
              key={option.type}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-text">
                    {option.label}
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    {option.description}
                  </p>

                  {uploaded && (
                    <p className="mt-2 text-xs font-medium text-green-700">
                      New document uploaded
                    </p>
                  )}

                  {!uploaded && existing && (
                    <p className="mt-2 text-xs font-medium text-green-700">
                      Existing document retained
                    </p>
                  )}
                </div>

                {uploaded ? (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                      <CheckCircle2 size={17} />
                      Uploaded
                    </span>

                    <button
                      type="button"
                      onClick={() => removeDocument(option.type)}
                      className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-red-600"
                      aria-label={`Remove replacement ${option.label}`}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary ${
                      isUploading || uploadingType
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <FileUp size={17} />
                    {isUploading
                      ? "Uploading..."
                      : existing
                        ? "Replace file"
                        : "Choose file"}

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={Boolean(uploadingType)}
                      onChange={(event) =>
                        handleFileChange(event, option.type)
                      }
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </section>
  );
}