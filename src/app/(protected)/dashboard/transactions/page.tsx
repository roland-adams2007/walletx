"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import "./transaction.css";

type TxStatus = "success" | "failed" | "pending";
type DateRangeOption = "all" | "today" | "week" | "month" | "custom";

interface Transaction {
  id: string;
  amount: number;
  status: TxStatus;
  customerId: string;
  customerName: string;
  customerEmail: string;
  reference: string;
  channel: string;
  type: string;
  date: string;
  dateISO: string;
  narration: string;
  authorization: string;
  ip: string;
}

const transactions: Transaction[] = [
  {
    id: "t1",
    amount: 5000,
    status: "success",
    customerId: "c1",
    customerName: "",
    customerEmail: "philipomeizamatthew@gmail.com",
    reference: "TIX-UZ9NLE3CJBVNNA",
    channel: "Card",
    type: "Payment",
    date: "Wed, Jul 29, 2026 12:42 PM",
    dateISO: "2026-07-29T12:42:00",
    narration: "Payment for order #4821",
    authorization: "Visa •••• 4432",
    ip: "197.210.54.12",
  },
  {
    id: "t2",
    amount: 200,
    status: "success",
    customerId: "c8",
    customerName: "Rolly Adams",
    customerEmail: "adamsrolly7@gmail.com",
    reference: "TIX-MMRKD0QIOWOOBXY",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Tue, Jul 28, 2026 2:37 AM",
    dateISO: "2026-07-28T02:37:00",
    narration: "Wallet top-up",
    authorization: "GTBank •••• 2210",
    ip: "105.112.34.90",
  },
  {
    id: "t3",
    amount: 200,
    status: "success",
    customerId: "c8",
    customerName: "Rolly Adams",
    customerEmail: "adamsrolly7@gmail.com",
    reference: "TIX-XJ9W7MISHUOEJICB",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Tue, Jul 28, 2026 1:18 AM",
    dateISO: "2026-07-28T01:18:00",
    narration: "Wallet top-up",
    authorization: "GTBank •••• 2210",
    ip: "105.112.34.90",
  },
  {
    id: "t4",
    amount: 5000,
    status: "success",
    customerId: "c1",
    customerName: "",
    customerEmail: "kolawolerofiata@gmail.com",
    reference: "TIX-G7G6IZR86WHV4GFI",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Thu, Jul 23, 2026 2:22 PM",
    dateISO: "2026-07-23T14:22:00",
    narration: "Payment for order #4790",
    authorization: "Access Bank •••• 8871",
    ip: "102.89.23.45",
  },
  {
    id: "t5",
    amount: 5500,
    status: "success",
    customerId: "c2",
    customerName: "Wale Williams",
    customerEmail: "ww8615929@gmail.com",
    reference: "TIX-KOW1NZZM2HKOI0",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Sat, Jul 18, 2026 2:21 AM",
    dateISO: "2026-07-18T02:21:00",
    narration: "Payment for order #4703",
    authorization: "Zenith Bank •••• 6612",
    ip: "197.210.88.201",
  },
  {
    id: "t6",
    amount: 5500,
    status: "success",
    customerId: "c3",
    customerName: "Isyaka Nafisa",
    customerEmail: "isyakanafisa8@gmail.com",
    reference: "TIX-U18DK41CVNGEQX",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Sat, Jul 18, 2026 2:16 AM",
    dateISO: "2026-07-18T02:16:00",
    narration: "Payment for order #4702",
    authorization: "UBA •••• 3390",
    ip: "105.113.67.14",
  },
  {
    id: "t7",
    amount: 5500,
    status: "success",
    customerId: "c4",
    customerName: "",
    customerEmail: "mtanimu442@gmail.com",
    reference: "TIX-B8ZOQQPGFGFOS",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Sat, Jul 18, 2026 2:09 AM",
    dateISO: "2026-07-18T02:09:00",
    narration: "Payment for order #4701",
    authorization: "First Bank •••• 5528",
    ip: "197.211.10.77",
  },
  {
    id: "t8",
    amount: 5500,
    status: "success",
    customerId: "c5",
    customerName: "Jubril Egwudale",
    customerEmail: "egwudalejubril@gmail.com",
    reference: "TIX-6RMYIXZQDE9WN",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Sat, Jul 18, 2026 2:01 AM",
    dateISO: "2026-07-18T02:01:00",
    narration: "Payment for order #4700",
    authorization: "Kuda Bank •••• 1145",
    ip: "102.90.44.19",
  },
  {
    id: "t9",
    amount: 5500,
    status: "failed",
    customerId: "c9",
    customerName: "Christopher Olowo",
    customerEmail: "christopherolowo7@gmail.com",
    reference: "TIX-EWLDDDVOM37PK",
    channel: "Bank Transfer",
    type: "Payment",
    date: "Sat, Jul 18, 2026 1:59 AM",
    dateISO: "2026-07-18T01:59:00",
    narration: "Payment for order #4699",
    authorization: "Declined — insufficient funds",
    ip: "197.210.19.63",
  },
  {
    id: "t10",
    amount: 12000,
    status: "success",
    customerId: "c6",
    customerName: "Azeez Adebayo",
    customerEmail: "adebayoazeez026@gmail.com",
    reference: "TIX-P3NQOX4GHTBWZL",
    channel: "Card",
    type: "Payment",
    date: "Fri, Jul 17, 2026 6:14 PM",
    dateISO: "2026-07-17T18:14:00",
    narration: "Payment for order #4685",
    authorization: "Mastercard •••• 7761",
    ip: "105.119.203.5",
  },
  {
    id: "t11",
    amount: 8500,
    status: "pending",
    customerId: "c5",
    customerName: "Jubril Egwudale",
    customerEmail: "egwudalejubril@gmail.com",
    reference: "TIX-A62LFRTVXMEWKD",
    channel: "USSD",
    type: "Payment",
    date: "Fri, Jul 17, 2026 11:02 AM",
    dateISO: "2026-07-17T11:02:00",
    narration: "Awaiting confirmation",
    authorization: "USSD *737#",
    ip: "197.211.77.140",
  },
  {
    id: "t12",
    amount: 4000,
    status: "success",
    customerId: "c6",
    customerName: "Azeez Adebayo",
    customerEmail: "adebayoazeez026@gmail.com",
    reference: "TIX-9YDKQZLMR2FVXO",
    channel: "Card",
    type: "Refund",
    date: "Thu, Jul 16, 2026 3:45 PM",
    dateISO: "2026-07-16T15:45:00",
    narration: "Refund for order #4652",
    authorization: "Mastercard •••• 7761",
    ip: "105.119.203.5",
  },
];

const dateOptions: { value: DateRangeOption; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

function formatNaira(amount: number) {
  return (
    "₦" +
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function statusPillClass(status: TxStatus) {
  if (status === "success") return "pill-success";
  if (status === "failed") return "pill-failed";
  return "pill-pending";
}

function statusLabel(status: TxStatus) {
  if (status === "success") return "Successful";
  if (status === "failed") return "Failed";
  return "Pending";
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  const [dateOpen, setDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedDateRange, setAppliedDateRange] = useState<{
    type: DateRangeOption;
    start: string;
    end: string;
  }>({ type: "all", start: "", end: "" });

  const [filterOpen, setFilterOpen] = useState(false);
  const [amountMinInput, setAmountMinInput] = useState("");
  const [amountMaxInput, setAmountMaxInput] = useState("");
  const [customerInput, setCustomerInput] = useState("");
  const [typeInput, setTypeInput] = useState("all");
  const [channelInput, setChannelInput] = useState("all");
  const [statusInput, setStatusInput] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState({
    amountMin: null as number | null,
    amountMax: null as number | null,
    customer: "",
    type: "all",
    channel: "all",
    status: "all",
  });

  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);

  const [filterPanelStyle, setFilterPanelStyle] = useState<React.CSSProperties>(
    {},
  );
  const [datePanelStyle, setDatePanelStyle] = useState<React.CSSProperties>({});

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
      setAppliedDateRange({ type: option, start: "", end: "" });
      setDateOpen(false);
    }
  }

  function applyCustomDate() {
    setAppliedDateRange({ type: "custom", start: customStart, end: customEnd });
    setDateOpen(false);
  }

  function isWithinDateRange(dateISO: string) {
    const txDate = new Date(dateISO);
    const now = new Date();

    if (appliedDateRange.type === "all") return true;

    if (appliedDateRange.type === "today") {
      return (
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getDate() === now.getDate()
      );
    }

    if (appliedDateRange.type === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return txDate >= weekAgo && txDate <= now;
    }

    if (appliedDateRange.type === "month") {
      return (
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth()
      );
    }

    if (appliedDateRange.type === "custom") {
      if (!appliedDateRange.start && !appliedDateRange.end) return true;
      const start = appliedDateRange.start
        ? new Date(appliedDateRange.start)
        : null;
      const end = appliedDateRange.end
        ? new Date(appliedDateRange.end + "T23:59:59")
        : null;
      if (start && txDate < start) return false;
      if (end && txDate > end) return false;
      return true;
    }

    return true;
  }

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (q && !t.reference.toLowerCase().includes(q)) return false;
      if (!isWithinDateRange(t.dateISO)) return false;
      if (
        appliedFilters.amountMin !== null &&
        t.amount < appliedFilters.amountMin
      )
        return false;
      if (
        appliedFilters.amountMax !== null &&
        t.amount > appliedFilters.amountMax
      )
        return false;
      if (appliedFilters.customer) {
        const c = appliedFilters.customer.toLowerCase();
        if (
          !t.customerId.toLowerCase().includes(c) &&
          !t.customerEmail.toLowerCase().includes(c)
        )
          return false;
      }
      if (appliedFilters.type !== "all" && t.type !== appliedFilters.type)
        return false;
      if (
        appliedFilters.channel !== "all" &&
        t.channel !== appliedFilters.channel
      )
        return false;
      if (appliedFilters.status !== "all" && t.status !== appliedFilters.status)
        return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, appliedFilters, appliedDateRange]);

  const activeTx = useMemo(
    () => transactions.find((t) => t.id === activeTxId) || null,
    [activeTxId],
  );

  const activeFilterCount =
    (appliedFilters.amountMin !== null ? 1 : 0) +
    (appliedFilters.amountMax !== null ? 1 : 0) +
    (appliedFilters.customer ? 1 : 0) +
    (appliedFilters.type !== "all" ? 1 : 0) +
    (appliedFilters.channel !== "all" ? 1 : 0) +
    (appliedFilters.status !== "all" ? 1 : 0);

  const activeDateLabel =
    dateOptions.find((d) => d.value === appliedDateRange.type)?.label ??
    "All time";

  function applyFilters() {
    setAppliedFilters({
      amountMin: amountMinInput !== "" ? Number(amountMinInput) : null,
      amountMax: amountMaxInput !== "" ? Number(amountMaxInput) : null,
      customer: customerInput.trim(),
      type: typeInput,
      channel: channelInput,
      status: statusInput,
    });
    setFilterOpen(false);
  }

  function resetFilters() {
    setAmountMinInput("");
    setAmountMaxInput("");
    setCustomerInput("");
    setTypeInput("all");
    setChannelInput("all");
    setStatusInput("all");
    setAppliedFilters({
      amountMin: null,
      amountMax: null,
      customer: "",
      type: "all",
      channel: "all",
      status: "all",
    });
  }

  function openPanel(id: string) {
    setActiveTxId(id);
  }

  function closePanel() {
    setActiveTxId(null);
    setCopied(false);
  }

  async function copyReference() {
    if (!activeTx) return;
    try {
      await navigator.clipboard.writeText(activeTx.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
    }
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
              className="input-field w-full pl-10 pr-3.5 py-2.5 rounded-lg text-sm"
            />
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
                    Filter
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
                    <option value="Payment">Payment</option>
                    <option value="Refund">Refund</option>
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
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="USSD">USSD</option>
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
                  Filter
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
              {filteredTransactions.map((t) => (
                <tr key={t.id} onClick={() => openPanel(t.id)}>
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
                    {formatNaira(t.amount)}
                  </td>
                  <td>{t.customerEmail}</td>
                  <td className="font-mono text-muted">{t.reference}</td>
                  <td>
                    <span className="channel-pill">{t.channel}</span>
                  </td>
                  <td className="text-muted">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className={`empty-state flex-col items-center justify-center py-16 gap-2 ${
            filteredTransactions.length === 0 ? "show" : ""
          }`}
        >
          <SearchX className="w-8 h-8 text-muted" />
          <p className="text-sm font-medium">No transactions found</p>
          <p className="text-xs text-muted">
            Try a different reference or filter
          </p>
        </div>
      </div>

      <div
        className={`overlay fixed inset-0 ${activeTx ? "show" : ""}`}
        onClick={closePanel}
      ></div>
      <aside
        className={`side-panel fixed top-0 right-0 h-full overflow-y-auto ${
          activeTx ? "open" : ""
        }`}
      >
        {activeTx && (
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

            <div className="px-6 py-6 space-y-6">
              <div className="card rounded-2xl p-5 text-center">
                <p className="text-xs mb-1.5 text-muted">Amount</p>
                <p className="font-mono text-2xl font-semibold mb-3">
                  {formatNaira(activeTx.amount)}
                </p>
                <span className={`pill ${statusPillClass(activeTx.status)}`}>
                  {statusLabel(activeTx.status)}
                </span>
              </div>

              <div>
                <div className="detail-row">
                  <span className="detail-label">Reference</span>
                  <span className="flex items-center gap-1.5">
                    <span className="detail-value font-mono">
                      {activeTx.reference}
                    </span>
                    <button
                      onClick={copyReference}
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
                  <span className="detail-value">{activeTx.channel}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transaction type</span>
                  <span className="detail-value">{activeTx.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{activeTx.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Narration</span>
                  <span className="detail-value" style={{ maxWidth: 220 }}>
                    {activeTx.narration}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Customer</h4>
                <Link
                  href={`/customers?customer=${encodeURIComponent(activeTx.customerId)}`}
                  className="card customer-link flex items-center justify-between gap-3 rounded-xl p-4"
                >
                  <span className="min-w-0">
                    <span
                      className="block text-sm font-medium truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {activeTx.customerName.trim() || "No name"}
                    </span>
                    <span className="block text-xs text-muted truncate">
                      {activeTx.customerEmail}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Authorization</h4>
                <div className="detail-row">
                  <span className="detail-label">Authorization</span>
                  <span className="detail-value">{activeTx.authorization}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">IP address</span>
                  <span className="detail-value font-mono">{activeTx.ip}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
