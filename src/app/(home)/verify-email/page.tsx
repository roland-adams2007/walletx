"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import api from "../../api/axios";
import { useAlert } from "../../lib/alert-context";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const RESEND_AT_KEY = "verification_resend_at";
const RESEND_EMAIL_KEY = "verification_resend_email";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("verification_email");
    if (!storedEmail) {
      router.push("/register");
      return;
    }
    setEmail(storedEmail);

    const resendAt = Number(localStorage.getItem(RESEND_AT_KEY));
    const resendEmail = localStorage.getItem(RESEND_EMAIL_KEY);

    if (resendAt && resendEmail === storedEmail) {
      const remaining = Math.ceil((resendAt - Date.now()) / 1000);
      setSecondsLeft(remaining > 0 ? remaining : 0);
    } else {
      startCooldown(storedEmail);
    }
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  function startCooldown(forEmail: string) {
    const resendAt = Date.now() + RESEND_COOLDOWN * 1000;
    localStorage.setItem(RESEND_AT_KEY, String(resendAt));
    localStorage.setItem(RESEND_EMAIL_KEY, forEmail);
    setSecondsLeft(RESEND_COOLDOWN);
  }

  function clearVerificationState() {
    localStorage.removeItem("verification_email");
    localStorage.removeItem(RESEND_AT_KEY);
    localStorage.removeItem(RESEND_EMAIL_KEY);
  }

  const code = digits.join("");
  const isComplete = digits.every((d) => d !== "");

  function setDigitAt(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(-1);
    setDigitAt(index, value);
    setError(null);
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/auth/verify-email", {
        email,
        code,
      });

      if (!res.data.success) {
        setError(
          res.data.message ?? "That code isn't right. Check it and try again.",
        );
        return;
      }

      clearVerificationState();
      showAlert("success", res.data.message ?? "Email verified successfully.");
      router.push("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "That code isn't right. Check it and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await api.post("/auth/resend-verification", { email });

      if (!res.data.success) {
        showAlert("error", res.data.message);
        return;
      }

      showAlert("success", res.data.message ?? "A new code has been sent.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      startCooldown(email);
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message ?? "Something went wrong.",
      );
    } finally {
      setIsResending(false);
    }
  }

  function handleGoBack() {
    clearVerificationState();
    router.push("/register");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-sm">
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
          Verify your email
        </h1>
        <p className="text-sm text-center text-muted">
          We sent a 6-digit code to
        </p>
        <p className="text-sm text-center font-medium mb-8">{email}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`input-field w-11 h-13 sm:w-12 sm:h-14 rounded-lg text-center text-lg font-mono font-semibold ${
                  digit ? "border-brand" : ""
                }`}
                style={{ height: "3.25rem" }}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-center mt-4 flex items-center justify-center gap-1.5 text-danger">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isComplete || isSubmitting}
            className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-medium text-white mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-muted">
          Didn&apos;t get the code?{" "}
          {secondsLeft > 0 ? (
            <span className="text-muted font-medium">
              Resend in {secondsLeft}s
            </span>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleResend();
              }}
              className="font-medium text-brand"
            >
              {isResending ? "Resending…" : "Resend code"}
            </a>
          )}
        </p>

        <p className="text-sm text-center mt-8 text-muted">
          Wrong email?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleGoBack();
            }}
            className="font-medium text-brand"
          >
            Go back
          </a>
        </p>
      </div>
    </div>
  );
}
