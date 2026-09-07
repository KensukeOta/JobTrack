"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { ApiError } from "@/lib/api/api-error";
import { login } from "@/lib/api/auth";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "メールアドレスを入力してください。";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "有効なメールアドレスを入力してください。";
    }

    if (!password) {
      errors.password = "パスワードを入力してください。";
    } else if (password.length < 8) {
      errors.password = "パスワードは8文字以上で入力してください。";
    } else if (password.length > 128) {
      errors.password = "パスワードは128文字以内で入力してください。";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setApiError("メールアドレスまたはパスワードが正しくありません。");
        } else if (error.status === 422) {
          setApiError("入力内容を確認してください。");
        } else {
          setApiError("ログインに失敗しました。もう一度お試しください。");
        }
      } else {
        setApiError("通信エラーが発生しました。もう一度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {apiError && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {apiError}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            メールアドレス
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />

          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            パスワード
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
          />

          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "ログインしています..." : "ログイン"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        アカウントをお持ちでないですか？{" "}
        <Link
          href="/register"
          className="font-medium text-slate-900 underline-offset-4 hover:underline"
        >
          新規登録
        </Link>
      </p>
    </div>
  );
}
