"use client";

import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/components/providers/auth-provider";

const focusClasses =
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={`text-xl font-bold tracking-tight text-slate-900 ${focusClasses}`}
          >
            JobTrack
          </Link>

          <nav aria-label="メインナビゲーション" className="hidden sm:block">
            <Link
              href="/jobs"
              className={`text-sm font-medium text-slate-600 transition hover:text-slate-900 ${focusClasses}`}
            >
              求人一覧
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>

              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          )}

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
