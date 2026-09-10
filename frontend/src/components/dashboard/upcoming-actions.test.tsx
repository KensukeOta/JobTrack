import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { UpcomingAction } from "@/types/dashboard";

import { UpcomingActions } from "./upcoming-actions";

const ACTIONS: UpcomingAction[] = [
  {
    job_id: "job-1",
    company_name: "ABC株式会社",
    job_title: "Webエンジニア",
    status: "interview",
    next_action: "一次面接",
    next_action_date: "2026-09-20",
  },
  {
    job_id: "job-2",
    company_name: "XYZ株式会社",
    job_title: "データエンジニア",
    status: "screening",
    next_action: null,
    next_action_date: "2026-09-25",
  },
];

describe("UpcomingActions", () => {
  it("見出しと説明を表示する", () => {
    render(<UpcomingActions actions={ACTIONS} />);

    expect(
      screen.getByRole("heading", {
        name: "今後のアクション",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("予定されている対応を日付順に表示します。"),
    ).toBeInTheDocument();
  });

  it("今後のアクション一覧を表示する", () => {
    render(<UpcomingActions actions={ACTIONS} />);

    expect(screen.getByText("ABC株式会社")).toBeInTheDocument();

    expect(screen.getByText("Webエンジニア")).toBeInTheDocument();

    expect(screen.getByText("一次面接")).toBeInTheDocument();

    expect(screen.getByText("面接")).toBeInTheDocument();

    expect(screen.getByText("2026/09/20")).toBeInTheDocument();
  });

  it("求人詳細へのリンクを表示する", () => {
    render(<UpcomingActions actions={ACTIONS} />);

    const abcLink = screen.getByText("ABC株式会社").closest("a");

    const xyzLink = screen.getByText("XYZ株式会社").closest("a");

    expect(abcLink).toHaveAttribute("href", "/jobs/job-1");

    expect(xyzLink).toHaveAttribute("href", "/jobs/job-2");
  });

  it("アクション内容がnullの場合は未設定表示にする", () => {
    render(<UpcomingActions actions={ACTIONS} />);

    expect(screen.getByText("アクション内容未設定")).toBeInTheDocument();
  });

  it("アクションが0件の場合はEmpty Stateを表示する", () => {
    render(<UpcomingActions actions={[]} />);

    expect(
      screen.getByText("予定されているアクションはありません"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("求人詳細から次のアクションを設定できます。"),
    ).toBeInTheDocument();
  });

  it("求人一覧へのリンクを表示する", () => {
    render(<UpcomingActions actions={ACTIONS} />);

    expect(
      screen.getByRole("link", {
        name: /求人一覧/,
      }),
    ).toHaveAttribute("href", "/jobs");
  });
});
