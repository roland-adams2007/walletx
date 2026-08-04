"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Eye, EyeOff, X, Loader2 } from "lucide-react";
import { useApiKeyStore } from "@/app/stores/store";
import { useBusinessStore } from "@/app/stores/store";
import { useAlert } from "../../../../lib/alert-context";

export default function ApiKeysPage() {
  const { showAlert } = useAlert();
  const { selectedBusinessId } = useBusinessStore();
  const {
    apiKey,
    isLoading,
    isRotating,
    isUpdatingWebhook,
    isUpdatingIpWhitelist,
    fetchApiKeys,
    rotateApiKey,
    updateWebhook,
    updateIpWhitelist,
  } = useApiKeyStore();

  const [secretRevealed, setSecretRevealed] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [ips, setIps] = useState<string[]>([]);
  const [ipInput, setIpInput] = useState("");
  const [ipError, setIpError] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (selectedBusinessId) fetchApiKeys(selectedBusinessId);
  }, [selectedBusinessId, fetchApiKeys]);

  useEffect(() => {
    if (apiKey) {
      setIps(apiKey.ip_whitelist ?? []);
      setWebhookUrl(apiKey.webhook_url ?? "");
    }
  }, [apiKey]);

  async function copy(text: string, setCopied: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  }

  async function handleRegenerate() {
    if (!selectedBusinessId) return;
    if (
      !confirm(
        "Regenerate your secret key? Requests using the current key will stop working immediately.",
      )
    )
      return;

    const result = await rotateApiKey(selectedBusinessId);
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Secret key rotated" : "Failed to rotate secret key"),
    );
  }

  async function handleSaveWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBusinessId) return;

    const result = await updateWebhook(
      selectedBusinessId,
      webhookUrl.trim() || null,
    );
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success ? "Webhook updated" : "Failed to update webhook"),
    );
  }

  async function handleSaveIpWhitelist() {
    if (!selectedBusinessId) return;

    const result = await updateIpWhitelist(selectedBusinessId, ips);
    showAlert(
      result.success ? "success" : "error",
      result.message ??
        (result.success
          ? "IP whitelist updated"
          : "Failed to update IP whitelist"),
    );
  }

  function addIp() {
    const value = ipInput.trim();
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(value)) {
      setIpError(true);
      return;
    }
    setIpError(false);
    setIps([...ips, value]);
    setIpInput("");
  }

  function removeIp(ip: string) {
    setIps(ips.filter((x) => x !== ip));
  }

  if (isLoading && !apiKey) {
    return (
      <div className="text-sm" style={{ color: "var(--muted)" }}>
        Loading API keys...
      </div>
    );
  }

  return (
    <>
      <div className="card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-1.5">API keys</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Use these to authenticate requests to the WalletX API.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Public key
            </label>
            <div className="flex items-center gap-2">
              <div className="key-field flex-1">{apiKey?.public_key ?? ""}</div>
              <button
                type="button"
                onClick={() =>
                  apiKey && copy(apiKey.public_key, setCopiedPublic)
                }
                className="btn-secondary w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                aria-label="Copy public key"
              >
                {copiedPublic ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Secret key
            </label>
            <div className="flex items-center gap-2">
              <div className="key-field flex-1">
                {secretRevealed
                  ? (apiKey?.secret_key ?? "")
                  : "sk_live_••••••••••••••••••••••••••••"}
              </div>
              <button
                type="button"
                onClick={() => setSecretRevealed(!secretRevealed)}
                className="btn-secondary w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                aria-label={
                  secretRevealed ? "Hide secret key" : "Show secret key"
                }
              >
                {secretRevealed ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  apiKey && copy(apiKey.secret_key, setCopiedSecret)
                }
                className="btn-secondary w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                aria-label="Copy secret key"
              >
                {copiedSecret ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRotating}
              className="text-xs font-medium mt-2 flex items-center gap-1.5"
              style={{ color: "var(--danger)" }}
            >
              {isRotating && <Loader2 className="w-3 h-3 animate-spin" />}
              Regenerate secret key
            </button>
          </div>
        </div>
      </div>

      <div className="card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-1.5">Webhook</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          We'll send event notifications to this URL.
        </p>
        <form className="space-y-4" onSubmit={handleSaveWebhook}>
          <div>
            <label
              htmlFor="webhook-url"
              className="text-sm font-medium block mb-1.5"
            >
              Webhook URL
            </label>
            <input
              id="webhook-url"
              type="url"
              placeholder="https://yourapp.com/webhooks/walletx"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isUpdatingWebhook}
            className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          >
            {isUpdatingWebhook && <Loader2 className="w-4 h-4 animate-spin" />}
            Save webhook
          </button>
        </form>
      </div>

      <div className="card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-1.5">IP whitelist</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Only requests from these IPs will be accepted. Leave empty to allow
          all.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {ips.map((ip) => (
            <span key={ip} className="chip">
              {ip}
              <button
                type="button"
                onClick={() => removeIp(ip)}
                aria-label="Remove IP"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 102.89.44.10"
            value={ipInput}
            onChange={(e) => {
              setIpInput(e.target.value);
              if (ipError) setIpError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addIp();
              }
            }}
            className={`input-field flex-1 px-3.5 py-2.5 rounded-lg text-sm font-mono ${
              ipError ? "field-error" : ""
            }`}
          />
          <button
            type="button"
            onClick={addIp}
            className="btn-primary px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0"
          >
            Add
          </button>
        </div>
        <button
          type="button"
          onClick={handleSaveIpWhitelist}
          disabled={isUpdatingIpWhitelist}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-2 mt-4"
        >
          {isUpdatingIpWhitelist && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          Save IP whitelist
        </button>
      </div>
    </>
  );
}
