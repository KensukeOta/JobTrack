import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { register } from "@/lib/api/auth";

import { RegisterForm } from "./register-form";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/api/auth", () => ({
  register: vi.fn(),
}));

const registerMock = vi.mocked(register);

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("名前・メールアドレス・パスワードを入力できる", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const nameInput = screen.getByLabelText("名前");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    await user.type(nameInput, "テストユーザー");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(nameInput).toHaveValue("テストユーザー");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("未入力で送信すると必須エラーを表示する", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    expect(screen.getByText("名前を入力してください。")).toBeInTheDocument();

    expect(
      screen.getByText("メールアドレスを入力してください。"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("パスワードを入力してください。"),
    ).toBeInTheDocument();

    expect(registerMock).not.toHaveBeenCalled();
  });

  it("無効なメールアドレスを拒否する", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("名前"), "テストユーザー");

    await user.type(screen.getByLabelText("メールアドレス"), "invalid-email");

    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    expect(
      screen.getByText("有効なメールアドレスを入力してください。"),
    ).toBeInTheDocument();

    expect(registerMock).not.toHaveBeenCalled();
  });

  it("8文字未満のパスワードを拒否する", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("名前"), "テストユーザー");

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );

    await user.type(screen.getByLabelText("パスワード"), "short");

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    expect(
      screen.getByText("パスワードは8文字以上で入力してください。"),
    ).toBeInTheDocument();

    expect(registerMock).not.toHaveBeenCalled();
  });

  it("正常入力時にregister APIを呼び出してログイン画面へ遷移する", async () => {
    const user = userEvent.setup();

    registerMock.mockResolvedValue({
      id: "user-1",
      name: "テストユーザー",
      email: "test@example.com",
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("名前"), "  テストユーザー  ");

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "  test@example.com  ",
    );

    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: "テストユーザー",
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(registerMock).toHaveBeenCalledTimes(1);

    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("409の場合はメールアドレス重複エラーを表示する", async () => {
    const user = userEvent.setup();

    registerMock.mockRejectedValue(
      new ApiError(409, "Email already registered"),
    );

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("名前"), "テストユーザー");

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );

    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "このメールアドレスは既に登録されています。",
    );

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("422の場合は入力エラーを表示する", async () => {
    const user = userEvent.setup();

    registerMock.mockRejectedValue(new ApiError(422, "Validation error"));

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("名前"), "テストユーザー");
    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "入力内容を確認してください。",
    );
  });

  it("通信エラーの場合は通信エラーメッセージを表示する", async () => {
    const user = userEvent.setup();

    registerMock.mockRejectedValue(new Error("Network error"));

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("名前"), "テストユーザー");
    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "通信エラーが発生しました。もう一度お試しください。",
    );
  });

  it("送信中はボタンを無効化して二重送信を防止する", async () => {
    const user = userEvent.setup();

    let resolveRegister: (() => void) | undefined;

    registerMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = () => {
            resolve({
              id: "user-1",
              name: "テストユーザー",
              email: "test@example.com",
            });
          };
        }),
    );

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("名前"), "テストユーザー");
    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを作成",
      }),
    );

    const submittingButton = screen.getByRole("button", {
      name: "登録しています...",
    });

    expect(submittingButton).toBeDisabled();

    expect(registerMock).toHaveBeenCalledTimes(1);

    await user.click(submittingButton);

    expect(registerMock).toHaveBeenCalledTimes(1);

    resolveRegister?.();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });
});
