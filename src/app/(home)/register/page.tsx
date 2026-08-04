"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import "./register.css";
import api from "../../api/axios";
import { useAlert } from "../../lib/alert-context";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const withoutLeadingZero = digitsOnly.replace(/^0+/, "");
    setPhone(withoutLeadingZero);
  }

  function validate(): string | null {
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!email.trim()) return "Email address is required.";
    if (!phone.trim()) return "Phone number is required.";
    if (!password.trim()) return "Password is required.";
    if (!confirmPassword.trim()) return "Please confirm your password.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      showAlert("error", validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/register", {
        firstname: firstName,
        lastname: lastName,
        middlename: middleName,
        email,
        phone: `+234${phone}`,
        password,
        password_confirmation: confirmPassword,
      });
      if (res.data.success) {
        showAlert("success", "Account created. Please verify your email.");
        localStorage.setItem("verification_email", res.data.email);
        router.push("/verify-email");
      } else {
        showAlert("error", res.data.message);
      }
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
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt="WalletX"
            width={140}
            height={40}
            unoptimized
            className="h-10 w-auto"
          />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-1.5">
          Create your account
        </h1>
        <p className="text-sm text-center mb-8 text-muted">
          Set up your business on WalletX in a few minutes.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstname"
                className="text-sm font-medium block mb-1.5"
              >
                First name
              </label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                autoComplete="given-name"
                placeholder="Roland"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm bg-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastname"
                className="text-sm font-medium block mb-1.5"
              >
                Last name
              </label>
              <input
                id="lastname"
                name="lastname"
                type="text"
                autoComplete="family-name"
                placeholder="Adams"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="middlename"
              className="text-sm font-medium block mb-1.5"
            >
              Middle name{" "}
              <span className="optional-tag text-xs">(optional)</span>
            </label>
            <input
              id="middlename"
              name="middlename"
              type="text"
              autoComplete="additional-name"
              placeholder="Emeka"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-1.5">
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
            <label htmlFor="phone" className="text-sm font-medium block mb-1.5">
              Phone number
            </label>
            <div className="flex">
              <span className="phone-prefix px-3.5 py-2.5 rounded-l-lg text-sm">
                +234
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="7043507082"
                value={phone}
                onChange={handlePhoneChange}
                className="input-field w-full px-3.5 py-2.5 rounded-r-lg text-sm bg-white border-l-0"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium block mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium block mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field w-full px-3.5 py-2.5 rounded-lg text-sm bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-medium text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center mt-8 text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
