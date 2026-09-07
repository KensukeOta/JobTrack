"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="p-8">
        <p>認証状態を確認しています...</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {user ? (
        <div className="mt-6 space-y-4">
          <div>
            <p>
              ログイン中：
              {user.name}
            </p>

            <p className="text-sm text-slate-600">{user.email}</p>
          </div>

          <LogoutButton />
        </div>
      ) : (
        <p className="mt-6">ログインしていません。</p>
      )}
    </main>
  );
}
