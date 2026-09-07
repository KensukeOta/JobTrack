"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";

export function LogoutButton() {
  const router = useRouter();

  const { logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    setIsLoggingOut(true);

    try {
      await logout();

      router.push("/login");
      router.refresh();
    } catch {
      setError("ログアウトに失敗しました。もう一度お試しください。");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-lg cursor-pointer border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoggingOut ? "ログアウト中..." : "ログアウト"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
