import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("NotFound", () => {
  it("404メッセージとナビゲーションを表示する", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "ページが見つかりません",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "トップページへ戻る",
      }),
    ).toHaveAttribute("href", "/");

    expect(
      screen.getByRole("link", {
        name: "ダッシュボードへ",
      }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
