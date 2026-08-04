"use client";

import { useEffect, useRef, useState } from "react";
<<<<<<< HEAD
import { Building2, ChevronDown, Clock } from "lucide-react";

const banks = [
  { code: "044", name: "Access Bank" },
  { code: "058", name: "GTBank" },
  { code: "057", name: "Zenith Bank" },
  { code: "033", name: "United Bank for Africa" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "999992", name: "Opay" },
];

export default function AccountPage() {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [bizType, setBizType] = useState<"individual" | "registered">("individual");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<{ code: string; name: string } | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredBanks = banks.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
=======
import {
  Building2,
  ChevronDown,
  X,
  Loader2,
  BadgeCheck,
  Clock,
} from "lucide-react";
import {
  useBusinessStore,
  useUploadStore,
  useBankStore,
} from "@/app/stores/store";
import { useAlert } from "../../../../lib/alert-context";

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
            className="btn-primary px-4 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? "Upgrading..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { showAlert } = useAlert();

  const {
    selectedBusinessId,
    businessDetails,
    isLoadingDetails,
    isUpdatingDetails,
    isUpgrading,
    isUpdatingSettlementBank,
    fetchBusinessDetails,
    updateBusinessDetails,
    upgradeToRegistered,
    updateSettlementBank,
  } = useBusinessStore();
  const { uploadFile, isUploading } = useUploadStore();
  const {
    banks,
    fetchBanks,
    verifyBankAccount,
    isVerifying,
    verifiedAccount,
    clearVerifiedAccount,
  } = useBankStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("Retail & e-commerce");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<{
    bank_code: string;
    name: string;
  } | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  useEffect(() => {
    if (selectedBusinessId) fetchBusinessDetails(selectedBusinessId);
  }, [selectedBusinessId, fetchBusinessDetails]);

  useEffect(() => {
    if (!businessDetails) return;
    setName(businessDetails.name ?? "");
    setEmail(businessDetails.email ?? "");
    setPhone(businessDetails.phone ?? "");
    setIndustry(businessDetails.industry ?? "Retail & e-commerce");
    setLogoPreview(businessDetails.logo ?? null);

    if (businessDetails.settlement_bank_code) {
      setSelectedBank({
        bank_code: businessDetails.settlement_bank_code,
        name: "",
      });
      setAccountNumber(businessDetails.settlement_account_number ?? "");
    }
  }, [businessDetails]);

  useEffect(() => {
    if (!selectedBank?.bank_code || !banks.length) return;
    const match = banks.find((b) => b.bank_code === selectedBank.bank_code);
    if (match && match.name !== selectedBank.name) {
      setSelectedBank({ bank_code: match.bank_code, name: match.name });
    }
  }, [banks, selectedBank]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
>>>>>>> temp-main
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

<<<<<<< HEAD
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleVerify() {
    if (!/^\d{10}$/.test(accountNumber)) {
      setResolvedName("");
      return;
    }
    setResolving(true);
    setTimeout(() => {
      setResolvedName("ORIMI GOODS LIMITED");
      setResolving(false);
    }, 700);
  }

  return (
    <>
      <div className="card rounded-2xl p-5 flex items-center gap-2.5">
        <span className="pill pill-pending">
          <Clock className="w-3 h-3" />
          KYC pending
        </span>
      </div>

=======
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedBusinessId) return;

    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const uploadResult = await uploadFile(file);
    if (!uploadResult.success || !uploadResult.upload) {
      showAlert("error", uploadResult.message ?? "Failed to upload logo");
      setLogoPreview(businessDetails?.logo ?? null);
      e.target.value = "";
      return;
    }

    const attachResult = await updateBusinessDetails({
      alt_id: selectedBusinessId,
      logo: uploadResult.upload.id,
    });

    if (!attachResult.success) {
      showAlert("error", attachResult.message ?? "Failed to attach logo");
      setLogoPreview(businessDetails?.logo ?? null);
    }

    e.target.value = "";
  }

  function handleRemoveLogo() {
    setLogoPreview(null);
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBusinessId) return;

    const result = await updateBusinessDetails({
      alt_id: selectedBusinessId,
      name,
      email: email || undefined,
      phone: phone || undefined,
      industry: industry || undefined,
    });

    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success
          ? "Business details updated"
          : "Failed to update business details"),
    );
  }

  async function handleConfirmUpgrade() {
    if (!selectedBusinessId) return;
    const result = await upgradeToRegistered(selectedBusinessId);
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Business upgraded" : "Failed to upgrade business"),
    );
    if (result.success) {
      setUpgradeModalOpen(false);
    }
  }

  async function handleVerify() {
    clearVerifiedAccount();

    if (!selectedBank) {
      showAlert("error", "Select a bank first");
      return;
    }
    if (!/^\d{10}$/.test(accountNumber)) {
      showAlert("error", "Enter a valid 10-digit account number");
      return;
    }

    const result = await verifyBankAccount({
      account_number: accountNumber,
      bank_code: selectedBank.bank_code,
    });

    if (!result.success) {
      showAlert("error", result.message ?? "Failed to verify bank account");
    }
  }

  async function handleSavePayout(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBusinessId || !selectedBank || !verifiedAccount) {
      showAlert("error", "Verify the account before saving");
      return;
    }

    const result = await updateSettlementBank({
      alt_id: selectedBusinessId,
      settlement_bank_code: selectedBank.bank_code,
      settlement_account_number: verifiedAccount.account_number,
      settlement_account_name: verifiedAccount.account_name,
    });

    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success
          ? "Payout account saved"
          : "Failed to save payout account"),
    );
  }

  if (isLoadingDetails && !businessDetails) {
    return (
      <div className="text-sm" style={{ color: "var(--muted)" }}>
        Loading business details...
      </div>
    );
  }

  const isRegistered = businessDetails?.business_type === "registered";
  const isVerified = businessDetails?.kyc_status === "verified";
  const displayedAccountName =
    verifiedAccount?.account_name ??
    businessDetails?.settlement_account_name ??
    "";

  return (
    <>
>>>>>>> temp-main
      <div className="card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-5">Business details</h3>

        <div className="flex items-center gap-4 mb-6">
          <div
<<<<<<< HEAD
            className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: "var(--brand-soft)" }}
          >
            {logoSrc ? (
              <img src={logoSrc} className="w-full h-full object-cover" alt="Business logo" />
            ) : (
              <Building2 className="w-6 h-6" style={{ color: "var(--brand)" }} />
=======
            className="w-16 h-16 rounded-xl relative flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: "var(--brand-soft)" }}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                className="w-full h-full object-cover"
                alt="Business logo"
              />
            ) : (
              <Building2
                className="w-6 h-6"
                style={{ color: "var(--brand)" }}
              />
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
            {logoPreview && !isUploading && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-black/60 text-white"
                aria-label="Remove logo"
              >
                <X className="w-3 h-3" />
              </button>
>>>>>>> temp-main
            )}
          </div>
          <div>
            <label
              htmlFor="logo-upload"
<<<<<<< HEAD
              className="btn-secondary inline-block px-3.5 py-2 rounded-lg text-sm font-medium"
            >
              Upload logo
            </label>
            <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
=======
              className="btn-secondary inline-block px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer"
            >
              Upload logo
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
              disabled={isUploading}
            />
>>>>>>> temp-main
            <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
              PNG or JPG, up to 2MB.
            </p>
          </div>
        </div>

<<<<<<< HEAD
        <form className="space-y-4">
          <div>
            <label htmlFor="biz-name" className="text-sm font-medium block mb-1.5">
=======
        <form className="space-y-4" onSubmit={handleSaveDetails}>
          <div>
            <label
              htmlFor="biz-name"
              className="text-sm font-medium block mb-1.5"
            >
>>>>>>> temp-main
              Business name
            </label>
            <input
              id="biz-name"
              type="text"
<<<<<<< HEAD
              defaultValue="Orimi Goods"
=======
              value={name}
              onChange={(e) => setName(e.target.value)}
>>>>>>> temp-main
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
<<<<<<< HEAD
              <label htmlFor="biz-email" className="text-sm font-medium block mb-1.5">
=======
              <label
                htmlFor="biz-email"
                className="text-sm font-medium block mb-1.5"
              >
>>>>>>> temp-main
                Business email
              </label>
              <input
                id="biz-email"
                type="email"
<<<<<<< HEAD
                defaultValue="hello@orimigoods.com"
=======
                value={email}
                onChange={(e) => setEmail(e.target.value)}
>>>>>>> temp-main
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
              />
            </div>
            <div>
<<<<<<< HEAD
              <label htmlFor="biz-phone" className="text-sm font-medium block mb-1.5">
=======
              <label
                htmlFor="biz-phone"
                className="text-sm font-medium block mb-1.5"
              >
>>>>>>> temp-main
                Business phone
              </label>
              <input
                id="biz-phone"
                type="tel"
<<<<<<< HEAD
                defaultValue="+2348012345678"
=======
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
>>>>>>> temp-main
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
<<<<<<< HEAD
            <label className="text-sm font-medium block mb-1.5">Business type</label>
            <div className="segment rounded-xl text-sm font-medium">
              <input
                type="radio"
                name="biz-type"
                id="biz-type-individual"
                checked={bizType === "individual"}
                onChange={() => setBizType("individual")}
              />
              <label htmlFor="biz-type-individual">Individual</label>
              <input
                type="radio"
                name="biz-type"
                id="biz-type-registered"
                checked={bizType === "registered"}
                onChange={() => setBizType("registered")}
              />
              <label htmlFor="biz-type-registered">Registered business</label>
            </div>
          </div>

          <div>
            <label htmlFor="biz-industry" className="text-sm font-medium block mb-1.5">
=======
            <label
              htmlFor="biz-industry"
              className="text-sm font-medium block mb-1.5"
            >
>>>>>>> temp-main
              Industry
            </label>
            <select
              id="biz-industry"
<<<<<<< HEAD
              defaultValue="Retail & e-commerce"
=======
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
>>>>>>> temp-main
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
            >
              <option>Retail & e-commerce</option>
              <option>Fintech & financial services</option>
              <option>Logistics & transportation</option>
              <option>Hospitality & food</option>
              <option>Education</option>
              <option>Healthcare</option>
              <option>Other</option>
            </select>
          </div>

          <div className="pt-2">
<<<<<<< HEAD
            <button type="submit" className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white">
              Save changes
            </button>
          </div>
        </form>
=======
            <button
              type="submit"
              disabled={isUpdatingDetails}
              className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            >
              {isUpdatingDetails ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <label className="text-sm font-medium block mb-1.5">
            Business type
          </label>
          {isRegistered ? (
            <div className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm flex items-center justify-between">
              <span>Registered business</span>
              <BadgeCheck
                className="w-4 h-4"
                style={{ color: "var(--brand)" }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="input-field flex-1 px-3.5 py-2.5 rounded-lg text-sm">
                Individual
              </div>
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                disabled={isUpgrading}
                className="btn-secondary px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60"
              >
                Upgrade to registered business
              </button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div
              className="rounded-lg p-4"
              style={{ background: "var(--brand-soft)" }}
            >
              <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                KYC status
              </p>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={
                  isVerified
                    ? { background: "var(--brand)", color: "#fff" }
                    : { background: "var(--amber-soft)", color: "var(--amber)" }
                }
              >
                {isVerified ? (
                  <BadgeCheck className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ background: "var(--brand-soft)" }}
            >
              <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                Max balance
              </p>
              <p className="text-sm font-semibold">
                {businessDetails?.max_balance == null
                  ? "No limit"
                  : `₦${businessDetails.max_balance.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
>>>>>>> temp-main
      </div>

      <div className="card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-1.5">Payout account</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Settlements are sent to this account.
        </p>
<<<<<<< HEAD
        <form className="space-y-4">
=======
        <form className="space-y-4" onSubmit={handleSavePayout}>
>>>>>>> temp-main
          <div className="relative" ref={wrapperRef}>
            <label className="text-sm font-medium block mb-1.5">Bank</label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm flex items-center justify-between text-left"
            >
<<<<<<< HEAD
              <span style={{ color: selectedBank ? "var(--text)" : "var(--muted)" }}>
=======
              <span
                style={{ color: selectedBank ? "var(--text)" : "var(--muted)" }}
              >
>>>>>>> temp-main
                {selectedBank ? selectedBank.name : "Select your bank"}
              </span>
              <ChevronDown
                className="w-4 h-4 shrink-0"
                style={{
                  color: "var(--muted)",
                  transform: dropdownOpen ? "rotate(180deg)" : undefined,
                  transition: "transform 0.15s ease",
                }}
              />
            </button>

            {dropdownOpen && (
              <div className="custom-dropdown absolute left-0 top-[calc(100%+6px)] w-full rounded-lg overflow-hidden z-20">
<<<<<<< HEAD
                <div className="p-2" style={{ borderBottom: "1px solid var(--line)" }}>
=======
                <div
                  className="p-2"
                  style={{ borderBottom: "1px solid var(--line)" }}
                >
>>>>>>> temp-main
                  <input
                    type="text"
                    placeholder="Search banks"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field w-full px-3 py-2 rounded-md text-sm"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredBanks.map((bank) => (
                    <button
<<<<<<< HEAD
                      key={bank.code}
                      type="button"
                      onClick={() => {
                        setSelectedBank(bank);
                        setDropdownOpen(false);
                      }}
                      className={`custom-option w-full px-3.5 py-2.5 text-sm text-left ${
                        selectedBank?.code === bank.code ? "selected" : ""
=======
                      key={bank.bank_code}
                      type="button"
                      onClick={() => {
                        setSelectedBank({
                          bank_code: bank.bank_code,
                          name: bank.name,
                        });
                        setDropdownOpen(false);
                        clearVerifiedAccount();
                      }}
                      className={`custom-option w-full px-3.5 py-2.5 text-sm text-left ${
                        selectedBank?.bank_code === bank.bank_code
                          ? "selected"
                          : ""
>>>>>>> temp-main
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
                {filteredBanks.length === 0 && (
<<<<<<< HEAD
                  <p className="px-3.5 py-3 text-sm" style={{ color: "var(--muted)" }}>
=======
                  <p
                    className="px-3.5 py-3 text-sm"
                    style={{ color: "var(--muted)" }}
                  >
>>>>>>> temp-main
                    No banks match your search.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
<<<<<<< HEAD
              <label htmlFor="account_number" className="text-sm font-medium block mb-1.5">
=======
              <label
                htmlFor="account_number"
                className="text-sm font-medium block mb-1.5"
              >
>>>>>>> temp-main
                Account number
              </label>
              <input
                id="account_number"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                value={accountNumber}
<<<<<<< HEAD
                onChange={(e) => setAccountNumber(e.target.value)}
=======
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  clearVerifiedAccount();
                }}
>>>>>>> temp-main
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleVerify}
<<<<<<< HEAD
              className="btn-secondary px-4 py-2.5 rounded-lg text-sm font-medium h-[42px]"
            >
              Verify account
            </button>
          </div>
          <div>
            <label htmlFor="resolved_account_name" className="text-sm font-medium block mb-1.5">
=======
              disabled={isVerifying}
              className="btn-secondary px-4 py-2.5 rounded-lg text-sm font-medium h-[42px] disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Verify account"}
            </button>
          </div>
          <div>
            <label
              htmlFor="resolved_account_name"
              className="text-sm font-medium block mb-1.5"
            >
>>>>>>> temp-main
              Account name
            </label>
            <input
              id="resolved_account_name"
              type="text"
              readOnly
<<<<<<< HEAD
              value={resolving ? "Resolving..." : resolvedName}
=======
              value={isVerifying ? "Resolving..." : displayedAccountName}
>>>>>>> temp-main
              placeholder="Verify account to see the name"
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
            />
          </div>
          <div className="pt-2">
<<<<<<< HEAD
            <button type="submit" className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white">
              Save payout account
=======
            <button
              type="submit"
              disabled={isUpdatingSettlementBank || !verifiedAccount}
              className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            >
              {isUpdatingSettlementBank ? "Saving..." : "Save payout account"}
>>>>>>> temp-main
            </button>
          </div>
        </form>
      </div>
<<<<<<< HEAD
    </>
  );
}
=======

      <ConfirmModal
        open={upgradeModalOpen}
        title="Upgrade to registered business"
        description="This upgrades your business to a registered business. Your balance limit will be removed and KYC will be marked as verified. This cannot be undone."
        confirmLabel="Upgrade business"
        onConfirm={handleConfirmUpgrade}
        onCancel={() => setUpgradeModalOpen(false)}
        isLoading={isUpgrading}
      />
    </>
  );
}
>>>>>>> temp-main
