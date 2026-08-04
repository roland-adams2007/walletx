"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useBusinessStore } from "@/app/stores/store";
import { useAlert } from "../../../../lib/alert-context";

export default function PreferencesPage() {
  const { showAlert } = useAlert();

  const {
    selectedBusinessId,
    businessDetails,
    isLoadingDetails,
    isUpdatingPreference,
    fetchBusinessDetails,
    updatePreference,
  } = useBusinessStore();

  const [savingField, setSavingField] = useState<
    | "send_receipt_to_business"
    | "send_receipt_to_customer"
    | "charge_fee_to_customer"
    | null
  >(null);

  useEffect(() => {
    if (selectedBusinessId) fetchBusinessDetails(selectedBusinessId);
  }, [selectedBusinessId, fetchBusinessDetails]);

  const preference = businessDetails?.preference;

  async function handleToggle(
    field:
      | "send_receipt_to_business"
      | "send_receipt_to_customer"
      | "charge_fee_to_customer",
    currentValue: boolean | undefined,
  ) {
    if (!selectedBusinessId) return;
    setSavingField(field);

    const result = await updatePreference({
      alt_id: selectedBusinessId,
      [field]: !currentValue,
    });

    setSavingField(null);
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Preference updated" : "Failed to update preference"),
    );
  }

  if (isLoadingDetails && !businessDetails) {
    return (
      <div className="text-sm" style={{ color: "var(--muted)" }}>
        Loading preferences...
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-6">
      <h3 className="font-semibold text-lg mb-1.5">Email notifications</h3>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
        Get an email every time money moves.
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Send receipt to customer</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Email the customer a receipt when they pay into your wallet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savingField === "send_receipt_to_customer" && (
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "var(--muted)" }}
              />
            )}
            <label className="switch">
              <input
                type="checkbox"
                checked={preference?.send_receipt_to_customer ?? false}
                disabled={isUpdatingPreference}
                onChange={() =>
                  handleToggle(
                    "send_receipt_to_customer",
                    preference?.send_receipt_to_customer,
                  )
                }
              />
              <span className="switch-track"></span>
            </label>
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-4 pt-4"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div>
            <p className="text-sm font-medium">Send receipt to business</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Email your business a receipt for transfers and payouts you send.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savingField === "send_receipt_to_business" && (
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "var(--muted)" }}
              />
            )}
            <label className="switch">
              <input
                type="checkbox"
                checked={preference?.send_receipt_to_business ?? false}
                disabled={isUpdatingPreference}
                onChange={() =>
                  handleToggle(
                    "send_receipt_to_business",
                    preference?.send_receipt_to_business,
                  )
                }
              />
              <span className="switch-track"></span>
            </label>
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-4 pt-4"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div>
            <p className="text-sm font-medium">
              Charge transaction fee to customer
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              When off, your business absorbs the transaction fee instead.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savingField === "charge_fee_to_customer" && (
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "var(--muted)" }}
              />
            )}
            <label className="switch">
              <input
                type="checkbox"
                checked={preference?.charge_fee_to_customer ?? false}
                disabled={isUpdatingPreference}
                onChange={() =>
                  handleToggle(
                    "charge_fee_to_customer",
                    preference?.charge_fee_to_customer,
                  )
                }
              />
              <span className="switch-track"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
