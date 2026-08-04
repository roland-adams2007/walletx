"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, CheckCircle2, ChevronDown, Search } from "lucide-react";
import { useUserStore } from "@/app/stores/store";
import { useBusinessStore } from "@/app/stores/modules/businessStore";
import "./onboarding.css";
import Image from "next/image";

const INDUSTRIES = [
  { value: "retail_ecommerce", label: "Retail & E-commerce" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "logistics_transport", label: "Logistics & Transportation" },
  { value: "health_wellness", label: "Health & Wellness" },
  { value: "education", label: "Education" },
  { value: "fintech_finance", label: "Fintech & Financial services" },
  { value: "real_estate", label: "Real estate" },
  { value: "entertainment_events", label: "Entertainment & Events" },
  { value: "agriculture", label: "Agriculture" },
  { value: "professional_services", label: "Professional services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const {
    setSelectedBusinessId,
    fetchBusinessDetails,
    createBusiness,
    isCreating,
  } = useBusinessStore();

  const businesses = user?.business ?? [];
  const [mode, setMode] = useState<"select" | "create">(
    businesses.length > 0 ? "select" : "create",
  );

  const [pickedAltId, setPickedAltId] = useState<string | null>(
    businesses[0]?.alt_id ?? null,
  );
  const [continueError, setContinueError] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);

  async function handleContinue() {
    if (!pickedAltId) return;
    setContinuing(true);
    setContinueError(null);
    setSelectedBusinessId(pickedAltId);
    await fetchBusinessDetails(pickedAltId);
    router.replace("/dashboard");
  }

  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<"individual" | "registered">(
    "individual",
  );
  const [industry, setIndustry] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [industryOpen, setIndustryOpen] = useState(false);
  const [industryQuery, setIndustryQuery] = useState("");
  const industryRef = useRef<HTMLDivElement>(null);

  const filteredIndustries = useMemo(() => {
    const q = industryQuery.trim().toLowerCase();
    if (!q) return INDUSTRIES;
    return INDUSTRIES.filter((i) => i.label.toLowerCase().includes(q));
  }, [industryQuery]);

  const selectedIndustryLabel = INDUSTRIES.find(
    (i) => i.value === industry,
  )?.label;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        industryRef.current &&
        !industryRef.current.contains(e.target as Node)
      ) {
        setIndustryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (!name.trim()) {
      setCreateError("Business name is required.");
      return;
    }

    const res = await createBusiness({
      name: name.trim(),
      business_type: businessType,
      industry: industry ?? undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    if (!res.success || !res.altId) {
      setCreateError(
        res.message ?? "Failed to create business. Please try again.",
      );
      return;
    }

    useUserStore.setState({ hasFetched: false });
    await useUserStore.getState().fetchUser();
    await fetchBusinessDetails(res.altId);

    router.replace("/dashboard");
  }

  return (
    <div className="onboarding-wrap min-h-screen flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt="WalletX"
            width={140}
            height={40}
            unoptimized
            className="h-12 w-auto"
          />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-1.5">
          Let&apos;s get you set up
        </h1>
        <p className="text-sm text-center mb-7 text-muted">
          Continue with a business you belong to, or create a new one.
        </p>

        {businesses.length > 0 && (
          <div className="flex rounded-lg p-1 mb-6 bg-brand-softer">
            <button
              type="button"
              onClick={() => setMode("select")}
              className={`mode-tab flex-1 text-center px-3 py-2 rounded-md text-sm font-medium ${
                mode === "select" ? "mode-tab-active" : ""
              }`}
            >
              Select business
            </button>
            <button
              type="button"
              onClick={() => setMode("create")}
              className={`mode-tab flex-1 text-center px-3 py-2 rounded-md text-sm font-medium ${
                mode === "create" ? "mode-tab-active" : ""
              }`}
            >
              Create business
            </button>
          </div>
        )}

        {/* ===================== SELECT EXISTING ===================== */}
        {mode === "select" && (
          <div>
            <div className="space-y-2.5 mb-6">
              {businesses.map((b) => {
                const active = pickedAltId === b.alt_id;
                return (
                  <button
                    type="button"
                    key={b.alt_id}
                    onClick={() => setPickedAltId(b.alt_id)}
                    className={`biz-card w-full rounded-xl p-4 flex items-center gap-3 text-left ${
                      active ? "biz-card-active" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-brand">
                      {initialsOf(b.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{b.name}</p>
                      <p className="text-xs font-mono text-muted truncate">
                        ID {b.alt_id}
                      </p>
                    </div>
                    {active && (
                      <CheckCircle2 className="biz-check w-5 h-5 shrink-0 text-brand" />
                    )}
                  </button>
                );
              })}
            </div>

            {continueError && (
              <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2 mb-4">
                {continueError}
              </p>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={!pickedAltId || continuing}
              className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-medium text-white"
            >
              {continuing ? "Continuing..." : "Continue"}
            </button>
          </div>
        )}

        {/* ===================== CREATE NEW ===================== */}
        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium block mb-1.5"
              >
                Business name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                placeholder="e.g. Tixkarios Ltd"
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                disabled={isCreating}
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Business type
              </label>
              <div className="flex rounded-lg p-1 bg-brand-softer">
                <button
                  type="button"
                  onClick={() => setBusinessType("individual")}
                  className={`type-tab flex-1 text-center px-3 py-2 rounded-md text-sm font-medium ${
                    businessType === "individual" ? "type-tab-active" : ""
                  }`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setBusinessType("registered")}
                  className={`type-tab flex-1 text-center px-3 py-2 rounded-md text-sm font-medium ${
                    businessType === "registered" ? "type-tab-active" : ""
                  }`}
                >
                  Registered
                </button>
              </div>
              <p className="text-xs mt-1.5 text-muted">
                Registered businesses have a CAC number; individuals operate
                under a personal name.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Industry{" "}
                <span className="text-xs font-normal text-muted">
                  (optional)
                </span>
              </label>
              <div className="industry-dropdown relative" ref={industryRef}>
                <button
                  type="button"
                  onClick={() => setIndustryOpen((v) => !v)}
                  className="industry-trigger w-full px-3.5 py-2.5 rounded-lg text-sm flex items-center justify-between"
                  aria-haspopup="listbox"
                  aria-expanded={industryOpen}
                >
                  <span className={selectedIndustryLabel ? "" : "text-muted"}>
                    {selectedIndustryLabel ?? "Select an industry"}
                  </span>
                  <ChevronDown
                    className={`chevron-icon w-4 h-4 shrink-0 text-muted ${
                      industryOpen ? "chevron-open" : ""
                    }`}
                  />
                </button>

                {industryOpen && (
                  <div
                    className="industry-panel rounded-lg overflow-hidden"
                    role="listbox"
                  >
                    <div className="p-2 industry-search-wrap">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          autoFocus
                          value={industryQuery}
                          onChange={(e) => setIndustryQuery(e.target.value)}
                          placeholder="Search industries"
                          className="w-full pl-8 pr-2.5 py-1.5 rounded-md text-sm industry-search-input"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                      {filteredIndustries.map((opt) => (
                        <li
                          key={opt.value}
                          role="option"
                          onClick={() => {
                            setIndustry(opt.value);
                            setIndustryOpen(false);
                            setIndustryQuery("");
                          }}
                          className={`industry-option px-3.5 py-2 text-sm cursor-pointer ${
                            opt.value === industry
                              ? "industry-option-active"
                              : ""
                          }`}
                        >
                          {opt.label}
                        </li>
                      ))}
                      {filteredIndustries.length === 0 && (
                        <li className="px-3.5 py-3 text-sm text-muted list-none">
                          No industries match your search.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium block mb-1.5"
              >
                Business email{" "}
                <span className="text-xs font-normal text-muted">
                  (optional)
                </span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                placeholder="business@example.com"
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                disabled={isCreating}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium block mb-1.5"
              >
                Business phone{" "}
                <span className="text-xs font-normal text-muted">
                  (optional)
                </span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="+234 704 350 7082"
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm"
                disabled={isCreating}
              />
            </div>

            {createError && (
              <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
                {createError}
              </p>
            )}

            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-medium text-white mt-2"
            >
              {isCreating ? "Creating..." : "Create business"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
