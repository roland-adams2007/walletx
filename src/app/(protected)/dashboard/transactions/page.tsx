"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  X,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  SearchX,
  Calendar,
  Loader2,
} from "lucide-react";
import "./transaction.css";
import { useTransactionStore, useBusinessStore } from "@/app/stores/store";

type DateRangeOption = "all" | "today" | "week" | "month" | "custom";

const dateOptions: { value: DateRangeOption; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

function isValidReference(value: string) {
  return /^[a-zA-Z0-9_-]{3,}$/.test(value.trim());
}

function formatNaira(amount: number) {
  return (
    "NGN " +
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function statusPillClass(status: string) {
  if (status === "success") return "pill-success";
  if (status === "failed") return "pill-failed";
  return "pill-pending";
}

function statusLabel(status: string) {
  if (status === "success") return "Successful";
  if (status === "failed") return "Failed";
  return "Pending";
}

function formatDateDisplay(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedBusinessId } = useBusinessStore();
  const {
    transactions,
    meta,
    isLoading,
    error,
    currentTransaction,
    isLoadingDetail,
    fetchTransactions,
    fetchTransactionByReference,
    setFilters,
    clearFilters,
    clearCurrentTransaction,
  } = useTransactionStore();

  // Local state for UI
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [amountMinInput, setAmountMinInput] = useState("");
  const [amountMaxInput, setAmountMaxInput] = useState("");
  const [customerInput, setCustomerInput] = useState("");
  const [typeInput, setTypeInput] = useState("all");
  const [channelInput, setChannelInput] = useState("all");
  const [statusInput, setStatusInput] = useState("all");

  const [appliedDateRange, setAppliedDateRange] =
    useState<DateRangeOption>("all");
  const [appliedCustomStart, setAppliedCustomStart] = useState("");
  const [appliedCustomEnd, setAppliedCustomEnd] = useState("");
  const [appliedAmountMin, setAppliedAmountMin] = useState("");
  const [appliedAmountMax, setAppliedAmountMax] = useState("");
  const [appliedCustomer, setAppliedCustomer] = useState("");
  const [appliedType, setAppliedType] = useState("all");
  const [appliedChannel, setAppliedChannel] = useState("all");
  const [appliedStatus, setAppliedStatus] = useState("all");

  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const [filterPanelStyle, setFilterPanelStyle] = useState<React.CSSProperties>(
    {},
  );
  const [datePanelStyle, setDatePanelStyle] = useState<React.CSSProperties>({});

  // Build filters from URL and local state
  const buildFilters = useCallback(() => {
    const filters: any = {};

    if (debouncedSearch) filters.reference = debouncedSearch;
    if (appliedCustomer) filters.customer = appliedCustomer;
    if (appliedAmountMin) filters.min_amount = Number(appliedAmountMin);
    if (appliedAmountMax) filters.max_amount = Number(appliedAmountMax);
    if (appliedType !== "all") filters.transaction_type = appliedType;
    if (appliedChannel !== "all") filters.channel = appliedChannel;
    if (appliedStatus !== "all") filters.status = appliedStatus;

    // Date filters
    const dateType = appliedDateRange;
    if (dateType === "custom" && appliedCustomStart && appliedCustomEnd) {
      filters.date_type = "custom";
      filters.start_date = appliedCustomStart;
      filters.end_date = appliedCustomEnd;
    } else if (dateType !== "all") {
      filters.date_type = dateType;
    }

    return filters;
  }, [
    debouncedSearch,
    appliedCustomer,
    appliedAmountMin,
    appliedAmountMax,
    appliedType,
    appliedChannel,
    appliedStatus,
    appliedDateRange,
    appliedCustomStart,
    appliedCustomEnd,
  ]);

  // Update URL with current filters (only if initialized)
  const updateUrlParams = useCallback(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    const currentFilters = buildFilters();

    // Add all non-empty filters to URL
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    // Add pagination
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `/dashboard/transactions?${queryString}`
      : "/dashboard/transactions";

    // Only replace if the URL is different
    const currentPath = window.location.pathname + window.location.search;
    if (newUrl !== currentPath) {
      router.replace(newUrl, { scroll: false });
    }
  }, [buildFilters, currentPage, router, isInitialized]);

  // Fetch transactions when filters change
  useEffect(() => {
    if (!selectedBusinessId || !isInitialized) return;

    const fetchData = async () => {
      const filterParams = buildFilters();
      await fetchTransactions(currentPage, selectedBusinessId, filterParams);
    };

    fetchData();
  }, [
    selectedBusinessId,
    currentPage,
    buildFilters,
    fetchTransactions,
    isInitialized,
  ]);

  // Initialize from URL params on mount
  useEffect(() => {
    const params = searchParams;

    // Set filters from URL
    let hasFilters = false;

    const reference = params.get("reference");
    if (reference) {
      setSearch(reference);
      setDebouncedSearch(reference);
      hasFilters = true;
    }

    const customer = params.get("customer");
    if (customer) {
      setCustomerInput(customer);
      setAppliedCustomer(customer);
      hasFilters = true;
    }

    const minAmount = params.get("min_amount");
    if (minAmount) {
      setAmountMinInput(minAmount);
      setAppliedAmountMin(minAmount);
      hasFilters = true;
    }

    const maxAmount = params.get("max_amount");
    if (maxAmount) {
      setAmountMaxInput(maxAmount);
      setAppliedAmountMax(maxAmount);
      hasFilters = true;
    }

    const type = params.get("transaction_type");
    if (type) {
      setTypeInput(type);
      setAppliedType(type);
      hasFilters = true;
    }

    const channel = params.get("channel");
    if (channel) {
      setChannelInput(channel);
      setAppliedChannel(channel);
      hasFilters = true;
    }

    const status = params.get("status");
    if (status) {
      setStatusInput(status);
      setAppliedStatus(status);
      hasFilters = true;
    }

    const dateType = params.get("date_type");
    if (dateType && dateType !== "all") {
      setDateRange(dateType as DateRangeOption);
      setAppliedDateRange(dateType as DateRangeOption);
      if (dateType === "custom") {
        const start = params.get("start_date");
        const end = params.get("end_date");
        if (start) {
          setCustomStart(start);
          setAppliedCustomStart(start);
        }
        if (end) {
          setCustomEnd(end);
          setAppliedCustomEnd(end);
        }
      }
      hasFilters = true;
    }

    const page = params.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }

    // Mark as initialized
    setIsInitialized(true);
    // Intentionally runs once on mount only. After init, local state is
    // the single source of truth and pushes changes to the URL (see
    // updateUrlParams below). Re-reading the URL on every change here
    // was what made Reset unable to clear "customer"/"cus_id": the URL
    // hadn't updated yet on the same tick, so this effect immediately
    // wrote the old customer value straight back into state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when filters change (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      updateUrlParams();
    }
  }, [
    debouncedSearch,
    appliedCustomer,
    appliedAmountMin,
    appliedAmountMax,
    appliedType,
    appliedChannel,
    appliedStatus,
    appliedDateRange,
    appliedCustomStart,
    appliedCustomEnd,
    currentPage,
    isInitialized,
    updateUrlParams,
  ]);

  // Handle reference search with debounce + validation
  useEffect(() => {
    if (!isInitialized) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = search.trim();

    if (trimmed !== "" && !isValidReference(trimmed)) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
      setIsSearching(false);
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, isInitialized]);

  // Clamp panel functions
  function clampPanelToViewport(
    btnRef: React.RefObject<HTMLElement | null>,
    panelRef: React.RefObject<HTMLElement | null>,
    setStyle: React.Dispatch<React.SetStateAction<React.CSSProperties>>,
  ) {
    const btn = btnRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;
    const margin = 16;
    const btnRect = btn.getBoundingClientRect();
    const panelWidth = panel.offsetWidth;
    const maxLeft = Math.max(margin, window.innerWidth - margin - panelWidth);
    const clampedLeft = Math.min(Math.max(btnRect.left, margin), maxLeft);
    setStyle({ left: clampedLeft - btnRect.left, right: "auto" });
  }

  useEffect(() => {
    if (!dateOpen) return;
    clampPanelToViewport(dateBtnRef, dateRef, setDatePanelStyle);
    const onResize = () =>
      clampPanelToViewport(dateBtnRef, dateRef, setDatePanelStyle);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [dateOpen]);

  useEffect(() => {
    if (!filterOpen) return;
    clampPanelToViewport(filterBtnRef, filterRef, setFilterPanelStyle);
    const onResize = () =>
      clampPanelToViewport(filterBtnRef, filterRef, setFilterPanelStyle);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [filterOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(e.target as Node) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
      if (
        dateRef.current &&
        !dateRef.current.contains(e.target as Node) &&
        dateBtnRef.current &&
        !dateBtnRef.current.contains(e.target as Node)
      ) {
        setDateOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function selectDateOption(option: DateRangeOption) {
    setDateRange(option);
    if (option !== "custom") {
      setAppliedDateRange(option);
      setAppliedCustomStart("");
      setAppliedCustomEnd("");
      setCurrentPage(1);
      setDateOpen(false);
    }
  }

  function applyCustomDate() {
    setAppliedDateRange("custom");
    setAppliedCustomStart(customStart);
    setAppliedCustomEnd(customEnd);
    setCurrentPage(1);
    setDateOpen(false);
  }

  function applyFilters() {
    setAppliedCustomer(customerInput);
    setAppliedAmountMin(amountMinInput);
    setAppliedAmountMax(amountMaxInput);
    setAppliedType(typeInput);
    setAppliedChannel(channelInput);
    setAppliedStatus(statusInput);
    setCurrentPage(1);
    setFilterOpen(false);
  }

  const activeFilterCount =
    (appliedAmountMin ? 1 : 0) +
    (appliedAmountMax ? 1 : 0) +
    (appliedCustomer ? 1 : 0) +
    (appliedType !== "all" ? 1 : 0) +
    (appliedChannel !== "all" ? 1 : 0) +
    (appliedStatus !== "all" ? 1 : 0);

  const activeDateLabel =
    dateOptions.find((d) => d.value === appliedDateRange)?.label ?? "All time";

  function resetFilters() {
    setAmountMinInput("");
    setAmountMaxInput("");
    setCustomerInput("");
    setTypeInput("all");
    setChannelInput("all");
    setStatusInput("all");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
    setSearch("");

    setAppliedAmountMin("");
    setAppliedAmountMax("");
    setAppliedCustomer("");
    setAppliedType("all");
    setAppliedChannel("all");
    setAppliedStatus("all");
    setAppliedDateRange("all");
    setAppliedCustomStart("");
    setAppliedCustomEnd("");
    setDebouncedSearch("");

    setCurrentPage(1);
    clearFilters();
  }

  function goToPage(page: number) {
    setCurrentPage(page);
  }

  async function copyReference(reference: string) {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  // Handle row click to show transaction details
  function handleRowClick(reference: string) {
    fetchTransactionByReference(reference);
  }

  // Close detail panel
  function closePanel() {
    clearCurrentTransaction();
    setCopied(false);
  }

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search reference"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-10 pr-9 py-2.5 rounded-lg text-sm"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-muted" />
            )}
          </div>

          <div className="relative">
            <button
              ref={dateBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                setDateOpen((v) => !v);
              }}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              {activeDateLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div
              ref={dateRef}
              onClick={(e) => e.stopPropagation()}
              className={`date-panel absolute top-full mt-2 rounded-2xl p-3 shadow-lg ${
                dateOpen ? "show" : ""
              }`}
              style={datePanelStyle}
            >
              <div className="space-y-1">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => selectDateOption(opt.value)}
                    className={`date-option ${dateRange === opt.value ? "active" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {dateRange === "custom" && (
                <div
                  className="mt-3 pt-3 space-y-3"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <div>
                    <label className="text-xs font-medium block mb-1.5 text-muted">
                      Start date
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="input-field w-full px-3 py-2 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5 text-muted">
                      End date
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="input-field w-full px-3 py-2 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    onClick={applyCustomDate}
                    className="btn-primary w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              ref={filterBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                setFilterOpen((v) => !v);
              }}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white bg-brand">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div
              ref={filterRef}
              onClick={(e) => e.stopPropagation()}
              className={`filter-panel absolute top-full mt-2 rounded-2xl p-5 shadow-lg ${
                filterOpen ? "show" : ""
              }`}
              style={filterPanelStyle}
            >
              <h4 className="font-semibold text-sm mb-4">
                Filter transactions
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted">
                    Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={amountMinInput}
                      onChange={(e) => setAmountMinInput(e.target.value)}
                      className="input-field w-full px-3 py-2 rounded-lg text-sm"
                    />
                    <span className="text-muted">–</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={amountMaxInput}
                      onChange={(e) => setAmountMaxInput(e.target.value)}
                      className="input-field w-full px-3 py-2 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted">
                    Customer ID / Email
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. c1 or name@email.com"
                    value={customerInput}
                    onChange={(e) => setCustomerInput(e.target.value)}
                    className="input-field w-full px-3.5 py-2 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted">
                    Transaction type
                  </label>
                  <select
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value)}
                    className="select-field w-full px-3.5 py-2 rounded-lg text-sm"
                  >
                    <option value="all">All types</option>
                    <option value="payment">Payment</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted">
                    Channel
                  </label>
                  <select
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    className="select-field w-full px-3.5 py-2 rounded-lg text-sm"
                  >
                    <option value="all">All channels</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="ussd">USSD</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted">
                    Status
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="select-field w-full px-3.5 py-2 rounded-lg text-sm"
                  >
                    <option value="all">All statuses</option>
                    <option value="success">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={applyFilters}
                  className="btn-primary flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
                >
                  Apply
                </button>
                <button
                  onClick={resetFilters}
                  className="btn-secondary px-4 py-2.5 rounded-lg text-sm font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Amount</th>
                <th>Customer</th>
                <th>Reference</th>
                <th>Channel</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.reference}
                    onClick={() => handleRowClick(t.reference)}
                  >
                    <td>
                      <span
                        className={`status-dot ${
                          t.status === "success"
                            ? ""
                            : t.status === "failed"
                              ? "is-failed"
                              : "is-pending"
                        }`}
                      ></span>
                    </td>
                    <td className="font-mono font-medium">
                      {formatNaira(t.amount || 0)}
                    </td>
                    <td>{t.customer_email}</td>
                    <td className="font-mono text-muted">{t.reference}</td>
                    <td>
                      <span className="channel-pill">{t.channel}</span>
                    </td>
                    <td className="text-muted">{formatDateDisplay(t.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          className={`empty-state flex-col items-center justify-center py-16 gap-2 ${
            !isLoading && transactions.length === 0 ? "show" : ""
          }`}
        >
          <SearchX className="w-8 h-8 text-muted" />
          <p className="text-sm font-medium">No transactions found</p>
          <p className="text-xs text-muted">
            Try a different reference or filter
          </p>
        </div>
        {meta && meta.last_page > 1 && (
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <p className="text-xs text-muted">
              Page {meta.current_page} of {meta.last_page} ({meta.total}{" "}
              transactions)
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

      {/* Transaction Detail Side Panel */}
      <div
        className={`overlay fixed inset-0 ${currentTransaction ? "show" : ""}`}
        onClick={closePanel}
      ></div>
      <aside
        className={`side-panel fixed top-0 right-0 h-full overflow-y-auto ${
          currentTransaction ? "open" : ""
        }`}
      >
        {currentTransaction && (
          <>
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <h3 className="font-semibold text-lg">Transaction details</h3>
              <button
                onClick={closePanel}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ border: "1px solid var(--line)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="px-6 py-6">
                <p className="text-sm text-muted">
                  Loading transaction details...
                </p>
              </div>
            ) : (
              <div className="px-6 py-6 space-y-6">
                <div className="card rounded-2xl p-5 text-center">
                  <p className="text-xs mb-1.5 text-muted">Amount</p>
                  <p className="font-mono text-2xl font-semibold mb-3">
                    {formatNaira(currentTransaction.amount)}
                  </p>
                  <span
                    className={`pill ${statusPillClass(currentTransaction.status)}`}
                  >
                    {statusLabel(currentTransaction.status)}
                  </span>
                </div>

                <div>
                  <div className="detail-row">
                    <span className="detail-label">Reference</span>
                    <span className="flex items-center gap-1.5">
                      <span className="detail-value font-mono">
                        {currentTransaction.reference}
                      </span>
                      <button
                        onClick={() =>
                          copyReference(currentTransaction.reference)
                        }
                        className="copy-btn w-6 h-6 rounded flex items-center justify-center shrink-0"
                        aria-label="Copy reference"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Channel</span>
                    <span className="detail-value">
                      {currentTransaction.channel}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Transaction type</span>
                    <span className="detail-value">
                      {currentTransaction.transaction_type}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {currentTransaction.date
                        ? formatDateDisplay(currentTransaction.date)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Paid at</span>
                    <span className="detail-value">
                      {currentTransaction.paid_at
                        ? formatDateDisplay(currentTransaction.paid_at)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Narration</span>
                    <span className="detail-value" style={{ maxWidth: 220 }}>
                      {currentTransaction.narration || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fee</span>
                    <span className="detail-value">
                      {formatNaira(currentTransaction.fee)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Net amount</span>
                    <span className="detail-value">
                      {formatNaira(currentTransaction.net_amount)}
                    </span>
                  </div>
                </div>

                {currentTransaction.customer && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Customer</h4>
                    <Link
                      href={`/dashboard/customers?customer=${encodeURIComponent(currentTransaction.customer.cus_id)}`}
                      className="card customer-link flex items-center justify-between gap-3 rounded-xl p-4"
                    >
                      <span className="min-w-0">
                        <span
                          className="block text-sm font-medium truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {currentTransaction.customer.name || "No name"}
                        </span>
                        <span className="block text-xs text-muted truncate">
                          {currentTransaction.customer.email}
                        </span>
                      </span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm mb-2">Authorization</h4>
                  <div className="detail-row">
                    <span className="detail-label">IP address</span>
                    <span className="detail-value font-mono">
                      {currentTransaction.ip_address || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Device</span>
                    <span className="detail-value">
                      {currentTransaction.device || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">User agent</span>
                    <span
                      className="detail-value"
                      style={{ maxWidth: 200, fontSize: "0.75rem" }}
                    >
                      {currentTransaction.user_agent || "-"}
                    </span>
                  </div>
                  {currentTransaction.gateway_response && (
                    <div className="detail-row">
                      <span className="detail-label">Gateway response</span>
                      <span className="detail-value">
                        {currentTransaction.gateway_response}
                      </span>
                    </div>
                  )}
                  {currentTransaction.authorization && (
                    <div
                      className="detail-row"
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <span className="detail-label">Authorization</span>
                      <pre
                        className="w-full text-xs"
                        style={{
                          background: "var(--brand-softer)",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          overflow: "auto",
                          maxHeight: "200px",
                        }}
                      >
                        {JSON.stringify(
                          currentTransaction.authorization,
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  )}
                  {currentTransaction.meta && (
                    <div
                      className="detail-row"
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <span className="detail-label">Meta data</span>
                      <pre
                        className="w-full text-xs"
                        style={{
                          background: "var(--brand-softer)",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          overflow: "auto",
                          maxHeight: "200px",
                        }}
                      >
                        {JSON.stringify(currentTransaction.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}