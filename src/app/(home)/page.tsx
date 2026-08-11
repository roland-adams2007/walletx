import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Building2,
  User,
  Zap,
  CreditCard,
  Code2,
  ShieldCheck,
  Globe,
  Users,
  Percent,
} from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "WalletX — Payment infrastructure for every business",
};

export default function Home() {
  return (
    <div className="landing-page antialiased">
      {/* NAV + HERO — image background with overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero.png" alt="" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,53,39,0.55) 0%, rgba(18,53,39,0.68) 45%, rgba(18,53,39,0.85) 100%)",
            }}
          />
        </div>

        <header className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-semibold text-2xl tracking-tight"
            style={{ color: "var(--moss-dark)" }}
          >
            <Image
              src="/logo.png"
              alt="WalletX"
              width={140}
              height={40}
              unoptimized
              className="h-12 w-auto"
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm text-white/80">
            <a href="#segments" className="hover:text-white transition-colors">
              Business
            </a>
            <a href="#segments" className="hover:text-white transition-colors">
              Individual
            </a>
            <a
              href="#developers"
              className="hover:text-white transition-colors"
            >
              Developers
            </a>
            <a href="#ledger" className="hover:text-white transition-colors">
              Security
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/login"
              className="font-mono text-sm hidden sm:inline text-white/80 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm px-5 py-2.5 rounded-full text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--moss)" }}
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-28 md:pt-20 md:pb-40">
          <p
            className="font-mono text-xs uppercase tracking-[0.2em] mb-5"
            style={{ color: "var(--gold)" }}
          >
            Payment infrastructure, not a black box
          </p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl md:text-6xl leading-[1.08] mb-6 tracking-tight max-w-2xl text-white">
            Every transfer, booked twice,{" "}
            <span style={{ color: "#9fcbb2" }}>trusted always.</span>
          </h1>
          <p className="text-base md:text-lg max-w-md mb-9 text-white/80">
            WalletX gives businesses of every size one place to accept payments,
            send payouts, and reconcile — backed by a real double-entry ledger
            behind every single transaction.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-full text-white text-sm font-medium transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--moss)" }}
            >
              Create a free account
            </Link>
            <Link
              href="/docs#overview"
              className="px-6 py-3.5 rounded-full text-sm font-medium border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              Read the API docs
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/80">
              <ShieldCheck
                className="w-3.5 h-3.5"
                style={{ color: "#9fcbb2" }}
              />
              Bank-grade security
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/80">
              <CheckCircle2
                className="w-3.5 h-3.5"
                style={{ color: "#9fcbb2" }}
              />
              Settles in NGN
            </span>
          </div>
        </section>
      </div>

      {/* LOGO BAR */}
      <section
        className="border-t border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-center gap-5 md:gap-10">
          <p
            className="font-mono text-xs uppercase tracking-widest whitespace-nowrap"
            style={{ color: "var(--slate)" }}
          >
            Moving money for
          </p>
          <div
            className="flex flex-wrap justify-center md:justify-start items-center gap-x-10 gap-y-5"
            style={{ color: "var(--slate)", opacity: 0.65 }}
          >
            {[
              { name: "Northfield", mark: "square" },
              { name: "Kola Studio", mark: "circle" },
              { name: "Pebble HR", mark: "triangle" },
              { name: "Orimi Goods", mark: "diamond" },
              { name: "Farmline", mark: "bars" },
            ].map(({ name, mark }) => (
              <span
                key={name}
                className="flex items-center gap-2 font-display font-semibold text-lg"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  {mark === "square" && (
                    <rect
                      x="2"
                      y="2"
                      width="14"
                      height="14"
                      rx="3"
                      fill="currentColor"
                    />
                  )}
                  {mark === "circle" && (
                    <circle cx="9" cy="9" r="7" fill="currentColor" />
                  )}
                  {mark === "triangle" && (
                    <path d="M9 2 L16 16 L2 16 Z" fill="currentColor" />
                  )}
                  {mark === "diamond" && (
                    <path d="M9 1 L17 9 L9 17 L1 9 Z" fill="currentColor" />
                  )}
                  {mark === "bars" && (
                    <>
                      <rect
                        x="1"
                        y="9"
                        width="4"
                        height="8"
                        fill="currentColor"
                      />
                      <rect
                        x="7"
                        y="4"
                        width="4"
                        height="13"
                        fill="currentColor"
                      />
                      <rect
                        x="13"
                        y="7"
                        width="4"
                        height="10"
                        fill="currentColor"
                      />
                    </>
                  )}
                </svg>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SEGMENTS */}
      <section
        id="segments"
        className="max-w-6xl mx-auto px-6 md:px-10 py-20 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: "var(--gold)" }}
        >
          Who it's for
        </p>
        <h2 className="font-display font-semibold text-3xl md:text-4xl mb-14 max-w-xl tracking-tight">
          One ledger, however your business gets paid.
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Building2,
              title: "Business",
              body: "Start accepting cards, transfers, and mobile money in a day, no minimum volume required.",
              cta: "Create free account",
              href: "/register",
            },
            {
              icon: User,
              title: "Individual",
              body: "Freelancers and sole traders get paid, hold a balance, and send money out, no company needed.",
              cta: "Get paid faster",
              href: "#",
            },
          ].map(({ icon: Icon, title, body, cta, href }) => (
            <div
              key={title}
              className="rounded-2xl border p-7"
              style={{ borderColor: "var(--line)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "var(--moss)" }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-display font-semibold text-lg mb-2">{title}</p>
              <p className="text-sm mb-5" style={{ color: "var(--slate)" }}>
                {body}
              </p>
              <Link
                href={href}
                className="text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                style={{ color: "var(--moss)" }}
              >
                {cta} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="max-w-6xl mx-auto px-6 md:px-10 py-20 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: "var(--gold)" }}
        >
          How it works
        </p>
        <h2 className="font-display font-semibold text-3xl md:text-4xl mb-10 max-w-xl tracking-tight">
          Three steps between a sale and money you can spend.
        </h2>

        <div className="relative h-16 mb-2 hidden md:block">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 64"
            preserveAspectRatio="none"
          >
            <path
              d="M16.6,10 C33,10 33,54 50,54 C67,54 67,10 83.3,10"
              fill="none"
              style={{
                stroke: "var(--line)",
                strokeWidth: 1.5,
                strokeDasharray: "4 6",
              }}
            />
          </svg>
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: "calc(16.6% - 6px)",
              top: "4px",
              background: "var(--moss)",
            }}
          />
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: "calc(50% - 6px)",
              top: "48px",
              background: "var(--gold)",
            }}
          />
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: "calc(83.3% - 6px)",
              top: "4px",
              background: "var(--moss)",
            }}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Integrate",
              body: "Drop in our SDK or call the REST API directly. Test the full flow in sandbox before a naira moves.",
            },
            {
              title: "Accept",
              body: "Cards, bank transfers, USSD, and mobile money, in one checkout your customers already recognize.",
            },
            {
              title: "Reconcile",
              body: "Every payment lands in your ledger with a before-balance and after-balance. Nothing to chase down.",
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <p
                className="font-display font-semibold text-lg mb-3"
                style={{ color: "var(--moss)" }}
              >
                {title}
              </p>
              <p style={{ color: "var(--slate)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEDGER / TRUST */}
      <section
        id="ledger"
        className="border-b"
        style={{ borderColor: "var(--line)", background: "var(--ink)" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-14 items-center">
          <div style={{ color: "var(--paper)" }}>
            <p
              className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--gold)" }}
            >
              Built on a real ledger
            </p>
            <h2 className="font-display font-semibold text-3xl md:text-4xl mb-5 tracking-tight">
              Every transaction, accounted for twice.
            </h2>
            <p className="max-w-md" style={{ color: "#b9c2bc" }}>
              Most processors just update a number. WalletX books two entries
              for every transaction, one leaving the payer, one arriving in your
              settlement account, in the same instant. When a dispute lands in
              support, you can trace it to the kobo.
            </p>
          </div>

          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: "#3a4b44" }}
          >
            <div
              className="flex items-center justify-between py-4 border-b"
              style={{ borderColor: "#3a4b44" }}
            >
              <div>
                <p className="text-sm text-white">Customer payment</p>
                <p className="text-xs font-mono" style={{ color: "#8c978f" }}>
                  CUS-2291-8804
                </p>
              </div>
              <p className="font-mono text-sm" style={{ color: "#9fcbb2" }}>
                + ₦12,500
              </p>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm text-white">Merchant settlement</p>
                <p className="text-xs font-mono" style={{ color: "#8c978f" }}>
                  MER-4410-1207
                </p>
              </div>
              <p className="font-mono text-sm" style={{ color: "#e3a6a6" }}>
                − ₦12,500
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-6 md:px-10 py-20 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: "var(--gold)" }}
        >
          What you get
        </p>
        <h2 className="font-display font-semibold text-3xl md:text-4xl mb-14 max-w-xl tracking-tight">
          Everything a payment processor should do, nothing it shouldn't.
        </h2>

        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
          {[
            {
              icon: Zap,
              title: "Instant settlement",
              body: "Settle to your bank account the same day, not on a net-30 cycle.",
            },
            {
              icon: CreditCard,
              title: "Every payment channel",
              body: "Cards, bank transfers, USSD, and mobile money, behind one API.",
            },
            {
              icon: Code2,
              title: "Developer-first",
              body: "A REST API, client libraries, and webhooks that don't lie to you.",
            },
            {
              icon: ShieldCheck,
              title: "Built-in risk rules",
              body: "Fraud scoring and velocity limits on by default, tunable per business.",
            },
            {
              icon: Globe,
              title: "Built for Naira",
              body: "Accept and settle every transaction in NGN, with no conversion friction.",
            },
            {
              icon: Users,
              title: "Team roles",
              body: "Give finance, support, and engineering their own scoped access.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <div
                className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                style={{ background: "var(--moss)" }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium mb-1">{title}</p>
                <p style={{ color: "var(--slate)" }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="max-w-6xl mx-auto px-6 md:px-10 py-20 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: "var(--gold)" }}
        >
          Pricing
        </p>
        <h2 className="font-display font-semibold text-3xl md:text-4xl mb-4 max-w-xl tracking-tight">
          One flat rate. No tiers to negotiate.
        </h2>
        <p className="max-w-lg mb-14" style={{ color: "var(--slate)" }}>
          Every transaction costs 1.5%, capped at ₦2,000, however you get paid.
          No setup fees, no monthly minimums, no separate rate for
          &quot;enterprise&quot;.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Building2,
              title: "Business",
              body: "For registered companies accepting cards, transfers, and mobile money.",
              cta: "Create free account",
              href: "/register",
            },
            {
              icon: User,
              title: "Individual",
              body: "For freelancers and sole traders who just need to get paid.",
              cta: "Get paid faster",
              href: "#",
            },
          ].map(({ icon: Icon, title, body, cta, href }) => (
            <div
              key={title}
              className="rounded-2xl border p-7"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--moss)" }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className="flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--paper)",
                    color: "var(--moss-dark)",
                  }}
                >
                  <Percent className="w-3 h-3" />
                  1.5%
                </span>
              </div>
              <p className="font-display font-semibold text-lg mb-2">{title}</p>
              <p className="text-sm mb-4" style={{ color: "var(--slate)" }}>
                {body}
              </p>
              <p
                className="font-mono text-xs mb-5"
                style={{ color: "var(--moss)" }}
              >
                1.5% per transaction · capped at ₦2,000
              </p>
              <Link
                href={href}
                className="text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                style={{ color: "var(--moss)" }}
              >
                {cta} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* DEVELOPERS */}
      <section
        id="developers"
        className="max-w-6xl mx-auto px-6 md:px-10 py-20 border-b grid lg:grid-cols-2 gap-14 items-center"
        style={{ borderColor: "var(--line)" }}
      >
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
            style={{ color: "var(--gold)" }}
          >
            For developers
          </p>
          <h2 className="font-display font-semibold text-3xl md:text-4xl mb-5 tracking-tight max-w-md">
            Three lines to your first payment.
          </h2>
          <p className="max-w-md mb-8" style={{ color: "var(--slate)" }}>
            One endpoint to charge a card, one to verify it, one webhook to know
            it settled. Sandbox keys work the moment you sign up, no waiting on
            approval to start building.
          </p>
          <Link
            href="/docs#charge"
            className="text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
            style={{ color: "var(--moss)" }}
          >
            Read the API reference
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: "var(--moss-dark)" }}
        >
          <div
            className="flex items-center gap-1.5 px-5 py-3 border-b"
            style={{ borderColor: "#2a4438" }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#e3a6a6" }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#c89b3c" }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#9fcbb2" }}
            />
            <span
              className="font-mono text-[11px] ml-3"
              style={{ color: "#8c978f" }}
            >
              charge.js
            </span>
          </div>
          <pre className="font-mono text-[13px] leading-relaxed p-6 overflow-x-auto">
            <code>
              <span style={{ color: "#8c978f" }}>// create a charge</span>
              {"\n"}
              <span style={{ color: "#9fcbb2" }}>const</span>{" "}
              <span style={{ color: "#f6f2e7" }}>charge</span>{" "}
              <span style={{ color: "#9fcbb2" }}>=</span>{" "}
              <span style={{ color: "#9fcbb2" }}>await</span>{" "}
              <span style={{ color: "#f6f2e7" }}>walletx</span>.
              <span style={{ color: "#c89b3c" }}>charges</span>.
              <span style={{ color: "#c89b3c" }}>create</span>({"{"}
              {"\n  "}
              <span style={{ color: "#8c978f" }}>amount:</span>{" "}
              <span style={{ color: "#e3a6a6" }}>1284000</span>,{"\n  "}
              <span style={{ color: "#8c978f" }}>currency:</span>{" "}
              <span style={{ color: "#e3a6a6" }}>&quot;NGN&quot;</span>,{"\n  "}
              <span style={{ color: "#8c978f" }}>customer:</span>{" "}
              <span style={{ color: "#e3a6a6" }}>&quot;cus_2291&quot;</span>,
              {"\n  "}
              <span style={{ color: "#8c978f" }}>channel:</span>{" "}
              <span style={{ color: "#e3a6a6" }}>&quot;card&quot;</span>,{"\n"}
              {"});"}
              {"\n\n"}
              <span style={{ color: "#8c978f" }}>
                {
                  '// { success: true, data: { reference: "TXN-88410", status: "success" } }'
                }
              </span>
            </code>
          </pre>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section
        className="max-w-6xl mx-auto px-6 md:px-10 py-20 border-b grid md:grid-cols-2 gap-12 items-center"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="rounded-3xl overflow-hidden shadow-xl aspect-5/4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?fm=jpg&q=80&w=1200&auto=format&fit=crop"
            alt="Business owner reviewing payments on a laptop"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
            style={{ color: "var(--gold)" }}
          >
            Real businesses
          </p>
          <p className="font-display font-medium text-2xl md:text-3xl leading-snug mb-6 tracking-tight">
            &quot;We stopped closing the books at month-end and started closing
            them every night. The ledger just matches.&quot;
          </p>
          <p className="text-sm" style={{ color: "var(--slate)" }}>
            <span className="font-medium" style={{ color: "var(--ink)" }}>
              Ada Okonkwo
            </span>{" "}
            · Finance lead, Kola Studio
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="max-w-6xl mx-auto px-6 md:px-10 py-24 text-center"
      >
        <h2 className="font-display font-semibold text-3xl md:text-5xl mb-6 tracking-tight">
          Ready when you are.
        </h2>
        <p className="max-w-md mx-auto mb-9" style={{ color: "var(--slate)" }}>
          Creating an account takes less time than reading this page did. Your
          first API key is waiting.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="inline-block px-8 py-4 rounded-full text-white text-sm font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--moss)" }}
          >
            Create a free account
          </Link>
          <a
            href="#"
            className="inline-block px-8 py-4 rounded-full text-sm font-medium border transition-colors hover:bg-(--ink) hover:text-white"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          >
            Talk to sales
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t"
        style={{ borderColor: "var(--line)", background: "#efe9d9" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-2">
              <span
                className="font-display font-semibold text-xl"
                style={{ color: "var(--moss-dark)" }}
              >
                <Image
                  src="/logo.png"
                  alt="WalletX"
                  width={140}
                  height={40}
                  unoptimized
                  className="h-12 w-auto"
                />
              </span>
              <p
                className="mt-3 text-sm max-w-55"
                style={{ color: "var(--slate)" }}
              >
                Payment infrastructure built on a real ledger, not a
                spreadsheet.
              </p>
            </div>
            <div>
              <p
                className="font-mono text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--gold)" }}
              >
                Product
              </p>
              <ul
                className="space-y-2.5 text-sm"
                style={{ color: "var(--slate)" }}
              >
                <li>
                  <a
                    href="#segments"
                    className="hover:text-(--ink) transition-colors"
                  >
                    Business
                  </a>
                </li>
                <li>
                  <a
                    href="#segments"
                    className="hover:text-(--ink) transition-colors"
                  >
                    Individual
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-(--ink) transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p
                className="font-mono text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--gold)" }}
              >
                Developers
              </p>
              <ul
                className="space-y-2.5 text-sm"
                style={{ color: "var(--slate)" }}
              >
                <li>
                  <Link
                    href="/docs#overview"
                    className="hover:text-(--ink) transition-colors"
                  >
                    API reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#webhooks"
                    className="hover:text-(--ink) transition-colors"
                  >
                    Webhooks
                  </Link>
                </li>
                <li>
                  <a
                    href="#ledger"
                    className="hover:text-(--ink) transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p
                className="font-mono text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--gold)" }}
              >
                Company
              </p>
              <ul
                className="space-y-2.5 text-sm"
                style={{ color: "var(--slate)" }}
              >
                <li>
                  <a href="#" className="hover:text-(--ink) transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-(--ink) transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-(--ink) transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div
            className="pt-6 border-t flex items-center justify-center text-xs font-mono"
            style={{ borderColor: "var(--line)", color: "var(--slate)" }}
          >
            <span>© 2026 WalletX. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
