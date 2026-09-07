"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

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
    </main>
  );
}
