
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";

import { useAppDispatch, useAppSelector } from "../../../app/store/hooks";
import { setUser } from "../../../app/store/authSlice";

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "../../../services/api/profileApi";

export default function EditProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useAppSelector((state) => state.auth.user);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profileImageUrl ?? null
  );

  const [isFetching, setIsFetching] = useState(!user);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) return;

    let active = true;

    const loadProfile = async () => {
      try {
        const response = await getProfile();

        if (active) {
          dispatch(setUser(response.user));
          setFullName(response.user.fullName);
          setPreviewUrl(response.user.profileImageUrl);
        }
      } catch {
        if (active) setError("Unable to load your profile.");
      } finally {
        if (active) setIsFetching(false);
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [dispatch, user]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!user) return;

    if (
      fullName.trim() === user.fullName &&
      !imageFile
    ) {
      setError("You haven't made any changes.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      let updatedUser = user;

      if (fullName.trim() !== user.fullName) {
        const response = await updateProfile({
          fullName: fullName.trim(),
        });

        updatedUser = {
          ...updatedUser,
          ...response.user,
        };

        dispatch(setUser(updatedUser));
      }

      if (imageFile) {
        const response = await uploadProfileImage(imageFile);

        updatedUser = {
          ...updatedUser,
          profileImageUrl: response.user.profileImageUrl,
        };

        dispatch(setUser(updatedUser));
      }

      setImageFile(null);
      setSuccess("Your profile has been updated successfully.");

      navigate("/account/profile");
    } catch {
      setError(
        "Unable to save your profile. Please check your connection and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-text-secondary">
        Loading your profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-error">
        Unable to retrieve your profile.
      </div>
    );
  }

  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-3xl">

        <button
          type="button"
          onClick={() => navigate("/account/profile")}
          className="mb-6 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          ← Back to profile
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Edit profile
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Update your personal information and profile picture.
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-8">

            {/* Profile picture */}
            <section className="flex flex-col items-center border-b border-border pb-8">
              <h2 className="mb-5 w-full text-lg font-semibold text-text">
                Profile picture
              </h2>

              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-surface-secondary ring-4 ring-primary/10">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-text-secondary">
                    {initials || "U"}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => fileInputRef.current?.click()}
              >
                Edit picture
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelection}
              />

              <p className="mt-3 text-xs text-text-secondary">
                JPEG, PNG or WebP · Maximum 5 MB
              </p>
            </section>

            {/* Personal information */}
            <section className="flex flex-col gap-5">
              <h2 className="text-lg font-semibold text-text">
                Personal information
              </h2>

              <FormField
                label="Full name"
                name="fullName"
                required
              >
                <input
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
                />
              </FormField>

              <FormField label="Email address" name="email">
                <input
                  id="email"
                  value={user.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-text-secondary"
                />
              </FormField>

              <p className="text-xs text-text-secondary">
                Email address changes are currently unavailable.
              </p>
            </section>

            {error && (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="text-sm text-success">
                {success}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => navigate("/account/profile")}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save changes
              </Button>
            </div>

          </div>
        </Card>
      </div>
    </main>
  );
}
