
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

import {
  getAdminHostApplications,
} from "../../../services/api/adminHostApplicationApi";

import type {
  HostApplication,
  HostApplicationStatus,
} from "../../host-application/types/hostApplication.types";

const statuses: Array<HostApplicationStatus | "ALL"> = [
  "ALL",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
];

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
  return new Date(value).toLocaleDateString("en-IN");
};

export default function AdminHostApplicationsPage() {
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<HostApplicationStatus | "ALL">("ALL");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminHostApplications(
        page,
        limit,
        statusFilter === "ALL" ? undefined : statusFilter,
      );

      setApplications(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          .response?.data?.message;

      setError(message ?? "Unable to load host applications.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const handleStatusChange = (value: HostApplicationStatus | "ALL") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">
            ADMINISTRATION
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-text">
            Host Applications
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Review and manage host verification applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadApplications()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text hover:border-primary disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-bold text-text">Applications</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {total} application{total === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div>
              <label
                htmlFor="application-status"
                className="mb-1.5 block text-xs font-semibold text-text-secondary"
              >
                Filter by status
              </label>
              <select
                id="application-status"
                value={statusFilter}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value as HostApplicationStatus | "ALL",
                  )
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text sm:min-w-48"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL"
                      ? "All applications"
                      : status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="application-limit"
                className="mb-1.5 block text-xs font-semibold text-text-secondary"
              >
                Rows per page
              </label>
              <select
                id="application-limit"
                value={limit}
                onChange={(event) =>
                  handleLimitChange(Number(event.target.value))
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-text-secondary">
            <RefreshCw size={18} className="animate-spin" />
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search size={32} className="text-text-secondary" />
            <h3 className="mt-4 font-bold text-text">
              No applications found
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              There are no applications matching this filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-background">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    <th className="px-5 py-4">Applicant</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Submitted</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-border transition hover:bg-background"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-text">
                          {application.applicant?.legalName ??
                            "Unknown applicant"}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {application.applicant?.contactEmail ??
                            "No email provided"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {application.verificationType}
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {formatDate(application.submittedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            statusStyles[application.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {application.status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/host-applications/${application.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                        >
                          <Eye size={15} />
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-secondary">
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, total)} of {total} applications
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-border p-2 text-text transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="min-w-20 text-center text-sm font-semibold text-text">
                  Page {page} of {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-border p-2 text-text transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
