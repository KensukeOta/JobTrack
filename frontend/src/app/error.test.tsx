import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe("ErrorPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("エラーメッセージとナビゲーションを表示する", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<ErrorPage error={new Error("Test error")} reset={vi.fn()} />);

    expect(
      screen.getByRole("heading", {
        name: "エラーが発生しました",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "もう一度試す",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "トップページへ戻る",
      }),
    ).toHaveAttribute("href", "/");
  });

  it("再試行ボタンを押すとresetを呼び出す", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const resetMock = vi.fn();

    render(<ErrorPage error={new Error("Test error")} reset={resetMock} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "もう一度試す",
      }),
    );

    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it("エラー詳細を画面へ表示しない", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorPage
        error={new Error("Sensitive internal error")}
        reset={vi.fn()}
      />,
    );

    expect(
      screen.queryByText("Sensitive internal error"),
    ).not.toBeInTheDocument();
  });
});
