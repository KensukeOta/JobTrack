import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JobPagination } from "./job-pagination";

describe("JobPagination", () => {
  it("現在ページと総ページ数を表示する", () => {
    render(
      <JobPagination
        page={2}
        pageSize={20}
        total={45}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText("2 / 3 ページ")).toBeInTheDocument();
  });

  it("1ページ目では前へボタンを無効化する", () => {
    render(
      <JobPagination
        page={1}
        pageSize={20}
        total={45}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "前へ",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "次へ",
      }),
    ).toBeEnabled();
  });

  it("最終ページでは次へボタンを無効化する", () => {
    render(
      <JobPagination
        page={3}
        pageSize={20}
        total={45}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "前へ",
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: "次へ",
      }),
    ).toBeDisabled();
  });

  it("前へを押すと1つ前のページを通知する", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <JobPagination
        page={2}
        pageSize={20}
        total={45}
        onPageChange={onPageChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "前へ",
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("次へを押すと1つ後のページを通知する", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <JobPagination
        page={2}
        pageSize={20}
        total={45}
        onPageChange={onPageChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "次へ",
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("totalが0でも総ページ数は1として扱う", () => {
    render(
      <JobPagination page={1} pageSize={20} total={0} onPageChange={vi.fn()} />,
    );

    expect(screen.getByText("1 / 1 ページ")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "前へ",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "次へ",
      }),
    ).toBeDisabled();
  });
});
