
import { useState } from "react";
import type { FormEvent } from "react";
import { Building2, UserRound, CheckCircle2 } from "lucide-react";

import { submitHostApplication } from "../../../services/api/hostApplicationApi";

import type {
  VerificationType,
  SubmitHostApplicationRequest,
  HostDocumentReference
} from "../types/hostApplication.types";

import HostDocumentUpload from "./HostDocumentUpload";

interface FormState {
  legalName: string;
  contactPhone: string;
  contactEmail: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  businessName: string;
  registrationNumber: string;
}

const initialForm: FormState = {
  legalName: "",
  contactPhone: "",
  contactEmail: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "IN",
  businessName: "",
  registrationNumber: "",
};

export default function HostApplicationForm() {
  const [verificationType, setVerificationType] =
    useState<VerificationType>("INDIVIDUAL");

  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [documentReferences, setDocumentReferences] = useState<HostDocumentReference[]>([]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (
      verificationType === "BUSINESS" &&
      !form.businessName.trim()
    ) {
      setError("Please enter your business name.");
      return;
    }

    const requestData: SubmitHostApplicationRequest = {
      verificationType,

      applicantDetails: {
        legalName: form.legalName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),

        residentialAddress: {
          addressLine: form.addressLine.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          countryCode: form.countryCode.trim().toUpperCase(),
        },
      },

      ...(verificationType === "BUSINESS"
        ? {
            businessDetails: {
              businessName: form.businessName.trim(),
              ...(form.registrationNumber.trim()
                ? {
                    registrationNumber:
                      form.registrationNumber.trim(),
                  }
                : {}),
            },
          }
        : {}),

      documentReferences,
    };

    try {
      setIsSubmitting(true);

      const response = await submitHostApplication(requestData);

      setSuccessMessage(
        `Your application was submitted successfully. Application ID: ${response.data.applicationId}`
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "Unable to submit your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-text";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Verification type */}
      <section>
        <h2 className="text-lg font-bold text-text">
          Choose your verification type
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Select how you want to register as a Stayse host.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          <button
            type="button"
            onClick={() => setVerificationType("INDIVIDUAL")}
            className={`rounded-2xl border p-5 text-left transition ${
              verificationType === "INDIVIDUAL"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <UserRound className="mb-3 text-primary" size={25} />

            <p className="font-bold text-text">Individual</p>

            <p className="mt-1 text-sm text-text-secondary">
              Apply as an individual property owner.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setVerificationType("BUSINESS")}
            className={`rounded-2xl border p-5 text-left transition ${
              verificationType === "BUSINESS"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Building2 className="mb-3 text-primary" size={25} />

            <p className="font-bold text-text">Business</p>

            <p className="mt-1 text-sm text-text-secondary">
              Apply as a registered business.
            </p>
          </button>

        </div>
      </section>

      {/* Applicant details */}
      <section>
        <h2 className="text-lg font-bold text-text">
          Applicant information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">

          <div className="sm:col-span-2">
            <label className={labelClass}>Legal name</label>
            <input
              required
              name="legalName"
              value={form.legalName}
              onChange={handleChange}
              maxLength={100}
              placeholder="Enter your full legal name"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Contact phone</label>
            <input
              required
              type="tel"
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              minLength={8}
              maxLength={20}
              placeholder="Enter your phone number"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Contact email</label>
            <input
              required
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              maxLength={255}
              placeholder="Enter your email"
              className={inputClass}
            />
          </div>

        </div>
      </section>

      {/* Residential address */}
      <section>
        <h2 className="text-lg font-bold text-text">
          Residential address
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">

          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <input
              required
              name="addressLine"
              value={form.addressLine}
              onChange={handleChange}
              minLength={5}
              maxLength={200}
              placeholder="House number, street, area"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>City</label>
            <input
              required
              name="city"
              value={form.city}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              placeholder="City"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>State</label>
            <input
              required
              name="state"
              value={form.state}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              placeholder="State"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Postal code</label>
            <input
              required
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              minLength={4}
              maxLength={12}
              placeholder="Postal code"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Country code</label>
            <input
              required
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
              minLength={2}
              maxLength={2}
              placeholder="IN"
              className={inputClass}
            />
          </div>

        </div>
      </section>

      {/* Business details */}
      {verificationType === "BUSINESS" && (
        <section>
          <h2 className="text-lg font-bold text-text">
            Business information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div>
              <label className={labelClass}>Business name</label>
              <input
                required
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                minLength={2}
                maxLength={150}
                placeholder="Registered business name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Registration number (optional)
              </label>
              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                maxLength={100}
                placeholder="Business registration number"
                className={inputClass}
              />
            </div>

          </div>
        </section>
      )}
      
      <HostDocumentUpload
        onDocumentsChange={setDocumentReferences}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 className="shrink-0" size={20} />
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Submitting..." : "Submit Host Application"}
      </button>

    </form>
  );
}
