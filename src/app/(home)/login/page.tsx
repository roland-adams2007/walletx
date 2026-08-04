"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";
import api from "../../api/axios";
import { useAlert } from "../../lib/alert-context";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showAlert("error", "Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data.success) {
        showAlert("error", res.data.message);
        return;
      }

      if (res.data.verified === false || res.data.email_verified === false) {
        localStorage.setItem("verification_email", email);
        showAlert("info", res.data.message);
        router.push("/verify-email");
        return;
      }

      localStorage.setItem(
        "auth_session",
        JSON.stringify({
          access_token: res.data.access_token,
          expires_at: Math.floor(
            new Date(res.data.expires_at).getTime() / 1000,
          ),
        }),
      );
      showAlert("success", res.data.message ?? "Successfully logged in.");
      router.push("/dashboard");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message ?? "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="login-brand-panel hidden lg:flex lg:w-1/2 flex-col p-10 xl:p-14 text-white">
        <div className="login-brand-panel-overlay" />
        <div className="relative flex-1 flex items-center">
          <div className="max-w-md">
            <p className="font-mono text-xs tracking-widest uppercase mb-4 text-[#8fd6ae]">
              Built for operators
            </p>
            <h1 className="text-[32px] xl:text-[36px] font-semibold leading-tight mb-4">
              Every naira, tracked the moment it moves.
            </h1>
            <p className="text-sm leading-relaxed text-[#c3d8cc]">
              Watch settlements, payouts and transfers land in real time — one
              dashboard for the whole business.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="WalletX"
              width={140}
              height={40}
              unoptimized
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-semibold mb-1.5">Welcome back</h1>
          <p className="text-sm mb-8 text-muted">
            Sign in to manage your business.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium block mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm bg-white"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="text-sm text-center mt-8 text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-brand">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
