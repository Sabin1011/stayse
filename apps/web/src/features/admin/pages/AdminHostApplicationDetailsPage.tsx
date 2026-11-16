
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";

import {
  getAdminHostApplicationById,
  reviewAdminHostApplication,
  downloadHostApplicationDocument,
  type AdminHostApplicationDetails,
} from "../../../services/api/adminHostApplicationApi";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  CHANGES_REQUESTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function AdminHostApplicationDetailsPage() {
  const { applicationId } = useParams<{ applicationId: string }>();

  const [application, setApplication] =
    useState<AdminHostApplicationDetails | null>(null);

  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingReference, setDownloadingReference] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadApplication = useCallback(async () => {
    if (!applicationId) {
      setError("Application ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminHostApplicationById(applicationId);

      setApplication(response.data);
    } catch (err: unknown) {
      const message = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      setError(message ?? "Unable to load application details.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const handleReview = async (
    action:
      | "start-review"
      | "approve"
      | "reject"
      | "request-changes",
  ) => {
    if (!application || !applicationId) return;

    if (
      (action === "reject" || action === "request-changes") &&
      !reviewNote.trim()
    ) {
      setError("A review note is required for this action.");
      return;
    }

    const confirmationMessages: Record<string, string> = {
      "start-review": "Start reviewing this application?",
      approve: "Approve this host application?",
      reject: "Reject this host application?",
      "request-changes": "Request changes from this applicant?",
    };

    if (!window.confirm(confirmationMessages[action])) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await reviewAdminHostApplication(
        application.id,
        action,
        reviewNote.trim() || undefined,
      );

      setReviewNote("");

      await loadApplication();

      setSuccess("Application review updated successfully.");
    } catch (err: unknown) {
      const message = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      setError(message ?? "Unable to update application review.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentDownload = async (
    reference: string,
  ) => {
    if (!applicationId) return;

    try {
      setDownloadingReference(reference);
      setError("");

      const blob = await downloadHostApplicationDocument(
        applicationId,
        reference,
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `host-document-${reference}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      setError(message ?? "Unable to download document.");
    } finally {
      setDownloadingReference(null);
    }
  };

  const isFinal =
    application?.status === "APPROVED" ||
    application?.status === "REJECTED";

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-12 text-sm text-text-secondary">
        <RefreshCw size={18} className="animate-spin" />
        Loading application details...
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="space-y-5">
        <Link
          to="/admin/host-applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={17} />
          Back to applications
        </Link>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>

        <button
          type="button"
          onClick={() => void loadApplication()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!application) return null;

  const applicant = application.applicantDetails;
  const address = applicant.residentialAddress;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        to="/admin/host-applications"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft size={17} />
        Back to applications
      </Link>

      {/* Application header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">
            HOST APPLICATION
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-text">
            {applicant.legalName}
          </h1>

          <p className="mt-2 break-all text-xs text-text-secondary">
            Application ID: {application.id}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            statusStyles[application.status] ??
            "bg-gray-100 text-gray-700"
          }`}
        >
          {application.status.replaceAll("_", " ")}
        </span>
      </header>

      {/* Error and success messages */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Applicant information */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="mb-4 font-bold text-text">
          Applicant information
        </h2>

        <div className="grid gap-4 rounded-xl bg-background p-4 sm:grid-cols-2">
          <Detail
            label="Legal name"
            value={applicant.legalName}
          />

          <Detail
            label="Phone"
            value={applicant.contactPhone || "Not provided"}
          />

          <Detail
            label="Email"
            value={applicant.contactEmail}
          />

          <Detail
            label="Verification type"
            value={application.verificationType}
          />
        </div>
      </section>

      {/* Residential address */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="mb-4 font-bold text-text">
          Residential address
        </h2>

        <div className="rounded-xl bg-background p-4 text-sm leading-6 text-text-secondary">
          {address.addressLine}
          <br />
          {address.city}, {address.state}
          <br />
          {address.postalCode}, {address.countryCode}
        </div>
      </section>

      {/* Business information */}
      {application.businessDetails && (
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
          <h2 className="mb-4 font-bold text-text">
            Business information
          </h2>

          <div className="rounded-xl bg-background p-4">
            <Detail
              label="Business name"
              value={application.businessDetails.businessName}
            />

            <Detail
              label="Registration number"
              value={
                application.businessDetails.registrationNumber ?? "—"
              }
            />
          </div>
        </section>
      )}

      {/* Verification documents */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="mb-4 font-bold text-text">
          Verification documents
        </h2>

        <div className="space-y-3">
          {application.documents.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No documents submitted.
            </p>
          ) : (
            application.documents.map((document) => (
              <div
                key={document.reference}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-primary" size={20} />

                  <div>
                    <p className="text-sm font-semibold text-text">
                      {document.documentType.replaceAll("_", " ")}
                    </p>

                    <p className="text-xs text-text-secondary">
                      Uploaded {formatDate(document.uploadedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={downloadingReference !== null}
                  onClick={() =>
                    void handleDocumentDownload(document.reference)
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <Download size={15} />

                  {downloadingReference === document.reference
                    ? "Downloading..."
                    : "Download"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review information */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="mb-4 font-bold text-text">
          Review information
        </h2>

        <div className="rounded-xl bg-background p-4">
          <Detail
            label="Submitted"
            value={formatDate(application.submittedAt)}
          />

          <Detail
            label="Reviewed"
            value={formatDate(application.review?.reviewedAt)}
          />

          <Detail
            label="Review note"
            value={application.review?.reviewNote || "No review note"}
          />
        </div>
      </section>

      {/* Review actions */}
      {!isFinal && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-7">
          <h2 className="font-bold text-text">
            Review application
          </h2>

          <div>
            <label
              htmlFor="review-note"
              className="mb-2 block text-sm font-semibold text-text"
            >
              Review note
            </label>

            <textarea
              id="review-note"
              rows={4}
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder="Enter a reason for rejection or requested changes..."
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text outline-none focus:border-primary"
            />

            <p className="mt-1 text-xs text-text-secondary">
              Required when rejecting or requesting changes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {application.status === "SUBMITTED" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleReview("start-review")}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text hover:border-primary disabled:opacity-50"
              >
                <Clock size={17} />
                Start review
              </button>
            )}

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => void handleReview("approve")}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 size={17} />
              Approve
            </button>

            <button
              type="button"
              disabled={actionLoading || !reviewNote.trim()}
              onClick={() => void handleReview("request-changes")}
              className="rounded-xl border border-orange-300 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50"
            >
              Request changes
            </button>

            <button
              type="button"
              disabled={actionLoading || !reviewNote.trim()}
              onClick={() => void handleReview("reject")}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle size={17} />
              Reject
            </button>
          </div>

          {actionLoading && (
            <p className="text-sm text-text-secondary">
              Updating application...
            </p>
          )}
        </section>
      )}

      {/* Final application status */}
      {isFinal && (
        <div className="rounded-xl bg-background p-4 text-sm text-text-secondary">
          This application has been {application.status.toLowerCase()}.
        </div>
      )}

      {/* Application history */}
      {application.applicationHistory &&
        application.applicationHistory.length > 0 && (
          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
            <h2 className="mb-4 font-bold text-text">
              Application history
            </h2>

            <div className="space-y-4">
              {application.applicationHistory.map((history, index) => (
                <div
                  key={`${history.action}-${history.at}-${index}`}
                  className="border-l-2 border-primary/30 pl-4"
                >
                  <p className="text-sm font-semibold text-text">
                    {history.action.replaceAll("_", " ")}
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    {formatDate(history.at)}
                  </p>

                  {history.note && (
                    <p className="mt-2 text-sm text-text-secondary">
                      {history.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-3 min-w-0">
      <p className="text-xs font-medium text-text-secondary">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-text">
        {value}
      </p>
    </div>
  );
}
