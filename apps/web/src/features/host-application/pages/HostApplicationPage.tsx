
import { Link } from "react-router-dom";
import { ArrowLeft, HousePlus } from "lucide-react";

import HostApplicationForm from "../components/HostApplicationForm";

export default function HostApplicationPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <div className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">

          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HousePlus size={25} />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Become a Stayse Host
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text">
              Start your hosting journey
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Tell us about yourself and provide the required information.
              Our team will review your application.
            </p>
          </div>

          <HostApplicationForm />

        </div>
      </div>
    </main>
  );
}
