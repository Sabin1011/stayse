
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

import { useAppDispatch, useAppSelector } from "../../../app/store/hooks";
import { setUser } from "../../../app/store/authSlice";
import { getProfile } from "../../../services/api/profileApi";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        dispatch(setUser(response.user));
      } catch {
        setError("Unable to load your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [dispatch]);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center text-text-secondary">
        Loading your profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-sm text-error">
          {error || "Profile information is unavailable."}
        </p>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-4xl">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            ACCOUNT SETTINGS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            View and manage your personal account information.
          </p>
        </div>

        {/* Profile overview */}
        <Card className="overflow-hidden">

          {/* Profile header */}
          <section className="flex flex-col items-center gap-5 border-b border-border pb-8 sm:flex-row">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-secondary ring-4 ring-primary/10">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={`${user.fullName}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-text-secondary">
                  {getInitials(user.fullName)}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-text">
                {user.fullName}
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {user.email}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  {user.status}
                </span>

                <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-secondary">
                  {user.roles.join(", ")}
                </span>
              </div>
            </div>

          </section>

          {/* Personal information */}
          <section className="py-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text">
                Personal information
              </h3>

              <p className="mt-1 text-sm text-text-secondary">
                Your registered account details.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Full name
                </p>
                <p className="mt-2 font-medium text-text">
                  {user.fullName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Email address
                </p>
                <p className="mt-2 break-all font-medium text-text">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Email verification
                </p>

                <p className="mt-2 flex items-center gap-2 font-medium text-text">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.emailVerified ? "bg-success" : "bg-warning"
                    }`}
                  />

                  {user.emailVerified ? "Verified" : "Not verified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Member since
                </p>

                <p className="mt-2 font-medium text-text">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

            </div>
          </section>

          {/* Account settings */}
          <section className="border-t border-border pt-6">
            <h3 className="font-semibold text-text">
              Account settings
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Need to change your personal information or profile picture?
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-secondary">
                Keep your account information up to date.
              </p>

              <Button
                onClick={() => navigate("/account/profile/edit")}
              >
                Edit profile
              </Button>
            </div>
          </section>

        </Card>
      </div>
    </main>
  );
}
