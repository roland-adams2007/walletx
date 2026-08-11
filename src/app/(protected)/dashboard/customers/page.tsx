"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  X,
  Copy,
  Check,
  ChevronRight,
  SearchX,
  Loader2,
} from "lucide-react";
import { useCustomerStore, useBusinessStore } from "@/app/stores/store";
import { useAlert } from "../../../lib/alert-context";
import "./customer.css";
import Link from "next/link";

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNaira(amount: number) {
  return (
    "₦" +
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function splitName(name: string | null | undefined) {
  if (!name || typeof name !== "string") {
    return { firstname: "", lastname: "" };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { firstname: "", lastname: "" };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  const firstname = parts[0] ?? "";
  const lastname = parts.slice(1).join(" ");

  return { firstname, lastname };
}

function isEmailLike(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function stripPhonePrefix(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/^\+?234/, "");
}

function displayPhone(phone?: string | null) {
  const stripped = stripPhonePrefix(phone);
  return stripped ? `+234 ${stripped}` : "";
}

function Switch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{
        background: checked ? "var(--danger)" : "var(--line)",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }}
      />
    </button>
  );
}

export default function CustomersPage() {
  const { showAlert } = useAlert();
  const { selectedBusinessId } = useBusinessStore();
  const {
    customers,
    meta,
    isLoading,
    selectedCustomer,
    isLoadingDetails,
    isCreating,
    isUpdating,
    isTogglingBlacklist,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    toggleBlacklist,
    clearSelectedCustomer,
  } = useCustomerStore();

  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editFirstname, setEditFirstname] = useState("");
  const [editLastname, setEditLastname] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [addFirstname, setAddFirstname] = useState("");
  const [addLastname, setAddLastname] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedFromUrlRef = useRef(false);

  useEffect(() => {
    if (!selectedBusinessId) return;
    fetchCustomers(1, "", selectedBusinessId);
  }, [selectedBusinessId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = search.trim();

    if (trimmed !== "" && !isEmailLike(trimmed)) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        await fetchCustomers(1, search, selectedBusinessId);
      } finally {
        setIsSearching(false);
      }
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, selectedBusinessId]);

  useEffect(() => {
    if (selectedCustomer && selectedCustomer.cus_id === activeCustomerId) {
      const { firstname, lastname } = splitName(selectedCustomer.name);
      setEditFirstname(firstname);
      setEditLastname(lastname);
      setEditPhone(stripPhonePrefix(selectedCustomer.phone));
    }
  }, [selectedCustomer, activeCustomerId]);

  useEffect(() => {
    if (openedFromUrlRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customer");
    if (customerId) {
      openedFromUrlRef.current = true;
      openPanel(customerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openPanel(customerId: string) {
    setActiveCustomerId(customerId);
    setCopied(false);
    setPanelOpen(true);
    fetchCustomer(customerId);
  }

  function closePanel() {
    setPanelOpen(false);
    setActiveCustomerId(null);
    clearSelectedCustomer();

    const params = new URLSearchParams(window.location.search);
    if (params.has("customer")) {
      params.delete("customer");
      const queryString = params.toString();
      const newUrl = queryString
        ? `/dashboard/customers?${queryString}`
        : "/dashboard/customers";
      window.history.replaceState(null, "", newUrl);
    }
  }

  function goToPage(page: number) {
    fetchCustomers(page, search, selectedBusinessId);
  }

  async function handleSaveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCustomerId) return;

    const result = await updateCustomer(activeCustomerId, {
      firstname: editFirstname.trim(),
      lastname: editLastname.trim(),
      phone: `+234${editPhone.trim()}`,
    });

    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Customer updated" : "Failed to update customer"),
    );

    if (result.success) {
      closePanel();
    }
  }

  async function handleToggleBlacklist() {
    if (!activeCustomerId || !selectedCustomer) return;

    const result = await toggleBlacklist(
      activeCustomerId,
      !selectedCustomer.is_blacklist,
    );

    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success
          ? "Blacklist status updated"
          : "Failed to update blacklist status"),
    );
  }

  async function handleCopyEmail() {
    if (!selectedCustomer) return;
    try {
      await navigator.clipboard.writeText(selectedCustomer.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  function openAddModal() {
    setAddFirstname("");
    setAddLastname("");
    setAddEmail("");
    setAddPhone("");
    setAddModalOpen(true);
  }

  function closeAddModal() {
    setAddModalOpen(false);
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBusinessId) {
      showAlert("error", "No business selected");
      return;
    }

    const result = await createCustomer({
      business_id: selectedBusinessId,
      first_name: addFirstname.trim(),
      last_name: addLastname.trim(),
      phone: `+234${addPhone.trim()}`,
      email: addEmail.trim(),
    });

    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Customer added" : "Failed to add customer"),
    );

    if (result.success) {
      closeAddModal();
    }
  }

  const recentTransactions =
    selectedCustomer?.transactions.recent_transactions ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="relative w-full sm:w-80">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted)" }}
          />
          <input
            type="text"
            placeholder="Search by email"
            className="input-field w-full pl-10 pr-9 py-2.5 rounded-lg text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isSearching && (
            <Loader2
              className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: "var(--muted)" }}
            />
          )}
        </div>
        <button
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
          onClick={openAddModal}
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="customers-table w-full">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Customer Email</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Added On</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8"
                    style={{ color: "var(--muted)" }}
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.cus_id} onClick={() => openPanel(c.cus_id)}>
                    <td>
                      <span
                        className="status-dot"
                        style={
                          c.is_blacklist
                            ? { background: "var(--danger)" }
                            : undefined
                        }
                      ></span>
                    </td>
                    <td>{c.email}</td>
                    <td style={c.name ? {} : { color: "var(--muted)" }}>
                      {c.name || "No Name"}
                    </td>
                    <td style={c.phone ? {} : { color: "var(--muted)" }}>
                      {displayPhone(c.phone) || "No Phone Number"}
                    </td>
                    <td>{formatDate(c.date_added)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && customers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <SearchX className="w-8 h-8" style={{ color: "var(--muted)" }} />
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Try a different email search
            </p>
          </div>
        )}
        {meta && meta.last_page > 1 && (
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Page {meta.current_page} of {meta.last_page} ({meta.total}{" "}
              customers)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.current_page <= 1}
                onClick={() => goToPage(meta.current_page - 1)}
                className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
                style={{ opacity: meta.current_page <= 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => goToPage(meta.current_page + 1)}
                className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  opacity: meta.current_page >= meta.last_page ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`overlay fixed inset-0 ${panelOpen ? "show" : ""}`}
        onClick={closePanel}
      ></div>

      <aside
        className={`side-panel fixed top-0 right-0 h-full overflow-y-auto ${panelOpen ? "open" : ""}`}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <h3 className="font-semibold text-lg">Customer details</h3>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ border: "1px solid var(--line)" }}
            aria-label="Close"
            onClick={closePanel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoadingDetails || !selectedCustomer ? (
          <div className="px-6 py-6">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Loading customer...
            </p>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-6">
            <div className="card rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Blacklist customer</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {selectedCustomer.is_blacklist
                    ? "This customer is currently blacklisted"
                    : "This customer is in good standing"}
                </p>
              </div>
              <Switch
                checked={selectedCustomer.is_blacklist}
                disabled={isTogglingBlacklist}
                onChange={handleToggleBlacklist}
              />
            </div>

            <form className="space-y-4" onSubmit={handleSaveCustomer}>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Full name
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                    placeholder="First name"
                    value={editFirstname}
                    onChange={(e) => setEditFirstname(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                    placeholder="Last name"
                    value={editLastname}
                    onChange={(e) => setEditLastname(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Email address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    readOnly
                    className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                    value={selectedCustomer.email}
                  />
                  <button
                    type="button"
                    className="copy-btn w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ border: "1px solid var(--line)" }}
                    aria-label="Copy email"
                    onClick={handleCopyEmail}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
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
                    type="tel"
                    className="input-field w-full px-3.5 py-2.5 rounded-r-lg text-sm border-l-0"
                    placeholder="8012345678"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white"
              >
                {isUpdating ? "Saving..." : "Save changes"}
              </button>
            </form>

            <div className="grid grid-cols-2 gap-3">
              <div className="card rounded-xl p-4">
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Successful / Total
                </p>
                <p className="font-mono text-lg font-semibold">
                  {selectedCustomer.transactions.successful_transactions} /{" "}
                  {selectedCustomer.transactions.total_transactions}
                </p>
              </div>
              <div className="card rounded-xl p-4">
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Total spent
                </p>
                <p className="font-mono text-lg font-semibold">
                  {formatNaira(selectedCustomer.transactions.total_spent)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Recent transactions</h4>
              </div>
              <div className="space-y-2">
                {recentTransactions.length === 0 ? (
                  <p
                    className="text-sm py-6 text-center"
                    style={{ color: "var(--muted)" }}
                  >
                    No transactions yet
                  </p>
                ) : (
                  recentTransactions.slice(0, 5).map((t, i) => (
                    <div
                      key={i}
                      className="tx-row flex items-center justify-between px-3.5 py-2.5 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium font-mono">
                          {formatNaira(t.amount)}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted)" }}
                        >
                          {t.channel}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {formatDate(t.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <Link
                className="btn-secondary w-full mt-3 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                href={`/dashboard/transactions?customer=${encodeURIComponent(activeCustomerId ?? "")}`}
              >
                View all transactions
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </aside>

      <div
        className={`modal-overlay fixed inset-0 flex items-center justify-center px-4 ${addModalOpen ? "show" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAddModal();
        }}
      >
        <div className="modal rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-lg">Add customer</h3>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: "1px solid var(--line)" }}
              aria-label="Close"
              onClick={closeAddModal}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleAddCustomer}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                  placeholder="Ada"
                  value={addFirstname}
                  onChange={(e) => setAddFirstname(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                  placeholder="Lovelace"
                  value={addLastname}
                  onChange={(e) => setAddLastname(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                placeholder="ada@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
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
                  type="tel"
                  required
                  className="input-field w-full px-3.5 py-2.5 rounded-r-lg text-sm border-l-0"
                  placeholder="8012345678"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary flex-1 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
              >
                {isCreating ? "Adding..." : "Add customer"}
              </button>
              <button
                type="button"
                onClick={closeAddModal}
                disabled={isCreating}
                className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
