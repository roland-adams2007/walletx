"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useUserStore, useBusinessStore } from "@/app/stores/store";
import { useAlert } from "../../../../lib/alert-context";

function stripPhonePrefix(phone?: string) {
  if (!phone) return "";
  return phone.replace(/^\+?234/, "");
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  isLoading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="card rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          {description}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-secondary px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{
              background: "var(--danger)",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Deactivating..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { showAlert } = useAlert();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  const { user, hasFetched, fetchUser, updateProfile, updatePassword } =
    useUserStore();
  const {
    selectedBusinessId,
    businessDetails,
    isDeactivating,
    deactivateBusiness,
  } = useBusinessStore();

  useEffect(() => {
    if (hasFetched) return;
    fetchUser();
  }, [hasFetched]);

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname ?? "");
      setLastname(user.lastname ?? "");
      setPhone(stripPhonePrefix(user.phone));
    }
  }, [user]);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileSaving(true);
    const result = await updateProfile({
      firstname,
      lastname,
      phone: `+234${phone}`,
    });
    setProfileSaving(false);
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Profile updated" : "Failed to update profile"),
    );
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAlert("error", "New password and confirmation do not match");
      return;
    }
    setPasswordSaving(true);
    const result = await updatePassword({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
    setPasswordSaving(false);
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Password updated" : "Failed to update password"),
    );
    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleConfirmDeactivate() {
    if (!selectedBusinessId) return;
    const result = await deactivateBusiness(selectedBusinessId);
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success
          ? "Business deactivated"
          : "Failed to deactivate business"),
    );
    if (result.success) {
      setDeactivateModalOpen(false);
    }
  }

  const isBusinessActive = businessDetails?.is_active !== false;

  return (
    <>
      <div className="card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-5">Your details</h3>
        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="p-firstname"
                className="text-sm font-medium block mb-1.5"
              >
                First name
              </label>
              <input
                id="p-firstname"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="p-lastname"
                className="text-sm font-medium block mb-1.5"
              >
                Last name
              </label>
              <input
                id="p-lastname"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="p-email"
              className="text-sm font-medium block mb-1.5"
            >
              Email address
            </label>
            <input
              id="p-email"
              type="email"
              readOnly
              value={user?.email ?? ""}
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="p-phone"
              className="text-sm font-medium block mb-1.5"
            >
              Phone number
            </label>
            <div className="flex">
              <span
                className="px-3.5 py-2.5 rounded-l-lg text-sm"
                style={{
                  border: "1px solid var(--line)",
                  background: "var(--brand-softer)",
                }}
              >
                +234
              </span>
              <input
                id="p-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field w-full px-3.5 py-2.5 rounded-r-lg text-sm border-l-0"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            >
              {profileSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-1.5">Change password</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Use at least 8 characters, with a number and a symbol.
        </p>
        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          <div>
            <label
              htmlFor="current_password"
              className="text-sm font-medium block mb-1.5"
            >
              Current password
            </label>
            <div className="relative">
              <input
                id="current_password"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? (
                  <EyeOff
                    className="w-4 h-4"
                    style={{ color: "var(--muted)" }}
                  />
                ) : (
                  <Eye className="w-4 h-4" style={{ color: "var(--muted)" }} />
                )}
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new_password"
                className="text-sm font-medium block mb-1.5"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? (
                    <EyeOff
                      className="w-4 h-4"
                      style={{ color: "var(--muted)" }}
                    />
                  ) : (
                    <Eye
                      className="w-4 h-4"
                      style={{ color: "var(--muted)" }}
                    />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium block mb-1.5"
              >
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff
                      className="w-4 h-4"
                      style={{ color: "var(--muted)" }}
                    />
                  ) : (
                    <Eye
                      className="w-4 h-4"
                      style={{ color: "var(--muted)" }}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            >
              {passwordSaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>

      <div className="danger-card rounded-2xl p-6">
        <h3
          className="font-semibold text-lg mb-1.5"
          style={{ color: "var(--danger)" }}
        >
          Deactivate business
        </h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          This pauses your business. Your data isn't deleted, and you can
          reactivate by contacting support.
        </p>
        <button
          type="button"
          onClick={() => setDeactivateModalOpen(true)}
          disabled={!isBusinessActive}
          className="px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: "var(--danger-soft)",
            color: "var(--danger)",
            opacity: isBusinessActive ? 1 : 0.5,
            cursor: isBusinessActive ? "pointer" : "not-allowed",
          }}
        >
          {isBusinessActive
            ? "Deactivate my business"
            : "Business already deactivated"}
        </button>
      </div>

      <ConfirmModal
        open={deactivateModalOpen}
        title="Deactivate business"
        description="Are you sure you want to deactivate this business? It will be paused until you contact support to reactivate it."
        confirmLabel="Deactivate business"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateModalOpen(false)}
        isLoading={isDeactivating}
      />
    </>
  );
}
