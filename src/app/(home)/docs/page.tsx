"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  BookOpen,
  KeyRound,
  CreditCard,
  ArrowRightCircle,
  Zap,
  CheckCircle2,
  Webhook,
  AlertTriangle,
  FlaskConical,
  Info,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import "./docs.css";

type CodeTab = {
  label: string;
  code: string;
};

type ParamRow = {
  field: string;
  type: string;
  required: boolean;
  description: string;
};

const NAV = [
  {
    heading: "Getting Started",
    items: [
      { id: "overview", label: "Overview", icon: BookOpen },
      { id: "authentication", label: "Authentication", icon: KeyRound },
    ],
  },
  {
    heading: "Payments",
    items: [
      { id: "popup", label: "Popup (Inline)", icon: CreditCard },
      { id: "redirect", label: "Redirect", icon: ArrowRightCircle },
      { id: "charge", label: "Charge API", icon: Zap },
      { id: "verify", label: "Verify Payments", icon: CheckCircle2 },
    ],
  },
  {
    heading: "Reference",
    items: [
      { id: "webhooks", label: "Webhooks", icon: Webhook },
      { id: "errors", label: "Errors", icon: AlertTriangle },
      { id: "test-mode", label: "Test Mode", icon: FlaskConical },
    ],
  },
];

const TOC = NAV.flatMap((group) => group.items);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

function MethodBadge({ method }: { method: "POST" | "GET" | "DELETE" }) {
  const cls =
    method === "POST"
      ? "wxd-method wxd-method-post"
      : method === "GET"
        ? "wxd-method wxd-method-get"
        : "wxd-method wxd-method-delete";
  return <span className={cls}>{method}</span>;
}

function Endpoint({
  method,
  path,
}: {
  method: "POST" | "GET" | "DELETE";
  path: string;
}) {
  return (
    <div className="wxd-endpoint">
      <MethodBadge method={method} />
      <span className="wxd-path font-mono">{path}</span>
    </div>
  );
}

function ParamsTable({ rows }: { rows: ParamRow[] }) {
  return (
    <div className="wxd-table-wrap">
      <table className="wxd-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.field}>
              <td className="wxd-field font-mono">{row.field}</td>
              <td className="wxd-type font-mono">{row.type}</td>
              <td>
                <span
                  className={
                    row.required ? "wxd-req wxd-req-yes" : "wxd-req wxd-req-no"
                  }
                >
                  {row.required ? "Required" : "Optional"}
                </span>
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <button className="wxd-copy-btn" onClick={handleCopy} type="button">
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="wxd-code-tabs">
      <div className="wxd-code-tab-list">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            className={
              index === active ? "wxd-code-tab active" : "wxd-code-tab"
            }
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="wxd-code-body">
        <CopyButton text={tabs[active].code} />
        <pre>
          <code className="font-mono">{tabs[active].code}</code>
        </pre>
      </div>
    </div>
  );
}

function Callout({
  title,
  children,
  variant = "info",
}: {
  title: string;
  children: React.ReactNode;
  variant?: "info" | "warn";
}) {
  const Icon = variant === "warn" ? ShieldAlert : Info;
  return (
    <div
      className={
        variant === "warn" ? "wxd-callout wxd-callout-warn" : "wxd-callout"
      }
    >
      <div className="wxd-callout-icon">
        <Icon />
      </div>
      <div>
        <p className="wxd-callout-title font-mono">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    TOC.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="wxd-root">
      <div className="wxd-topbar">
        <div className="wxd-topbar-inner">
          <button
            className="wxd-menu-btn"
            type="button"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={18} />
          </button>
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
          <span className="wxd-logo-divider" />
          <span className="wxd-logo-tag font-mono">docs</span>
          <div className="wxd-topbar-cta">
            <Link href="/register" className="wxd-btn-signup">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div
          className="wxd-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            className="wxd-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <button
                className="wxd-menu-btn"
                type="button"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav
              activeSection={activeSection}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="wxd-shell">
        <aside className="wxd-sidebar">
          <SidebarNav activeSection={activeSection} />
        </aside>

        <main className="wxd-content">
          <p className="wxd-eyebrow font-mono">Payments</p>
          <h1 className="wxd-h1 font-display" id="overview">
            Accept Payments
          </h1>
          <p className="wxd-lede">
            WalletX lets you collect money from customers through a hosted
            checkout page, an in-page popup, or a direct redirect flow. Every
            method runs through the same transaction record, so verification,
            webhooks, and reporting behave the same way no matter how the
            customer paid.
          </p>

          <Callout title="In a nutshell">
            <p>
              Create a transaction from your backend or your frontend, send the
              customer to pay, then confirm the outcome with the Verify endpoint
              or a webhook. Every transaction carries a reference and an access
              code that identify it everywhere in the API.
            </p>
          </Callout>

          <section className="wxd-section" id="authentication">
            <h2 className="wxd-h2 font-display">Authentication</h2>
            <p className="wxd-p">
              WalletX uses two kinds of API keys, both available from your
              dashboard under <code>Settings → API Keys</code>. Use the right
              key for the right side of your integration — mixing them up is the
              most common integration error.
            </p>
            <div className="wxd-table-wrap">
              <table className="wxd-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Prefix</th>
                    <th>Where it's used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="wxd-field font-mono">Secret key</td>
                    <td className="wxd-type font-mono">sk_live_...</td>
                    <td>
                      Server-side only. Sent as{" "}
                      <code>Authorization: Bearer sk_live_xxxxxx</code> when
                      initializing a Redirect transaction or verifying a
                      payment. Never expose this in frontend code.
                    </td>
                  </tr>
                  <tr>
                    <td className="wxd-field font-mono">Public key</td>
                    <td className="wxd-type font-mono">pk_live_...</td>
                    <td>
                      Safe to expose in the browser. Used by the Popup library
                      and the <code>key</code> field on the Inline initialize
                      endpoint.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Callout title="Keep secret keys server-side" variant="warn">
              <p>
                Any request signed with a secret key must originate from your
                backend. If a secret key ever ends up in a repository or a
                frontend bundle, rotate it from the dashboard immediately.
              </p>
            </Callout>
          </section>

          <section className="wxd-section" id="popup">
            <h2 className="wxd-h2 font-display">Popup (Inline)</h2>
            <p className="wxd-p">
              The Popup is a small Javascript library that opens a payment modal
              directly on your page, without redirecting the customer away. It
              calls the Inline initialize endpoint for you and resolves with the
              outcome once the customer finishes paying.
            </p>
            <div className="wxd-badge-row">
              <span className="wxd-badge wxd-badge-brand">
                <CheckCircle2 /> No backend call required
              </span>
              <span className="wxd-badge wxd-badge-amber">
                <CreditCard /> Card and bank transfer
              </span>
            </div>

            <h3 className="wxd-h3 font-display">1. Load the library</h3>
            <CodeTabs
              tabs={[
                {
                  label: "HTML",
                  code: '<script src="https://js.walletx.africa/v1/gateway.js"></script>',
                },
              ]}
            />

            <h3 className="wxd-h3 font-display">2. Open the modal</h3>
            <p className="wxd-p">
              Generate a unique reference on your own page, then pass your
              public key and the transaction details to{" "}
              <code>WalletXGateway.setup()</code>.
            </p>
            <CodeTabs
              tabs={[
                {
                  label: "Javascript",
                  code: [
                    "const handler = WalletXGateway.setup({",
                    "  key: 'pk_live_5f2a9c1d0b3e',",
                    "  email: 'ada@kolastudio.com',",
                    "  amount: 500000,",
                    "  firstname: 'Ada',",
                    "  lastname: 'Okonkwo',",
                    "  reference: 'TXN-' + Date.now(),",
                    "  callback: function (response) {",
                    "    console.log(response.reference, response.status);",
                    "  },",
                    "  onClose: function () {",
                    "    console.log('Customer closed the payment window');",
                    "  },",
                    "});",
                    "",
                    "handler.openModal();",
                  ].join("\n"),
                },
              ]}
            />

            <h3 className="wxd-h3 font-display">Setup parameters</h3>
            <ParamsTable
              rows={[
                {
                  field: "key",
                  type: "string",
                  required: true,
                  description: "Your public key, pk_live_...",
                },
                {
                  field: "email",
                  type: "string",
                  required: true,
                  description: "The customer's email address.",
                },
                {
                  field: "amount",
                  type: "integer",
                  required: true,
                  description: "Amount to charge, in kobo.",
                },
                {
                  field: "firstname",
                  type: "string",
                  required: true,
                  description: "Customer's first name.",
                },
                {
                  field: "lastname",
                  type: "string",
                  required: true,
                  description: "Customer's last name.",
                },
                {
                  field: "reference",
                  type: "string",
                  required: true,
                  description:
                    "A reference you generate. Must be unique per transaction.",
                },
                {
                  field: "callback",
                  type: "function",
                  required: true,
                  description:
                    "Called with the transaction outcome once payment completes.",
                },
                {
                  field: "onClose",
                  type: "function",
                  required: false,
                  description:
                    "Called when the customer closes the modal before paying.",
                },
                {
                  field: "onError",
                  type: "function",
                  required: false,
                  description:
                    "Called if the transaction could not be started.",
                },
              ]}
            />
          </section>

          <section className="wxd-section" id="redirect">
            <h2 className="wxd-h2 font-display">Redirect</h2>
            <p className="wxd-p">
              The Redirect flow is entirely backend-driven. Create a transaction
              from your server with your secret key, then send the customer to
              the returned <code>authorization_url</code>. WalletX hosts the
              checkout page, collects payment, and sends the customer back to
              your <code>callback_url</code>.
            </p>

            <h3 className="wxd-h3 font-display">Initialize a transaction</h3>
            <Endpoint
              method="POST"
              path="/api/transaction/initialize/redirect"
            />
            <p className="wxd-p">
              Requires <code>Authorization: Bearer sk_live_xxxxxx</code>.
            </p>
            <ParamsTable
              rows={[
                {
                  field: "email",
                  type: "string",
                  required: true,
                  description: "The customer's email address.",
                },
                {
                  field: "amount",
                  type: "number",
                  required: true,
                  description: "Amount to charge, in kobo.",
                },
                {
                  field: "reference",
                  type: "string",
                  required: true,
                  description:
                    "A reference you generate. Must be unique per business.",
                },
                {
                  field: "callback_url",
                  type: "string",
                  required: true,
                  description:
                    "Where the customer is sent after paying, cancelling, or a failure.",
                },
                {
                  field: "metadata",
                  type: "object",
                  required: false,
                  description:
                    "Any extra data you want attached to the transaction.",
                },
                {
                  field: "firstname",
                  type: "string",
                  required: false,
                  description: "Customer's first name.",
                },
                {
                  field: "lastname",
                  type: "string",
                  required: false,
                  description: "Customer's last name.",
                },
              ]}
            />
            <CodeTabs
              tabs={[
                {
                  label: "cURL",
                  code: [
                    `curl ${API_BASE_URL}/api/transaction/initialize/redirect \\`,
                    '  -H "Authorization: Bearer sk_live_5f2a9c1d0b3e..." \\',
                    '  -H "Content-Type: application/json" \\',
                    "  -d '{",
                    '    "email": "ada@kolastudio.com",',
                    '    "amount": 500000,',
                    '    "reference": "TXN-88410",',
                    '    "callback_url": "https://kolastudio.com/orders/complete"',
                    "  }'",
                  ].join("\n"),
                },
                {
                  label: "Node.js",
                  code: [
                    `const response = await fetch('${API_BASE_URL}/api/transaction/initialize/redirect', {`,
                    "  method: 'POST',",
                    "  headers: {",
                    "    Authorization: 'Bearer sk_live_5f2a9c1d0b3e...',",
                    "    'Content-Type': 'application/json',",
                    "  },",
                    "  body: JSON.stringify({",
                    "    email: 'ada@kolastudio.com',",
                    "    amount: 500000,",
                    "    reference: 'TXN-88410',",
                    "    callback_url: 'https://kolastudio.com/orders/complete',",
                    "  }),",
                    "});",
                    "",
                    "const data = await response.json();",
                  ].join("\n"),
                },
                {
                  label: "PHP",
                  code: [
                    "$response = Http::withToken('sk_live_5f2a9c1d0b3e...')->post(",
                    `  '${API_BASE_URL}/api/transaction/initialize/redirect',`,
                    "  [",
                    "    'email' => 'ada@kolastudio.com',",
                    "    'amount' => 500000,",
                    "    'reference' => 'TXN-88410',",
                    "    'callback_url' => 'https://kolastudio.com/orders/complete',",
                    "  ]",
                    ");",
                  ].join("\n"),
                },
              ]}
            />
            <h3 className="wxd-h3 font-display">Response</h3>
            <CodeTabs
              tabs={[
                {
                  label: "200 OK",
                  code: [
                    "{",
                    '  "status": true,',
                    '  "message": "Authorization URL created",',
                    '  "data": {',
                    `    "authorization_url": "${API_BASE_URL}/checkout/8gT1kLp0mZ...",`,
                    '    "access_code": "8gT1kLp0mZ...",',
                    '    "reference": "TXN-88410"',
                    "  }",
                    "}",
                  ].join("\n"),
                },
              ]}
            />

            <h3 className="wxd-h3 font-display">Send the customer to pay</h3>
            <p className="wxd-p">
              Redirect the browser to <code>authorization_url</code>. The
              customer picks card or bank transfer on the hosted page, and can
              cancel from there too.
            </p>

            <h3 className="wxd-h3 font-display">Handle the callback</h3>
            <p className="wxd-p">
              Once the customer pays or the payment fails, they're sent back to
              your <code>callback_url</code> with the outcome appended as query
              parameters. Pending transfers do not redirect immediately — rely
              on a webhook or the Verify endpoint to confirm those.
            </p>
            <ParamsTable
              rows={[
                {
                  field: "reference",
                  type: "string",
                  required: true,
                  description:
                    "The reference you supplied when initializing the transaction.",
                },
                {
                  field: "status",
                  type: "string",
                  required: true,
                  description: "success or failed.",
                },
              ]}
            />

            <h3 className="wxd-h3 font-display">Cancel a transaction</h3>
            <Endpoint method="DELETE" path="/checkout/{access_code}/cancel" />
            <p className="wxd-p">
              Called from the hosted checkout page when a customer backs out.
              Marks the transaction as abandoned and returns the merchant's{" "}
              <code>callback_url</code> so the page can redirect. Only works
              while the transaction is still pending.
            </p>
          </section>

          <section className="wxd-section" id="charge">
            <h2 className="wxd-h2 font-display">Charge API</h2>
            <p className="wxd-p">
              The Popup and the hosted checkout page both call this endpoint
              internally to settle a transaction. Most integrations never need
              to call it directly, but it's available if you're building your
              own payment form.
            </p>
            <Endpoint method="POST" path="/api/payments/charge" />
            <p className="wxd-p">
              Requires either <code>public_key</code> or{" "}
              <code>access_code</code> to identify the transaction.
            </p>
            <ParamsTable
              rows={[
                {
                  field: "reference",
                  type: "string",
                  required: true,
                  description: "The transaction reference.",
                },
                {
                  field: "public_key",
                  type: "string",
                  required: false,
                  description:
                    "Your public key. Required if access_code is omitted.",
                },
                {
                  field: "access_code",
                  type: "string",
                  required: false,
                  description:
                    "The transaction's access code. Required if public_key is omitted.",
                },
                {
                  field: "channel",
                  type: "string",
                  required: true,
                  description: "card or bank_transfer.",
                },
                {
                  field: "card_number",
                  type: "string",
                  required: false,
                  description: "Required when channel is card.",
                },
                {
                  field: "expiry_month",
                  type: "string",
                  required: false,
                  description:
                    "Two-digit expiry month. Required when channel is card.",
                },
                {
                  field: "expiry_year",
                  type: "string",
                  required: false,
                  description:
                    "Two-digit expiry year. Required when channel is card.",
                },
                {
                  field: "cvv",
                  type: "string",
                  required: false,
                  description:
                    "Three-digit CVV. Required when channel is card.",
                },
                {
                  field: "simulate",
                  type: "string",
                  required: false,
                  description: "success, failed, or pending. Test mode only.",
                },
              ]}
            />
            <CodeTabs
              tabs={[
                {
                  label: "cURL",
                  code: [
                    `curl ${API_BASE_URL}/api/payments/charge \\`,
                    '  -H "Content-Type: application/json" \\',
                    "  -d '{",
                    '    "access_code": "8gT1kLp0mZ...",',
                    '    "reference": "TXN-88410",',
                    '    "channel": "card",',
                    '    "card_number": "4242424242424242",',
                    '    "expiry_month": "12",',
                    '    "expiry_year": "30",',
                    '    "cvv": "123",',
                    '    "simulate": "success"',
                    "  }'",
                  ].join("\n"),
                },
              ]}
            />
          </section>

          <section className="wxd-section" id="verify">
            <h2 className="wxd-h2 font-display">Verify Payments</h2>
            <p className="wxd-p">
              Always confirm a transaction's status from your backend before you
              fulfil an order — never trust a frontend callback alone.
            </p>
            <Endpoint method="GET" path="/api/payments/verify/{reference}" />
            <p className="wxd-p">
              Requires <code>Authorization: Bearer sk_live_xxxxxx</code>.
            </p>
            <CodeTabs
              tabs={[
                {
                  label: "cURL",
                  code: [
                    `curl ${API_BASE_URL}/api/payments/verify/TXN-88410 \\`,
                    '  -H "Authorization: Bearer sk_live_5f2a9c1d0b3e..."',
                  ].join("\n"),
                },
                {
                  label: "Node.js",
                  code: [
                    "const response = await fetch(",
                    `  '${API_BASE_URL}/api/payments/verify/TXN-88410',`,
                    "  { headers: { Authorization: 'Bearer sk_live_5f2a9c1d0b3e...' } },",
                    ");",
                    "",
                    "const data = await response.json();",
                  ].join("\n"),
                },
              ]}
            />
            <h3 className="wxd-h3 font-display">Response</h3>
            <CodeTabs
              tabs={[
                {
                  label: "200 OK",
                  code: [
                    "{",
                    '  "success": true,',
                    '  "message": "Transaction retrieved",',
                    '  "data": {',
                    '    "reference": "TXN-88410",',
                    '    "amount": 5000,',
                    '    "status": "success",',
                    '    "channel": "card",',
                    '    "gateway_response": "Approved",',
                    '    "paid_at": "2026-08-11T10:42:03+01:00"',
                    "  }",
                    "}",
                  ].join("\n"),
                },
              ]}
            />
          </section>

          <section className="wxd-section" id="webhooks">
            <h2 className="wxd-h2 font-display">Webhooks</h2>
            <p className="wxd-p">
              Configure a webhook URL from <code>Settings → API Keys</code> and
              WalletX will notify it whenever a transaction's status changes.
              Webhooks are the most reliable way to know about pending bank
              transfers that settle later.
            </p>
            <div className="wxd-table-wrap">
              <table className="wxd-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Fired when</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="wxd-field font-mono">charge.success</td>
                    <td>A transaction is marked as successful.</td>
                  </tr>
                  <tr>
                    <td className="wxd-field font-mono">charge.failed</td>
                    <td>A transaction fails, is declined, or expires.</td>
                  </tr>
                  <tr>
                    <td className="wxd-field font-mono">charge.pending</td>
                    <td>A bank transfer is awaiting confirmation.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="wxd-h3 font-display">Payload</h3>
            <CodeTabs
              tabs={[
                {
                  label: "charge.success",
                  code: [
                    "{",
                    '  "event": "charge.success",',
                    '  "data": {',
                    '    "reference": "TXN-88410",',
                    '    "sub_amount": 5000,',
                    '    "fee": 37.5,',
                    '    "amount": 5000,',
                    '    "net_amount": 4962.5,',
                    '    "status": "success",',
                    '    "channel": "card",',
                    '    "gateway_response": "Approved",',
                    '    "paid_at": "2026-08-11T10:42:03+01:00",',
                    '    "customer_email": "ada@kolastudio.com"',
                    "  }",
                    "}",
                  ].join("\n"),
                },
              ]}
            />
            <p className="wxd-p">
              Every webhook request carries an <code>X-WalletX-Signature</code>{" "}
              header, an HMAC-SHA512 hash of the request body signed with your
              secret key. Recompute the hash on your end and compare it before
              trusting the payload.
            </p>
          </section>

          <section className="wxd-section" id="errors">
            <h2 className="wxd-h2 font-display">Errors</h2>
            <p className="wxd-p">
              Every error response follows the same shape, whether it came from
              validation, a missing resource, or a business rule.
            </p>
            <CodeTabs
              tabs={[
                {
                  label: "Error shape",
                  code: [
                    "{",
                    '  "success": false,',
                    '  "message": "This reference has already been used and cannot be reinitialised. Use a new reference."',
                    "}",
                  ].join("\n"),
                },
              ]}
            />
            <div className="wxd-table-wrap">
              <table className="wxd-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="wxd-field font-mono">401</td>
                    <td>Missing, malformed, or invalid API key.</td>
                  </tr>
                  <tr>
                    <td className="wxd-field font-mono">403</td>
                    <td>The business tied to the key is not active.</td>
                  </tr>
                  <tr>
                    <td className="wxd-field font-mono">404</td>
                    <td>
                      The transaction, reference, or access code doesn't exist.
                    </td>
                  </tr>
                  <tr>
                    <td className="wxd-field font-mono">409</td>
                    <td>
                      The reference has already been used, or belongs to another
                      business.
                    </td>
                  </tr>
                  <tr>
                    <td className="wxd-field font-mono">422</td>
                    <td>
                      Validation failed, the transaction expired, or the charge
                      was declined.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="wxd-section" id="test-mode">
            <h2 className="wxd-h2 font-display">Test Mode</h2>
            <p className="wxd-p">
              Every transaction you create can be settled with a simulated
              outcome by passing <code>simulate</code> to the Charge API — the
              Popup and the hosted checkout page use the exact same parameter
              behind their outcome buttons.
            </p>
            <ParamsTable
              rows={[
                {
                  field: "simulate: success",
                  type: "string",
                  required: false,
                  description: "Marks the transaction successful immediately.",
                },
                {
                  field: "simulate: pending",
                  type: "string",
                  required: false,
                  description:
                    "Leaves the transaction pending, for testing bank transfer flows.",
                },
                {
                  field: "simulate: failed",
                  type: "string",
                  required: false,
                  description:
                    "Marks the transaction failed with a simulated decline.",
                },
              ]}
            />
            <p className="wxd-p">
              For card payments, use <code>4242 4242 4242 4242</code> with any
              future expiry date and any 3-digit CVV. No real card is ever
              charged in test mode.
            </p>
          </section>

          <div className="wxd-next-grid">
            <a className="wxd-next-card" href="#redirect">
              <span className="wxd-next-card-label font-mono">Guide</span>
              <span className="wxd-next-card-title">
                Set up the Redirect flow <ArrowRight />
              </span>
            </a>
            <a className="wxd-next-card" href="#webhooks">
              <span className="wxd-next-card-label font-mono">Reference</span>
              <span className="wxd-next-card-title">
                Listen for webhooks <ArrowRight />
              </span>
            </a>
          </div>

          <div className="wxd-footer-note">
            <span>Was this page helpful?</span>
            <Link href="/support">Talk to support</Link>
          </div>
        </main>

        <aside className="wxd-toc">
          <p className="wxd-toc-heading font-mono">On this page</p>
          {TOC.map((item) => (
            <a
              key={item.id}
              href={"#" + item.id}
              className={
                activeSection === item.id
                  ? "wxd-toc-link active"
                  : "wxd-toc-link"
              }
            >
              {item.label}
            </a>
          ))}
        </aside>
      </div>
    </div>
  );
}

function SidebarNav({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV.map((group) => (
        <div className="wxd-sidebar-group" key={group.heading}>
          <p className="wxd-sidebar-heading font-mono">{group.heading}</p>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={"#" + item.id}
                onClick={onNavigate}
                className={
                  activeSection === item.id
                    ? "wxd-sidebar-link active"
                    : "wxd-sidebar-link"
                }
              >
                <Icon />
                {item.label}
              </a>
            );
          })}
        </div>
      ))}
    </>
  );
}
