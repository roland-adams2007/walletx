"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../stores/store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, error, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (error) {
      router.replace("/login");
    }
  }, [error, router]);

  if (!user && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
