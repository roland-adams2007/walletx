"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Search,
  Check,
  X,
  Landmark,
  Hash,
  Building2,
  ArrowRight,
} from "lucide-react";
import "./transfer.css";
import api from "@/app/api/axios";
import { useBankStore, useBusinessStore } from "../../../stores/store";

type TransferTab = "bank" | "business";

function formatAmount(amount: number) {
  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function generateReference(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
function BankSelect({
  banks,
  value,
  onChange,
  disabled,
}: {
  banks: { id: number; bank_code: string; name: string }[];
  value: { id: number; bank_code: string; name: string } | null;
  onChange: (bank: { id: number; bank_code: string; name: string }) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return banks;
    const q = query.toLowerCase();
    return banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [banks, query]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        disabled={disabled}
        className={`bank-trigger w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-sm ${
          open ? "open" : ""
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className="flex items-center gap-2.5">
          <span className="field-icon-circle">
            <Landmark className="w-4 h-4" />
          </span>
          <span className={value ? "font-medium" : "text-muted"}>
            {value ? value.name : "Select bank"}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="bank-select-dropdown absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-20">
          <div className="bank-search-wrap flex items-center gap-2 px-3.5 py-2.5">
            <Search className="w-3.5 h-3.5 text-muted shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bank"
              className="bank-search-input w-full text-sm"
            />
          </div>
          <div className="bank-select-list">
            {filtered.length === 0 && (
              <div className="text-sm text-muted px-3.5 py-4 text-center">
                No banks found
              </div>
            )}
            {filtered.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => {
                  onChange(bank);
                  setOpen(false);
                  setQuery("");
                }}
                className={`bank-option w-full flex items-center justify-between text-left text-sm px-3.5 py-2.5 ${
                  value?.id === bank.id ? "active" : ""
                }`}
              >
                {bank.name}
                {value?.id === bank.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBox({
  state,
  loadingText,
  errorText,
  successText,
  emptyText,
}: {
  state: "idle" | "loading" | "error" | "success";
  loadingText: string;
  errorText: string;
  successText: string;
  emptyText: string;
}) {
  return (
    <div
      className={`status-box rounded-xl px-3.5 py-3 flex items-center gap-3 status-${state}`}
    >
      <span className="status-icon-circle shrink-0">
        {state === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
        {state === "error" && <X className="w-4 h-4" />}
        {state === "success" && <Check className="w-4 h-4" />}
        {state === "idle" && <Building2 className="w-4 h-4" />}
      </span>
      <span className="text-sm">
        {state === "loading" && loadingText}
        {state === "error" && errorText}
        {state === "success" && successText}
        {state === "idle" && <span className="text-muted">{emptyText}</span>}
      </span>
    </div>
  );
}

function BankTransferForm({ businessId }: { businessId: string | null }) {
  const banks = useBankStore((s) => s.banks);
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const verifyBankAccount = useBankStore((s) => s.verifyBankAccount);

  const [bank, setBank] = useState<{
    id: number;
    bank_code: string;
    name: string;
  } | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  useEffect(() => {
    setAccountName("");
    setVerifyError("");
  }, [bank, accountNumber]);

  async function handleVerify() {
    if (!bank || accountNumber.length < 10) return;
    setIsVerifying(true);
    setVerifyError("");
    const res = await verifyBankAccount({
      account_number: accountNumber,
      bank_code: bank.bank_code,
    });
    setIsVerifying(false);
    if (res.success && res.account) {
      setAccountName(res.account.account_name);
    } else {
      setVerifyError(res.message ?? "Could not verify account");
    }
  }

  async function handleTransfer() {
    if (!bank || !accountName || !amount || !businessId) return;
    setIsSending(true);
    setSendError("");
    try {
      const res = await api.post("/transfer/bank", {
        business_id: businessId,
        reference: generateReference("TRF"),
        bank_code: bank.bank_code,
        account_number: accountNumber,
        account_name: accountName,
        amount: Number(amount),
      });
      if (res.data.success) {
        setSuccess(true);
        setBank(null);
        setAccountNumber("");
        setAmount("");
        setAccountName("");
      } else {
        setSendError(res.data.message ?? "Transfer failed");
      }
    } catch (err: any) {
      setSendError(err.response?.data?.message ?? "Transfer failed");
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (!accountNumber || accountNumber.length !== 10 || !bank) return;
    handleVerify();
  }, [accountNumber, bank]);

  if (success) {
    return <SuccessState onDone={() => setSuccess(false)} />;
  }

  const canTransfer =
    !!accountName && !!amount && Number(amount) > 0 && !isSending;

  const status: "idle" | "loading" | "error" | "success" = isVerifying
    ? "loading"
    : verifyError
      ? "error"
      : accountName
        ? "success"
        : "idle";

  return (
    <div className="space-y-5">
      <div>
        <label className="field-label block mb-2">Bank</label>
        <BankSelect
          banks={banks}
          value={bank}
          onChange={setBank}
          disabled={isVerifying}
        />
      </div>

      <div>
        <label className="field-label block mb-2">Account number</label>
        <div className="field-input-wrap">
          <Hash className="field-inline-icon w-4 h-4" />
          <input
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            disabled={isVerifying}
            placeholder="0123456789"
            className={`field-input w-full text-sm ${
              isVerifying ? "opacity-60 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </div>

      <div>
        <label className="field-label block mb-2">Amount</label>
        <div className="field-input-wrap">
          <span className="field-prefix">NGN</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="field-input field-input-amount w-full text-sm font-mono"
          />
        </div>
      </div>

      <StatusBox
        state={status}
        loadingText="Verifying account"
        errorText={verifyError}
        successText={accountName}
        emptyText="Account name will appear here"
      />

      {sendError && <p className="text-sm text-danger">{sendError}</p>}

      <button
        onClick={handleTransfer}
        disabled={!canTransfer}
        className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium"
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
        {isSending
          ? "Sending"
          : `Transfer ${amount ? formatAmount(Number(amount)) : ""}`}
      </button>
    </div>
  );
}

function BusinessTransferForm({ businessId }: { businessId: string | null }) {
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setBusinessName("");
    setVerifyError("");
  }, [targetId]);

  async function handleVerify() {
    if (!targetId) return;
    setIsVerifying(true);
    setVerifyError("");
    try {
      const res = await api.get("/business/other", {
        params: { alt_id: targetId },
      });
      if (res.data.success) {
        setBusinessName(res.data.data.name);
      } else {
        setVerifyError(res.data.message ?? "Business not found");
      }
    } catch (err: any) {
      setVerifyError(err.response?.data?.message ?? "Business not found");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleTransfer() {
    if (!businessName || !amount || !businessId) return;
    setIsSending(true);
    setSendError("");
    try {
      const res = await api.post("/transfer/business", {
        business_id: businessId,
        target_alt_id: targetId,
        reference: generateReference("TRB"),
        amount: Number(amount),
      });
      if (res.data.success) {
        setSuccess(true);
        setTargetId("");
        setAmount("");
        setBusinessName("");
      } else {
        setSendError(res.data.message ?? "Transfer failed");
      }
    } catch (err: any) {
      setSendError(err.response?.data?.message ?? "Transfer failed");
    } finally {
      setIsSending(false);
    }
  }

  if (success) {
    return <SuccessState onDone={() => setSuccess(false)} />;
  }

  const canTransfer =
    !!businessName && !!amount && Number(amount) > 0 && !isSending;

  const status: "idle" | "loading" | "error" | "success" = isVerifying
    ? "loading"
    : verifyError
      ? "error"
      : businessName
        ? "success"
        : "idle";

  return (
    <div className="space-y-5">
      <div>
        <label className="field-label block mb-2">Business ID</label>
        <div className="flex gap-2">
          <div className="field-input-wrap flex-1">
            <Building2 className="field-inline-icon w-4 h-4" />
            <input
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={isVerifying}
              placeholder="BIZ_XXXXXXXX"
              className={`field-input w-full text-sm ${
                isVerifying ? "opacity-60 cursor-not-allowed" : ""
              }`}
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={!targetId || isVerifying}
            className="btn-secondary shrink-0 rounded-xl px-5 text-sm font-medium"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify"
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="field-label block mb-2">Amount</label>
        <div className="field-input-wrap">
          <span className="field-prefix">NGN</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="field-input field-input-amount w-full text-sm font-mono"
          />
        </div>
      </div>

      <StatusBox
        state={status}
        loadingText="Looking up business"
        errorText={verifyError}
        successText={businessName}
        emptyText="Business name will appear here"
      />

      {sendError && <p className="text-sm text-danger">{sendError}</p>}

      <button
        onClick={handleTransfer}
        disabled={!canTransfer}
        className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium"
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
        {isSending
          ? "Sending"
          : `Transfer ${amount ? formatAmount(Number(amount)) : ""}`}
      </button>
    </div>
  );
}

function SuccessState({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="success-check-circle rounded-full flex items-center justify-center mb-5">
        <Check className="w-7 h-7 text-white" />
      </div>
      <h3 className="font-semibold text-lg mb-1">Transfer successful</h3>
      <p className="text-sm text-muted mb-7">
        Your transfer has been processed
      </p>
      <button
        onClick={onDone}
        className="btn-secondary rounded-xl px-6 py-2.5 text-sm font-medium"
      >
        Make another transfer
      </button>
    </div>
  );
}

export default function TransferPage() {
  const selectedBusinessId = useBusinessStore((s) => s.selectedBusinessId);
  const [tab, setTab] = useState<TransferTab>("bank");

  return (
    <div className="max-w-xl mx-auto">
      <div className="card rounded-2xl p-5 sm:p-7">
        <div className="transfer-tabs flex gap-1 mb-7">
          <button
            onClick={() => setTab("bank")}
            className={`transfer-tab-btn flex-1 text-sm font-medium py-2.5 rounded-lg ${
              tab === "bank" ? "active" : ""
            }`}
          >
            Bank transfer
          </button>
          <button
            onClick={() => setTab("business")}
            className={`transfer-tab-btn flex-1 text-sm font-medium py-2.5 rounded-lg ${
              tab === "business" ? "active" : ""
            }`}
          >
            Business transfer
          </button>
        </div>

        {tab === "bank" ? (
          <BankTransferForm businessId={selectedBusinessId} />
        ) : (
          <BusinessTransferForm businessId={selectedBusinessId} />
        )}
      </div>
    </div>
  );
}
