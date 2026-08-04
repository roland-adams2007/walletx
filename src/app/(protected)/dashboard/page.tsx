import { ChevronRight, Plus, Send } from "lucide-react";

const revenueBars = [
  { month: "Mar", height: 58 },
  { month: "Apr", height: 66 },
  { month: "May", height: 47 },
  { month: "Jun", height: 61 },
  { month: "Jul", height: 97, peak: true },
  { month: "Aug", height: 70 },
];

export default function OverviewPage() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Revenue flow</h3>
            <a href="#" className="text-sm font-medium flex items-center gap-1 text-brand">
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="flex gap-6">
            <div className="font-mono text-xs flex flex-col justify-between py-1 text-muted">
              <span>3.2M</span>
              <span>2.4M</span>
              <span>1.6M</span>
              <span>0.8M</span>
              <span>0</span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-3 h-44 relative">
              <div className="card absolute -top-3 left-[62%] -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap shadow-sm">
                +₦860,000
              </div>
              {revenueBars.map(({ month, height, peak }) => (
                <div key={month} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`bar w-full rounded-lg ${peak ? "peak" : ""}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className={`text-xs ${peak ? "font-medium" : "text-muted"}`}>
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="card rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-5">Success rate</h3>
            <div className="flex items-center gap-6">
              <div className="donut donut-success relative rounded-full w-24 h-24 shrink-0 flex items-center justify-center">
                <div className="relative z-10 text-center">
                  <p className="font-mono text-base font-semibold leading-none">92%</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">238 transactions</p>
                <p className="text-xs text-muted">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="card rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-5">Failed rate</h3>
            <div className="flex items-center gap-6">
              <div className="donut donut-failed relative rounded-full w-24 h-24 shrink-0 flex items-center justify-center">
                <div className="relative z-10 text-center">
                  <p className="font-mono text-base font-semibold leading-none text-danger">8%</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">20 transactions</p>
                <p className="text-xs text-muted">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="balance-card rounded-2xl p-6 text-white">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "#8fd6ae" }}>
            Available balance
          </p>
          <p className="text-3xl font-semibold tracking-tight mb-5">₦4,820,650.00</p>
          <div className="flex flex-wrap gap-2.5">
            <button
              className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg text-white"
              style={{ background: "rgba(255,255,255,0.14)" }}
            >
              <Plus className="w-4 h-4" />
              Fund wallet
            </button>
            <button className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg bg-white text-brand-dark">
              <Send className="w-4 h-4" />
              Transfer
            </button>
          </div>
        </div>

        <div className="card rounded-2xl p-5">
          <h3 className="font-semibold mb-2">Pending payouts</h3>
          <p className="font-mono text-2xl font-semibold text-amber">₦412,000</p>
        </div>
      </div>
    </div>
  );
}