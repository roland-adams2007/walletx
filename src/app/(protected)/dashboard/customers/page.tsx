"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  X,
  Copy,
  Check,
  ChevronRight,
  SearchX,
} from "lucide-react";
import "./customer.css";

type Transaction = {
  price: number;
  channel: string;
  date: string;
};

type Customer = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  addedOn: string;
  totalTx: number;
  successfulTx: number;
  totalSpent: number;
  transactions: Transaction[];
};

const initialCustomers: Customer[] = [
  {
    id: "c1",
    email: "kolawolerofiata@gmail.com",
    firstname: "",
    lastname: "",
    phone: "",
    addedOn: "Jul 23, 2026",
    totalTx: 12,
    successfulTx: 11,
    totalSpent: 184500,
    transactions: [
      { price: 12500, channel: "Card", date: "Jul 22, 2026" },
      { price: 8000, channel: "Bank Transfer", date: "Jul 19, 2026" },
      { price: 45000, channel: "Card", date: "Jul 15, 2026" },
      { price: 6200, channel: "USSD", date: "Jul 10, 2026" },
      { price: 30000, channel: "Card", date: "Jul 4, 2026" },
    ],
  },
  {
    id: "c2",
    email: "ww8615929@gmail.com",
    firstname: "Wale",
    lastname: "Williams",
    phone: "8031234567",
    addedOn: "Jul 18, 2026",
    totalTx: 5,
    successfulTx: 5,
    totalSpent: 62000,
    transactions: [
      { price: 22000, channel: "Card", date: "Jul 17, 2026" },
      { price: 15000, channel: "Bank Transfer", date: "Jul 14, 2026" },
      { price: 25000, channel: "Card", date: "Jul 9, 2026" },
    ],
  },
  {
    id: "c3",
    email: "isyakanafisa8@gmail.com",
    firstname: "Isyaka",
    lastname: "Nafisa",
    phone: "8123456789",
    addedOn: "Jul 18, 2026",
    totalTx: 3,
    successfulTx: 2,
    totalSpent: 18000,
    transactions: [
      { price: 9000, channel: "USSD", date: "Jul 16, 2026" },
      { price: 9000, channel: "Card", date: "Jul 12, 2026" },
    ],
  },
  {
    id: "c4",
    email: "mtanimu442@gmail.com",
    firstname: "",
    lastname: "",
    phone: "",
    addedOn: "Jul 18, 2026",
    totalTx: 0,
    successfulTx: 0,
    totalSpent: 0,
    transactions: [],
  },
  {
    id: "c5",
    email: "egwudalejubril@gmail.com",
    firstname: "Jubril",
    lastname: "Egwudale",
    phone: "9021234567",
    addedOn: "Jul 18, 2026",
    totalTx: 8,
    successfulTx: 7,
    totalSpent: 96500,
    transactions: [
      { price: 12000, channel: "Card", date: "Jul 17, 2026" },
      { price: 8500, channel: "Bank Transfer", date: "Jul 15, 2026" },
      { price: 20000, channel: "Card", date: "Jul 11, 2026" },
      { price: 6000, channel: "USSD", date: "Jul 8, 2026" },
      { price: 15000, channel: "Card", date: "Jul 2, 2026" },
    ],
  },
  {
    id: "c6",
    email: "adebayoazeez026@gmail.com",
    firstname: "Azeez",
    lastname: "Adebayo",
    phone: "8091234567",
    addedOn: "Jul 18, 2026",
    totalTx: 1,
    successfulTx: 1,
    totalSpent: 4000,
    transactions: [{ price: 4000, channel: "Card", date: "Jul 17, 2026" }],
  },
  {
    id: "c7",
    email: "juniorjohnson457@gmail.com",
    firstname: "",
    lastname: "",
    phone: "",
    addedOn: "Jul 18, 2026",
    totalTx: 0,
    successfulTx: 0,
    totalSpent: 0,
    transactions: [],
  },
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
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

  const activeCustomer =
    customers.find((c) => c.id === activeCustomerId) || null;

  const filteredCustomers = customers.filter((c) =>
    c.email.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function openPanel(customer: Customer) {
    setActiveCustomerId(customer.id);
    setEditFirstname(customer.firstname);
    setEditLastname(customer.lastname);
    setEditPhone(customer.phone);
    setCopied(false);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setActiveCustomerId(null);
  }

  function handleSaveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCustomerId) return;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === activeCustomerId
          ? {
              ...c,
              firstname: editFirstname.trim(),
              lastname: editLastname.trim(),
              phone: editPhone.trim(),
            }
          : c,
      ),
    );
    closePanel();
  }

  async function handleCopyEmail() {
    if (!activeCustomer) return;
    try {
      await navigator.clipboard.writeText(activeCustomer.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  function handleViewAllTransactions() {
    if (!activeCustomerId) return;
    window.location.href =
      "/transactions?customer=" + encodeURIComponent(activeCustomerId);
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

  function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    const newCustomer: Customer = {
      id: "c" + (customers.length + 1) + "_" + Date.now(),
      email: addEmail.trim(),
      firstname: addFirstname.trim(),
      lastname: addLastname.trim(),
      phone: addPhone.trim(),
      addedOn: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      totalTx: 0,
      successfulTx: 0,
      totalSpent: 0,
      transactions: [],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    closeAddModal();
  }

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
            className="input-field w-full pl-10 pr-3.5 py-2.5 rounded-lg text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              {filteredCustomers.map((c) => {
                const fullName =
                  c.firstname || c.lastname
                    ? `${c.firstname} ${c.lastname}`.trim()
                    : "";
                return (
                  <tr key={c.id} onClick={() => openPanel(c)}>
                    <td>
                      <span className="status-dot"></span>
                    </td>
                    <td>{c.email}</td>
                    <td style={fullName ? {} : { color: "var(--muted)" }}>
                      {fullName || "No Name"}
                    </td>
                    <td style={c.phone ? {} : { color: "var(--muted)" }}>
                      {c.phone ? `+234 ${c.phone}` : "No Phone Number"}
                    </td>
                    <td>{c.addedOn}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <SearchX className="w-8 h-8" style={{ color: "var(--muted)" }} />
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Try a different email search
            </p>
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

        {activeCustomer && (
          <div className="px-6 py-6 space-y-6">
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
                    value={activeCustomer.email}
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
                className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white"
              >
                Save changes
              </button>
            </form>

            <div className="grid grid-cols-2 gap-3">
              <div className="card rounded-xl p-4">
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Successful / Total
                </p>
                <p className="font-mono text-lg font-semibold">
                  {activeCustomer.successfulTx} / {activeCustomer.totalTx}
                </p>
              </div>
              <div className="card rounded-xl p-4">
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Total spent
                </p>
                <p className="font-mono text-lg font-semibold">
                  {formatNaira(activeCustomer.totalSpent)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Recent transactions</h4>
              </div>
              <div className="space-y-2">
                {activeCustomer.transactions.length === 0 ? (
                  <p
                    className="text-sm py-6 text-center"
                    style={{ color: "var(--muted)" }}
                  >
                    No transactions yet
                  </p>
                ) : (
                  activeCustomer.transactions.slice(0, 5).map((t, i) => (
                    <div
                      key={i}
                      className="tx-row flex items-center justify-between px-3.5 py-2.5 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium font-mono">
                          {formatNaira(t.price)}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted)" }}
                        >
                          {t.channel}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {t.date}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <button
                className="btn-secondary w-full mt-3 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                onClick={handleViewAllTransactions}
              >
                View all transactions
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
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
                className="btn-primary flex-1 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
              >
                Add customer
              </button>
              <button
                type="button"
                className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium"
                onClick={closeAddModal}
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
