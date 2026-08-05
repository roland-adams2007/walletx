"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Banknote,
  Send,
  Users,
  Settings,
  Building2,
  ChevronsUpDown,
  Check,
  Plus,
  Bell,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";
import "./dashboard.css";
import { useUserStore, useBusinessStore } from "@/app/stores/store";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
  },
  { href: "/dashboard/payouts", label: "Payouts", icon: Banknote },
  { href: "/dashboard/transfer", label: "Transfer", icon: Send },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/transactions": "Transactions",
  "/dashboard/payouts": "Payouts",
  "/dashboard/transfer": "Transfer",
  "/dashboard/customers": "Customers",
  "/dashboard/settings": "Settings",
};

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Overview";
}

function getInitials(firstname?: string, lastname?: string) {
  if (!firstname) return "";
  return `${firstname[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase();
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, hasFetched, fetchUser } = useUserStore();
  const {
    selectedBusinessId,
    hasHydrated,
    businessDetails,
    setSelectedBusinessId,
    hydrateSelectedBusinessId,
    fetchBusinessDetails,
  } = useBusinessStore();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
    hydrateSelectedBusinessId();
  }, [fetchUser, hydrateSelectedBusinessId]);

  useEffect(() => {
    if (!hasFetched || isLoading) return;
    if (user && (!user.business || user.business.length === 0)) {
      router.replace("/onboarding");
    }
  }, [user, hasFetched, isLoading, router]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!selectedBusinessId && user?.business && user.business.length > 0) {
      setSelectedBusinessId(user.business[0].alt_id);
    }
  }, [hasHydrated, selectedBusinessId, user, setSelectedBusinessId]);

  useEffect(() => {
    if (!selectedBusinessId) return;
    fetchBusinessDetails(selectedBusinessId);
  }, [selectedBusinessId, fetchBusinessDetails]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(e.target as Node)
      ) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const businesses = user?.business ?? [];
  const activeBusiness =
    businesses.find((b) => b.alt_id === selectedBusinessId) ?? businesses[0];

  const initials = getInitials(user?.firstname, user?.lastname);
  const isBusinessInactive = businessDetails?.is_active === false;

  return (
    <div className="min-h-screen lg:flex">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`dashboard-sidebar w-64 shrink-0 py-6 fixed inset-y-0 left-0 z-40 overflow-y-auto transform transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="relative mx-4 mb-6 mt-1" ref={switcherRef}>
          <button
            onClick={() => setSwitcherOpen((v) => !v)}
            className="biz-switcher flex items-center gap-2.5 rounded-lg px-3 py-2.5 w-full"
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-brand">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="flex-1 min-w-0 flex flex-col text-left">
              <span className="text-sm font-medium text-white truncate">
                {activeBusiness?.name ?? "Loading..."}
              </span>
              <span className="text-xs text-gray-300 truncate">
                {activeBusiness?.alt_id ?? "Loading..."}
              </span>
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 sidebar-muted" />
          </button>

          {switcherOpen && (
            <div className="biz-dropdown absolute left-0 top-[calc(100%+6px)] w-full rounded-lg overflow-hidden z-20">
              <div className="max-h-64 overflow-y-auto">
                {businesses.map((b) => {
                  const active = b.alt_id === activeBusiness?.alt_id;
                  return (
                    <button
                      key={b.alt_id}
                      onClick={() => {
                        setSelectedBusinessId(b.alt_id);
                        setSwitcherOpen(false);
                      }}
                      className="biz-dropdown-item w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{b.name}</p>
                        <p className="text-xs sidebar-muted truncate">
                          {b.alt_id}
                        </p>
                      </div>
                      {active && (
                        <Check className="w-4 h-4 shrink-0 text-brand" />
                      )}
                    </button>
                  );
                })}
              </div>
              <Link
                href="/onboarding"
                className="biz-dropdown-create w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium"
                onClick={() => setSwitcherOpen(false)}
              >
                <Plus className="w-4 h-4" />
                Create new business
              </Link>
            </div>
          )}
        </div>

        <nav className="px-3 space-y-1 text-sm font-medium">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-lg ${active ? "active" : ""}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 lg:px-10 py-5 border-b border-line dashboard-header">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center border border-line shrink-0"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
            <h1 className="text-lg font-semibold">{getPageTitle(pathname)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center relative border border-line"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-muted" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-danger" />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-brand">
              {initials}
            </div>
          </div>
        </header>
        {isBusinessInactive && (
          <div
            className="flex items-center gap-2 px-6 lg:px-10 py-3 text-sm font-medium"
            style={{ background: "var(--amber-soft)", color: "var(--amber)" }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            This business is not active. Reach out to support to activate it.
          </div>
        )}
        <main className="px-6 lg:px-10 py-8">{children}</main>
      </div>
    </div>
  );
}