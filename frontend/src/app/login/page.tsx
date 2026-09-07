import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            JobTrack
          </h1>

          <p className="mt-2 text-sm text-slate-600">アカウントにログイン</p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
