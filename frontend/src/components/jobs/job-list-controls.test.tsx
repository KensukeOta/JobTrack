import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JobListControls } from "./job-list-controls";

function renderControls(
  options: {
    q?: string;
    status?: "" | "interview";
    sort?: "created_at" | "updated_at" | "next_action_date";
    order?: "asc" | "desc";
  } = {},
) {
  const onSearch = vi.fn();
  const onStatusChange = vi.fn();
  const onSortChange = vi.fn();
  const onOrderChange = vi.fn();
  const onClear = vi.fn();

  render(
    <JobListControls
      q={options.q ?? ""}
      status={options.status ?? ""}
      sort={options.sort ?? "created_at"}
      order={options.order ?? "desc"}
      onSearch={onSearch}
      onStatusChange={onStatusChange}
      onSortChange={onSortChange}
      onOrderChange={onOrderChange}
      onClear={onClear}
    />,
  );

  return {
    onSearch,
    onStatusChange,
    onSortChange,
    onOrderChange,
    onClear,
  };
}

describe("JobListControls", () => {
  it("初期値を表示する", () => {
    renderControls({
      q: "ABC",
      status: "interview",
      sort: "updated_at",
      order: "asc",
    });

    expect(screen.getByRole("searchbox")).toHaveValue("ABC");

    expect(screen.getByLabelText("ステータス")).toHaveValue("interview");

    expect(screen.getByLabelText("並び替え")).toHaveValue("updated_at");

    expect(screen.getByLabelText("並び順")).toHaveValue("asc");
  });

  it("検索文字列をtrimしてonSearchへ渡す", async () => {
    const user = userEvent.setup();
    const { onSearch } = renderControls();

    const input = screen.getByRole("searchbox");

    await user.type(input, "  ABC株式会社  ");

    await user.click(
      screen.getByRole("button", {
        name: "検索",
      }),
    );

    expect(onSearch).toHaveBeenCalledWith("ABC株式会社");
  });

  it("ステータス変更を通知する", async () => {
    const user = userEvent.setup();
    const { onStatusChange } = renderControls();

    await user.selectOptions(screen.getByLabelText("ステータス"), "interview");

    expect(onStatusChange).toHaveBeenCalledWith("interview");
  });

  it("並び替え変更を通知する", async () => {
    const user = userEvent.setup();
    const { onSortChange } = renderControls();

    await user.selectOptions(
      screen.getByLabelText("並び替え"),
      "next_action_date",
    );

    expect(onSortChange).toHaveBeenCalledWith("next_action_date");
  });

  it("並び順変更を通知する", async () => {
    const user = userEvent.setup();
    const { onOrderChange } = renderControls();

    await user.selectOptions(screen.getByLabelText("並び順"), "asc");

    expect(onOrderChange).toHaveBeenCalledWith("asc");
  });

  it("条件なしの場合はクリアボタンを表示しない", () => {
    renderControls();

    expect(
      screen.queryByRole("button", {
        name: "検索条件をクリア",
      }),
    ).not.toBeInTheDocument();
  });

  it("検索条件ありの場合はクリアボタンを表示してonClearを呼ぶ", async () => {
    const user = userEvent.setup();
    const { onClear } = renderControls({
      q: "ABC",
    });

    await user.click(
      screen.getByRole("button", {
        name: "検索条件をクリア",
      }),
    );

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("ステータス条件だけでもクリアボタンを表示する", () => {
    renderControls({
      status: "interview",
    });

    expect(
      screen.getByRole("button", {
        name: "検索条件をクリア",
      }),
    ).toBeInTheDocument();
  });

  it("デフォルト以外の並び替えでもクリアボタンを表示する", () => {
    renderControls({
      sort: "updated_at",
    });

    expect(
      screen.getByRole("button", {
        name: "検索条件をクリア",
      }),
    ).toBeInTheDocument();
  });

  it("昇順の場合もクリアボタンを表示する", () => {
    renderControls({
      order: "asc",
    });

    expect(
      screen.getByRole("button", {
        name: "検索条件をクリア",
      }),
    ).toBeInTheDocument();
  });
});
