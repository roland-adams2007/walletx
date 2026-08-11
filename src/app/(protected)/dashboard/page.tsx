"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, Plus, Send, X } from "lucide-react";
import {
  useBusinessStore,
  useDashboardStore,
  DashboardDateType,
} from "../../stores/store";
import api from "@/app/api/axios";

function formatAmount(amount: number) {
  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

let gatewayLoadPromise: Promise<void> | null = null;

function loadGateway(): Promise<void> {
  if (typeof window !== "undefined" && (window as any).WalletXGateway) {
    return Promise.resolve();
  }
  if (gatewayLoadPromise) return gatewayLoadPromise;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_API_BASE_URL is not set."),
    );
  }

  gatewayLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${apiBase.replace(/\/$/, "")}/gateway.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gatewayLoadPromise = null;
      reject(new Error("Could not load the payment widget. Please retry."));
    };
    document.body.appendChild(script);
  });

  return gatewayLoadPromise;
}

const DATE_FILTERS: { label: string; value: DashboardDateType }[] = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "This year", value: "this_year" },
];

export default function OverviewPage() {
  const selectedBusinessId = useBusinessStore((s) => s.selectedBusinessId);
  const balance = useBusinessStore((s) => s.balance);
  const fetchBusinessBalance = useBusinessStore((s) => s.fetchBusinessBalance);

  const revenue = useDashboardStore((s) => s.revenue);
  const isLoadingRevenue = useDashboardStore((s) => s.isLoadingRevenue);
  const rate = useDashboardStore((s) => s.rate);
  const fetchRevenue = useDashboardStore((s) => s.fetchRevenue);
  const fetchRate = useDashboardStore((s) => s.fetchRate);

  const [dateType, setDateType] = useState<DashboardDateType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [isFundOpen, setIsFundOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [isFundLoading, setIsFundLoading] = useState(false);
  const [fundError, setFundError] = useState("");

  useEffect(() => {
    if (!selectedBusinessId) return;
    fetchBusinessBalance(selectedBusinessId);
    fetchRate(selectedBusinessId);
  }, [selectedBusinessId, fetchBusinessBalance, fetchRate]);

  useEffect(() => {
    if (!selectedBusinessId) return;
    fetchRevenue(selectedBusinessId, dateType);
  }, [selectedBusinessId, dateType, fetchRevenue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleStartFunding() {
    setFundError("");

    const naira = parseFloat(fundAmount);
    if (!naira || naira < 100) {
      setFundError("Enter an amount of at least NGN 100.");
      return;
    }
    const amountInKobo = Math.round(naira * 100);
    const reference = `wallet_${selectedBusinessId ?? "biz"}_${Date.now()}`;

    setIsFundLoading(true);
    try {
      await loadGateway();

      const gateway = (window as any).WalletXGateway.setup({
        internal: true,
        amount: amountInKobo,
        reference,
        onInitialize: async ({ reference, amount }: { reference: string; amount: number }) => {
          try {
            const res = await api.post("/wallet/fund/initialize", {
              amount,
              ref: reference,
              business_id: selectedBusinessId,
            });
            if (!res.data.success) {
              throw new Error(res.data.message || "Could not start the transaction.");
            }
            return res.data.data;
          } catch (err: any) {
            throw new Error(
              err.response?.data?.message || err.message || "Could not start the transaction.",
            );
          }
        },
        onCharge: async (body: Record<string, unknown>) => {
          try {
            const res = await api.post("/wallet/fund/charge", body);
            return res.data;
          } catch (err: any) {
            if (err.response?.data) return err.response.data;
            throw err;
          }
        },
        callback: () => {
          setFundAmount("");
          if (selectedBusinessId) fetchBusinessBalance(selectedBusinessId);
        },
        onError: (message: string) => {
          setFundError(message);
          setIsFundOpen(true);
        },
      });
      setIsFundOpen(false);
      setIsFundLoading(false);
      await gateway.openModal();
    } catch (err: any) {
      setIsFundLoading(false);
      setFundError(err?.message || "Something went wrong. Please try again.");
    }
  }

  const successRate = rate?.success_rate ?? 0;
  const failedRate = rate?.failed_rate ?? 0;
  const activeFilterLabel =
    DATE_FILTERS.find((f) => f.value === dateType)?.label ?? "All time";

  return (
    <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="lg:col-span-2 space-y-4 sm:space-y-5">
        <div className="card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h3 className="font-semibold text-lg">Revenue</h3>
            <div className="flex items-center gap-2">
              {isLoadingRevenue && (
                <Loader2 className="w-4 h-4 animate-spin text-muted" />
              )}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="date-filter-trigger flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg"
                >
                  {activeFilterLabel}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {isFilterOpen && (
                  <div className="date-filter-dropdown absolute right-0 mt-2 rounded-xl overflow-hidden z-10 w-40">
                    {DATE_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setDateType(filter.value);
                          setIsFilterOpen(false);
                        }}
                        className={`date-filter-option w-full text-left text-sm px-3.5 py-2.5 ${
                          dateType === filter.value ? "active" : ""
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center py-2 sm:py-4">
            <div className="revenue-circle rounded-full flex flex-col items-center justify-center text-center text-white">
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "#8fd6ae" }}
              >
                Total revenue
              </p>
              <p className="font-mono text-lg sm:text-xl font-semibold px-4 break-words">
                {formatAmount(revenue?.revenue ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="card rounded-2xl p-4 sm:p-6">
            <h3 className="font-semibold text-lg mb-5">Success rate</h3>
            <div className="flex items-center gap-4 sm:gap-6">
              <div
                className="donut relative rounded-full w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center"
                style={{
                  background: `conic-gradient(var(--brand) 0% ${successRate}%, var(--brand-soft) ${successRate}% 100%)`,
                }}
              >
                <div className="relative z-10 text-center">
                  <p className="font-mono text-sm sm:text-base font-semibold leading-none">
                    {successRate}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {rate?.success_count ?? 0} transactions
                </p>
                <p className="text-xs text-muted">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="card rounded-2xl p-4 sm:p-6">
            <h3 className="font-semibold text-lg mb-5">Failed rate</h3>
            <div className="flex items-center gap-4 sm:gap-6">
              <div
                className="donut relative rounded-full w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center"
                style={{
                  background: `conic-gradient(var(--danger) 0% ${failedRate}%, var(--danger-soft) ${failedRate}% 100%)`,
                }}
              >
                <div className="relative z-10 text-center">
                  <p className="font-mono text-sm sm:text-base font-semibold leading-none text-danger">
                    {failedRate}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {rate?.failed_count ?? 0} transactions
                </p>
                <p className="text-xs text-muted">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="balance-card rounded-2xl p-4 sm:p-6 text-white">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-4"
            style={{ color: "#8fd6ae" }}
          >
            Available balance
          </p>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-5 break-words">
            {formatAmount(balance?.balance ?? 0)}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setFundError("");
                setIsFundOpen(true);
              }}
              className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg text-white"
              style={{ background: "rgba(255,255,255,0.14)" }}
            >
              <Plus className="w-4 h-4" />
              Fund wallet
            </button>
            <Link
              href="/dashboard/transfer"
              className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg bg-white text-brand-dark"
            >
              <Send className="w-4 h-4" />
              Transfer
            </Link>
          </div>
        </div>

        <div className="card rounded-2xl p-4 sm:p-5">
          <h3 className="font-semibold mb-2">Pending payouts</h3>
          <p className="font-mono text-xl sm:text-2xl font-semibold text-amber break-words">
            {formatAmount(balance?.pending_balance ?? 0)}
          </p>
        </div>
      </div>

      {isFundOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => !isFundLoading && setIsFundOpen(false)}
        >
          <div
            className="card rounded-2xl p-5 sm:p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Fund wallet</h3>
              <button
                onClick={() => setIsFundOpen(false)}
                aria-label="Close"
                disabled={isFundLoading}
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            <label htmlFor="fund-amount" className="text-xs text-muted mb-1.5 block">
              Amount (NGN)
            </label>
            <input
              id="fund-amount"
              type="number"
              min={1}
              step="0.01"
              inputMode="decimal"
              autoFocus
              placeholder="10,000.00"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isFundLoading) handleStartFunding();
              }}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono mb-2"
            />

            {fundError && (
              <p className="text-xs text-danger mb-2">{fundError}</p>
            )}

            <button
              onClick={handleStartFunding}
              disabled={isFundLoading}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3.5 py-2.5 rounded-lg bg-brand text-white mt-2 disabled:opacity-60"
            >
              {isFundLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}