
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";

import HostApplicationForm from "../components/HostApplicationForm";

import { getMyHostApplication } from "../../../services/api/hostApplicationApi";

import type {
  MyHostApplication,
  HostApplicationStatus,
} from "../types/hostApplication.types";

const statusConfig: Record<
  HostApplicationStatus,
  {
    label: string;
    variant: "success" | "warning" | "error" | "info" | "neutral";
    description: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    variant: "neutral",
    description: "Your application is saved as a draft.",
  },
  SUBMITTED: {
    label: "Submitted",
    variant: "info",
    description: "Your application has been submitted and is awaiting review.",
  },
  UNDER_REVIEW: {
    label: "Under review",
    variant: "warning",
    description: "Our team is currently reviewing your application.",
  },
  CHANGES_REQUESTED: {
    label: "Changes requested",
    variant: "warning",
    description: "Please review the feedback and update your application.",
  },
  APPROVED: {
    label: "Approved",
    variant: "success",
    description: "Your host application has been approved.",
  },
  REJECTED: {
    label: "Rejected",
    variant: "error",
    description: "Your host application has been rejected.",
  },
};

export default function HostApplicationPage() {
  const [application, setApplication] =
    useState<MyHostApplication | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyHostApplication();
      setApplication(response.data);
    } catch {
      setError("Unable to load your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplication();
  }, []);

  const handleSuccess = () => {
    void fetchApplication();
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-text-secondary">
          <RefreshCw size={18} className="animate-spin" />
          Loading your application...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p role="alert" className="text-sm text-error">
          {error}
        </p>

        <div className="mt-4">
          <Button onClick={() => void fetchApplication()}>
            Try again
          </Button>
        </div>
      </Card>
    );
  }

  if (!application) {
    return (
      <div>
        <PageHeader
          title="Become a Stayse Host"
          description="Complete your host verification application to start your hosting journey."
        />

        <Card>
          <HostApplicationForm onSuccess={handleSuccess} />
        </Card>
      </div>
    );
  }

  const status = statusConfig[application.status];

  if (
    application.status === "CHANGES_REQUESTED" ||
    application.status === "DRAFT"
  ) {
    return (
      <div>
        <PageHeader
          title={
            application.status === "DRAFT"
              ? "Complete your application"
              : "Update your application"
          }
          description="Review your application details and make any required changes."
        />

        {application.status === "CHANGES_REQUESTED" && (
          <Card>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 text-warning" size={21} />

              <div>
                <h2 className="font-bold text-text">
                  Admin feedback
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                  {application.review?.reviewNote ||
                    "Please review your application details and resubmit."}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-6">
          <Card>
            <HostApplicationForm
              initialApplication={application}
              onSuccess={handleSuccess}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/host/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>
      </div>

      <PageHeader
        title="Host application"
        description="View your host verification application and its current status."
      />

      <Card>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 text-primary" size={22} />

          <div>
            <h2 className="font-bold text-text">
              {application.applicantDetails.legalName}
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              {application.verificationType === "BUSINESS"
                ? "Business application"
                : "Individual application"}
            </p>

            <div className="mt-3">
              <Badge variant={status.variant}>
                {status.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-surface-secondary p-4">
          <p className="text-sm font-semibold text-text">
            Application status
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {status.description}
          </p>
        </div>

        <div className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-text-secondary">
              Application ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-text">
              {application.id}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-secondary">
              Submitted on
            </p>

            <p className="mt-1 text-sm font-semibold text-text">
              {application.submittedAt
                ? new Date(application.submittedAt).toLocaleDateString(
                    "en-IN"
                  )
                : "Not available"}
            </p>
          </div>
        </div>

        {application.review?.reviewNote && (
          <div className="mt-5 rounded-xl border border-border p-4">
            <p className="text-sm font-semibold text-text">
              Admin review note
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">
              {application.review.reviewNote}
            </p>
          </div>
        )}

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => void fetchApplication()}
          >
            Refresh application
          </Button>
        </div>
      </Card>
    </div>
  );
}
