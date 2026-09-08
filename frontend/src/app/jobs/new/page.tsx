import { AuthGuard } from "@/components/auth/auth-guard";
import { AppHeader } from "@/components/layout/app-header";

import { JobCreateForm } from "./job-create-form";

export default function NewJobPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              求人を登録
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              応募を検討している求人情報を登録します。
            </p>
          </div>

          <JobCreateForm />
        </main>
      </div>
    </AuthGuard>
  );
}
