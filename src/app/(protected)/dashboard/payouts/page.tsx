"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Filter,
  Calendar,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Inbox,
} from "lucide-react";
import "./payout.css";
import {
  useBankStore,
  useBusinessStore,
  usePayoutStore,
} from "../../../stores/store";
import type {
  PayoutFilters,
  PayoutListItem,
} from "../../../stores/modules/payoutStore";

type DateFilterType =
  | "all"
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "custom";

function formatAmount(amount: number) {
  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clampPanelToViewport(
  btnRef: React.RefObject<HTMLElement>,
  panelRef: React.RefObject<HTMLElement>,
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

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "success"
      ? "pill-success"
      : status === "failed"
        ? "pill-failed"
        : status === "reversed"
          ? "pill-reversed"
          : status === "processing"
            ? "pill-processing"
            : "pill-pending";

  const dotCls =
    status === "success"
      ? ""
      : status === "failed"
        ? "is-failed"
        : status === "reversed"
          ? "is-reversed"
          : status === "processing"
            ? "is-processing"
            : "is-pending";

  return (
    <span className={`pill ${cls}`}>
      <span className={`status-dot ${dotCls}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button onClick={handleCopy} className="copy-btn shrink-0" type="button">
      {copied ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function DetailPanel({
  reference,
  onClose,
}: {
  reference: string | null;
  onClose: () => void;
}) {
  const currentPayout = usePayoutStore((s) => s.currentPayout);
  const isLoadingDetail = usePayoutStore((s) => s.isLoadingDetail);
  const detailError = usePayoutStore((s) => s.detailError);
  const fetchPayoutByReference = usePayoutStore(
    (s) => s.fetchPayoutByReference,
  );
  const clearCurrentPayout = usePayoutStore((s) => s.clearCurrentPayout);
  const banks = useBankStore((s) => s.banks);

  useEffect(() => {
    if (reference) {
      fetchPayoutByReference(reference);
    }
    return () => {
      clearCurrentPayout();
    };
  }, [reference, fetchPayoutByReference, clearCurrentPayout]);

  const bankName = useMemo(() => {
    if (!currentPayout) return "-";
    const bank = banks.find((b) => b.bank_code === currentPayout.bank_code);
    return bank ? bank.name : currentPayout.bank_code;
  }, [banks, currentPayout]);

  return (
    <>
      <div
        className={`overlay fixed inset-0 ${reference ? "show" : ""}`}
        onClick={onClose}
      />
      <div
        className={`side-panel fixed top-0 right-0 h-full overflow-y-auto ${reference ? "open" : ""}`}
      >
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--line)" }}
        >
          <h3 className="font-semibold text-base">Payout details</h3>
          <button onClick={onClose} type="button" className="text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {isLoadingDetail && (
            <p className="text-sm text-muted">Loading payout...</p>
          )}

          {!isLoadingDetail && detailError && (
            <p className="text-sm text-danger">{detailError}</p>
          )}

          {!isLoadingDetail && currentPayout && (
            <div>
              <div className="mb-5">
                <StatusPill status={currentPayout.status} />
              </div>

              <div className="detail-row">
                <span className="detail-label">Amount</span>
                <span className="detail-value">
                  {formatAmount(currentPayout.amount)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fee</span>
                <span className="detail-value">
                  {formatAmount(currentPayout.fee)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reference</span>
                <span className="detail-value flex items-center gap-2 justify-end">
                  {currentPayout.reference}
                  <CopyField value={currentPayout.reference} />
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Source</span>
                <span className="detail-value">
                  {currentPayout.source === "manual" ? "Manual" : "Automatic"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bank</span>
                <span className="detail-value">{bankName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account number</span>
                <span className="detail-value flex items-center gap-2 justify-end">
                  {currentPayout.account_number}
                  <CopyField value={currentPayout.account_number} />
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account name</span>
                <span className="detail-value">
                  {currentPayout.account_name}
                </span>
              </div>
              {currentPayout.narration && (
                <div className="detail-row">
                  <span className="detail-label">Narration</span>
                  <span className="detail-value">
                    {currentPayout.narration}
                  </span>
                </div>
              )}
              {currentPayout.gateway_reference && (
                <div className="detail-row">
                  <span className="detail-label">Gateway reference</span>
                  <span className="detail-value">
                    {currentPayout.gateway_reference}
                  </span>
                </div>
              )}
              {currentPayout.failure_reason && (
                <div className="detail-row">
                  <span className="detail-label">Failure reason</span>
                  <span className="detail-value text-danger">
                    {currentPayout.failure_reason}
                  </span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Retry count</span>
                <span className="detail-value">
                  {currentPayout.retry_count}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Initiated</span>
                <span className="detail-value">
                  {formatDate(currentPayout.created_at)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-value">
                  {formatDate(currentPayout.processed_at)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterPanel({
  show,
  onClose,
  onApply,
  panelRef,
  style,
}: {
  show: boolean;
  onClose: () => void;
  onApply: (filters: PayoutFilters) => void;
  panelRef: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
}) {
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose, panelRef]);

  function handleApply() {
    onApply({
      status: status || undefined,
      source: source || undefined,
      min_amount: minAmount || undefined,
      max_amount: maxAmount || undefined,
    });
    onClose();
  }

  function handleReset() {
    setStatus("");
    setSource("");
    setMinAmount("");
    setMaxAmount("");
    onApply({});
    onClose();
  }

  return (
    <div
      ref={panelRef}
      style={style}
      className={`filter-panel absolute mt-2 rounded-xl p-4 space-y-4 ${show ? "show" : ""}`}
    >
      <div>
        <label className="field-label block mb-1.5 text-xs font-semibold text-muted uppercase">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select-field w-full rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="reversed">Reversed</option>
        </select>
      </div>

      <div>
        <label className="field-label block mb-1.5 text-xs font-semibold text-muted uppercase">
          Source
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="select-field w-full rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="manual">Manual</option>
          <option value="automatic">Automatic</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label block mb-1.5 text-xs font-semibold text-muted uppercase">
            Min amount
          </label>
          <input
            value={minAmount}
            onChange={(e) =>
              setMinAmount(e.target.value.replace(/[^0-9.]/g, ""))
            }
            placeholder="0.00"
            className="select-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="field-label block mb-1.5 text-xs font-semibold text-muted uppercase">
            Max amount
          </label>
          <input
            value={maxAmount}
            onChange={(e) =>
              setMaxAmount(e.target.value.replace(/[^0-9.]/g, ""))
            }
            placeholder="0.00"
            className="select-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleReset}
          type="button"
          className="btn-secondary flex-1 rounded-lg py-2 text-sm font-medium"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          type="button"
          className="btn-primary flex-1 rounded-lg py-2 text-sm font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function DatePanel({
  show,
  onClose,
  active,
  onSelect,
  panelRef,
  style,
}: {
  show: boolean;
  onClose: () => void;
  active: DateFilterType;
  onSelect: (value: DateFilterType) => void;
  panelRef: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
}) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose, panelRef]);

  const options: { label: string; value: DateFilterType }[] = [
    { label: "All time", value: "all" },
    { label: "Today", value: "today" },
    { label: "This week", value: "this_week" },
    { label: "This month", value: "this_month" },
    { label: "This year", value: "this_year" },
  ];

  return (
    <div
      ref={panelRef}
      style={style}
      className={`date-panel absolute mt-2 rounded-xl p-2 ${show ? "show" : ""}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => {
            onSelect(opt.value);
            onClose();
          }}
          className={`date-option ${active === opt.value ? "active" : ""}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PayoutsPage() {
  const selectedBusinessId = useBusinessStore((s) => s.selectedBusinessId);
  const payouts = usePayoutStore((s) => s.payouts);
  const meta = usePayoutStore((s) => s.meta);
  const isLoading = usePayoutStore((s) => s.isLoading);
  const error = usePayoutStore((s) => s.error);
  const fetchPayouts = usePayoutStore((s) => s.fetchPayouts);
  const setFilters = usePayoutStore((s) => s.setFilters);
  const fetchBanks = useBankStore((s) => s.fetchBanks);

  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePanel, setShowDatePanel] = useState(false);
  const [dateType, setDateType] = useState<DateFilterType>("all");
  const [activeFilters, setActiveFilters] = useState<PayoutFilters>({});
  const [selectedReference, setSelectedReference] = useState<string | null>(
    null,
  );

  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const datePanelRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [datePanelStyle, setDatePanelStyle] = useState<React.CSSProperties>(
    {},
  );
  const [filterPanelStyle, setFilterPanelStyle] =
    useState<React.CSSProperties>({});

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  useEffect(() => {
    if (!selectedBusinessId) return;
    const filters: PayoutFilters = {
      ...activeFilters,
      ...(dateType !== "all" ? { date_type: dateType } : {}),
    };
    setFilters(filters);
    fetchPayouts(page, selectedBusinessId, filters);
  }, [
    page,
    selectedBusinessId,
    activeFilters,
    dateType,
    fetchPayouts,
    setFilters,
  ]);

  useEffect(() => {
    if (!showDatePanel) return;
    clampPanelToViewport(dateBtnRef, datePanelRef, setDatePanelStyle);
    const onResize = () =>
      clampPanelToViewport(dateBtnRef, datePanelRef, setDatePanelStyle);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showDatePanel]);

  useEffect(() => {
    if (!showFilters) return;
    clampPanelToViewport(filterBtnRef, filterPanelRef, setFilterPanelStyle);
    const onResize = () =>
      clampPanelToViewport(filterBtnRef, filterPanelRef, setFilterPanelStyle);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showFilters]);

  function handleApplyFilters(filters: PayoutFilters) {
    setPage(1);
    setActiveFilters(filters);
  }

  function handleSelectDate(value: DateFilterType) {
    setPage(1);
    setDateType(value);
  }

  const isEmpty = !isLoading && !error && payouts.length === 0;

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="card rounded-2xl overflow-visible">
        <div className="flex items-center justify-between px-4 sm:px-6 py-5 flex-wrap gap-3">
          <h2 className="font-semibold text-lg">Payouts</h2>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="relative">
              <button
                ref={dateBtnRef}
                onClick={() => {
                  setShowDatePanel((p) => !p);
                  setShowFilters(false);
                }}
                type="button"
                className="btn-secondary flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                {dateType === "all"
                  ? "All time"
                  : dateType
                      .replace("_", " ")
                      .replace(/^\w/, (c) => c.toUpperCase())}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <DatePanel
                show={showDatePanel}
                onClose={() => setShowDatePanel(false)}
                active={dateType}
                onSelect={handleSelectDate}
                panelRef={datePanelRef}
                style={datePanelStyle}
              />
            </div>

            <div className="relative">
              <button
                ref={filterBtnRef}
                onClick={() => {
                  setShowFilters((p) => !p);
                  setShowDatePanel(false);
                }}
                type="button"
                className="btn-secondary flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <FilterPanel
                show={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={handleApplyFilters}
                panelRef={filterPanelRef}
                style={filterPanelStyle}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Source</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout: PayoutListItem) => (
                <tr
                  key={payout.reference}
                  onClick={() => setSelectedReference(payout.reference)}
                >
                  <td className="font-mono text-xs">{payout.reference}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium">{payout.account_name}</span>
                      <span className="text-xs text-muted">
                        {payout.account_number}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono">{formatAmount(payout.amount)}</td>
                  <td>
                    <span className="channel-pill">
                      {payout.source === "manual" ? "Manual" : "Automatic"}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={payout.status} />
                  </td>
                  <td className="text-muted">
                    {formatDate(payout.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="flex items-center justify-center py-14 text-sm text-muted">
              Loading payouts
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-14 text-sm text-danger">
              {error}
            </div>
          )}

          <div
            className={`empty-state flex-col items-center justify-center py-16 ${isEmpty ? "show" : ""}`}
          >
            <Inbox className="w-8 h-8 text-muted mb-3" />
            <p className="text-sm font-medium">No payouts yet</p>
            <p className="text-sm text-muted">
              Payouts will appear here once they're created
            </p>
          </div>
        </div>

        {meta && meta.last_page > 1 && (
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-t flex-wrap gap-3"
            style={{ borderColor: "var(--line)" }}
          >
            <span className="text-sm text-muted">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
                type="button"
                className="btn-secondary rounded-lg p-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
                type="button"
                className="btn-secondary rounded-lg p-2 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <DetailPanel
        reference={selectedReference}
        onClose={() => setSelectedReference(null)}
      />
    </div>
  );
}