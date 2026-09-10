import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api/api-error";
import { login } from "@/lib/api/auth";

import { LoginForm } from "./login-form";

const pushMock = vi.fn();
const refreshUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/api/auth", () => ({
  login: vi.fn(),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: vi.fn(),
}));

const loginMock = vi.mocked(login);
const useAuthMock = vi.mocked(useAuth);

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthMock.mockReturnValue({
      user: null,
      isLoading: false,
      refreshUser: refreshUserMock,
      logout: vi.fn(),
    });

    refreshUserMock.mockResolvedValue(undefined);
  });

  it("メールアドレスとパスワードを入力できる", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("未入力で送信すると必須エラーを表示する", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    expect(
      screen.getByText("メールアドレスを入力してください。"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("パスワードを入力してください。"),
    ).toBeInTheDocument();

    expect(loginMock).not.toHaveBeenCalled();
  });

  it("無効なメールアドレスを拒否する", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "invalid-email");

    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    expect(
      screen.getByText("有効なメールアドレスを入力してください。"),
    ).toBeInTheDocument();

    expect(loginMock).not.toHaveBeenCalled();
  });

  it("8文字未満のパスワードを拒否する", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );

    await user.type(screen.getByLabelText("パスワード"), "short");

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    expect(
      screen.getByText("パスワードは8文字以上で入力してください。"),
    ).toBeInTheDocument();

    expect(loginMock).not.toHaveBeenCalled();
  });

  it("正常入力時にlogin APIを呼び出して認証状態を更新しダッシュボードへ遷移する", async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValue({
      id: "user-1",
      name: "テストユーザー",
      email: "test@example.com",
    });

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "  test@example.com  ",
    );

    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(loginMock).toHaveBeenCalledTimes(1);

    expect(refreshUserMock).toHaveBeenCalledTimes(1);

    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("401の場合は認証エラーを表示する", async () => {
    const user = userEvent.setup();

    loginMock.mockRejectedValue(new ApiError(401, "Invalid credentials"));

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "メールアドレスまたはパスワードが正しくありません。",
    );

    expect(refreshUserMock).not.toHaveBeenCalled();

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("422の場合は入力エラーを表示する", async () => {
    const user = userEvent.setup();

    loginMock.mockRejectedValue(new ApiError(422, "Validation error"));

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "入力内容を確認してください。",
    );
  });

  it("通信エラーの場合は通信エラーメッセージを表示する", async () => {
    const user = userEvent.setup();

    loginMock.mockRejectedValue(new Error("Network error"));

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "通信エラーが発生しました。もう一度お試しください。",
    );
  });

  it("送信中はボタンを無効化して二重送信を防止する", async () => {
    const user = userEvent.setup();

    let resolveLogin: (() => void) | undefined;

    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = () => {
            resolve({
              id: "user-1",
              name: "テストユーザー",
              email: "test@example.com",
            });
          };
        }),
    );

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    );

    const submittingButton = screen.getByRole("button", {
      name: "ログインしています...",
    });

    expect(submittingButton).toBeDisabled();

    expect(loginMock).toHaveBeenCalledTimes(1);

    await user.click(submittingButton);

    expect(loginMock).toHaveBeenCalledTimes(1);

    resolveLogin?.();

    await waitFor(() => {
      expect(refreshUserMock).toHaveBeenCalledTimes(1);

      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
