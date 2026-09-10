import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { JobStatus } from "@/types/job";

import { StatusSummary } from "./status-summary";

const STATUS_COUNTS: Record<JobStatus, number> = {
  interested: 2,
  planned: 1,
  applied: 3,
  screening: 4,
  interview: 5,
  offer: 6,
  rejected: 7,
  withdrawn: 8,
};

describe("StatusSummary", () => {
  it("見出しと説明を表示する", () => {
    render(<StatusSummary statusCounts={STATUS_COUNTS} />);

    expect(
      screen.getByRole("heading", {
        name: "応募ステータス",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("現在登録している求人の状況です。"),
    ).toBeInTheDocument();
  });

  it("全8ステータスのラベルを表示する", () => {
    render(<StatusSummary statusCounts={STATUS_COUNTS} />);

    expect(screen.getByText("興味あり")).toBeInTheDocument();

    expect(screen.getByText("応募予定")).toBeInTheDocument();

    expect(screen.getByText("応募済み")).toBeInTheDocument();

    expect(screen.getByText("選考中")).toBeInTheDocument();

    expect(screen.getByText("面接")).toBeInTheDocument();

    expect(screen.getByText("内定")).toBeInTheDocument();

    expect(screen.getByText("不採用")).toBeInTheDocument();

    expect(screen.getByText("辞退")).toBeInTheDocument();
  });

  it("各ステータスの件数を表示する", () => {
    render(<StatusSummary statusCounts={STATUS_COUNTS} />);

    for (const count of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(screen.getByText(String(count))).toBeInTheDocument();
    }
  });
});
