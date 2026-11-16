
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Clock3,
  FileCheck2,
  RefreshCw,
} from "lucide-react";

import PageHeader from "../../../components/ui/PageHeader";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

import { getMyHostApplication } from "../../../services/api/hostApplicationApi";

import type {
  MyHostApplication,
  HostApplicationStatus,
} from "../../host-application/types/hostApplication.types";

type ApplicationState =
  | "loading"
  | "loaded"
  | "error";

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
    description: "Your application has not been submitted yet.",
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
    description: "Our team has requested changes to your application.",
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

export default function HostDashboardPage() {
  const [application, setApplication] =
    useState<MyHostApplication | null>(null);
    
  const [pageState, setPageState] =
    useState<ApplicationState>("loading");

  const [error, setError] = useState("");

  const fetchApplication = async () => {
    try {
      setPageState("loading");
      setError("");

      const response = await getMyHostApplication();

      setApplication(response.data);
      setPageState("loaded");
    } catch {
      setError(
        "We couldn't load your host application. Please try again."
      );
      setPageState("error");
    }
  };

  useEffect(() => {
    void fetchApplication();
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const renderApplicationContent = () => {
    if (pageState === "loading") {
      return (
        <Card>
          <div className="flex items-center gap-3 text-text-secondary">
            <RefreshCw className="animate-spin" size={19} />
            <p className="text-sm">Loading your application...</p>
          </div>
        </Card>
      );
    }

    if (pageState === "error") {
      return (
        <Card>
          <div className="space-y-4">
            <p role="alert" className="text-sm text-error">
              {error}
            </p>

            <Button onClick={() => void fetchApplication()}>
              Try again
            </Button>
          </div>
        </Card>
      );
    }

    if (!application) {
      return (
        <Card>
          <div className="flex flex-col items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Building2 size={25} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-text">
                Start your hosting journey
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                You haven't submitted a host application yet.
                Complete the application to begin the verification process.
              </p>
            </div>

            <Link to="/host-application">
              <Button>
                Apply to become a host
                <ArrowRight className="ml-2" size={17} />
              </Button>
            </Link>
          </div>
        </Card>
      );
    }

    const status = statusConfig[application.status];

    return (
      <Card>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <FileCheck2 size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-text">
                Host verification application
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

          <Link to="/host-application">
            <Button variant="outline" size="sm">
              View application
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>

        <div className="mt-6 rounded-xl bg-surface-secondary p-4">
          <p className="text-sm font-semibold text-text">
            Application status
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {status.description}
          </p>
        </div>

        <div className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-text-secondary">
              Application ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-text">
              {application.id}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-text-secondary">
              Submitted on
            </p>

            <p className="mt-1 text-sm font-semibold text-text">
              {formatDate(application.submittedAt)}
            </p>
          </div>
        </div>

        {application.status === "CHANGES_REQUESTED" &&
          application.review?.reviewNote && (
            <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 p-4">
              <p className="text-sm font-semibold text-text">
                Review feedback
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                {application.review?.reviewNote}
              </p>

              <Link
                to="/host-application"
                className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                Review your application
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>
          )}
      </Card>
    );
  };

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Welcome to your Stayse hosting workspace. Manage your host verification and track your application."
      />

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Clock3 size={19} className="text-primary" />

          <h2 className="text-base font-bold text-text">
            Host verification
          </h2>
        </div>

        {renderApplicationContent()}
      </section>
    </div>
  );
}
