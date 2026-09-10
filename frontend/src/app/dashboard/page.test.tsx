import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDashboardSummary } from "@/lib/api/dashboard";
import type { DashboardSummary, UpcomingAction } from "@/types/dashboard";
import type { JobStatus } from "@/types/job";

import DashboardPage from "./page";

vi.mock("@/lib/api/dashboard", () => ({
  getDashboardSummary: vi.fn(),
}));

vi.mock("@/components/auth/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/app-header", () => ({
  AppHeader: () => <div data-testid="app-header">AppHeader</div>,
}));

vi.mock("@/components/dashboard/summary-card", () => ({
  SummaryCard: ({
    label,
    value,
    description,
  }: {
    label: string;
    value: number;
    description?: string;
  }) => (
    <div data-testid={`summary-card-${label}`}>
      {label}:{value}:{description}
    </div>
  ),
}));

vi.mock("@/components/dashboard/status-summary", () => ({
  StatusSummary: ({
    statusCounts,
  }: {
    statusCounts: Record<JobStatus, number>;
  }) => <div data-testid="status-summary">{JSON.stringify(statusCounts)}</div>,
}));

vi.mock("@/components/dashboard/upcoming-actions", () => ({
  UpcomingActions: ({ actions }: { actions: UpcomingAction[] }) => (
    <div data-testid="upcoming-actions">{JSON.stringify(actions)}</div>
  ),
}));

const getDashboardSummaryMock = vi.mocked(getDashboardSummary);

const SUMMARY: DashboardSummary = {
  total_jobs: 12,
  active_jobs: 7,
  status_counts: {
    interested: 2,
    planned: 1,
    applied: 3,
    screening: 1,
    interview: 2,
    offer: 1,
    rejected: 1,
    withdrawn: 1,
  },
  upcoming_actions: [
    {
      job_id: "job-1",
      company_name: "ABC株式会社",
      job_title: "Webエンジニア",
      status: "interview",
      next_action: "一次面接",
      next_action_date: "2026-09-20",
    },
  ],
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("読み込み中はLoading Stateを表示する", () => {
    getDashboardSummaryMock.mockImplementation(() => new Promise(() => {}));

    render(<DashboardPage />);

    expect(
      screen.getByText("ダッシュボードを読み込んでいます..."),
    ).toBeInTheDocument();
  });

  it("ダッシュボードサマリーを取得して表示する", async () => {
    getDashboardSummaryMock.mockResolvedValue(SUMMARY);

    render(<DashboardPage />);

    expect(await screen.findByTestId("summary-card-全求人")).toHaveTextContent(
      "全求人:12:登録している求人",
    );

    expect(screen.getByTestId("summary-card-アクティブ")).toHaveTextContent(
      "アクティブ:7:進行中の求人",
    );

    expect(screen.getByTestId("summary-card-面接")).toHaveTextContent(
      "面接:2:面接ステータス",
    );

    expect(screen.getByTestId("summary-card-内定")).toHaveTextContent(
      "内定:1:内定ステータス",
    );

    expect(getDashboardSummaryMock).toHaveBeenCalledTimes(1);
  });

  it("ステータス集計をStatusSummaryへ渡す", async () => {
    getDashboardSummaryMock.mockResolvedValue(SUMMARY);

    render(<DashboardPage />);

    const statusSummary = await screen.findByTestId("status-summary");

    expect(statusSummary).toHaveTextContent('"interview":2');

    expect(statusSummary).toHaveTextContent('"offer":1');
  });

  it("今後のアクションをUpcomingActionsへ渡す", async () => {
    getDashboardSummaryMock.mockResolvedValue(SUMMARY);

    render(<DashboardPage />);

    const upcomingActions = await screen.findByTestId("upcoming-actions");

    expect(upcomingActions).toHaveTextContent('"job_id":"job-1"');

    expect(upcomingActions).toHaveTextContent('"next_action":"一次面接"');
  });

  it("求人が0件の場合はEmpty Stateを表示する", async () => {
    getDashboardSummaryMock.mockResolvedValue({
      ...SUMMARY,
      total_jobs: 0,
      active_jobs: 0,
      status_counts: {
        interested: 0,
        planned: 0,
        applied: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
        withdrawn: 0,
      },
      upcoming_actions: [],
    });

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", {
        name: "求人がまだありません",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByTestId("status-summary")).not.toBeInTheDocument();

    expect(screen.queryByTestId("upcoming-actions")).not.toBeInTheDocument();
  });

  it("求人が0件の場合も求人追加リンクを表示する", async () => {
    getDashboardSummaryMock.mockResolvedValue({
      ...SUMMARY,
      total_jobs: 0,
      active_jobs: 0,
      upcoming_actions: [],
    });

    render(<DashboardPage />);

    await screen.findByRole("heading", {
      name: "求人がまだありません",
    });

    const links = screen.getAllByRole("link", {
      name: "求人を追加",
    });

    expect(links.length).toBeGreaterThanOrEqual(1);

    for (const link of links) {
      expect(link).toHaveAttribute("href", "/jobs/new");
    }
  });

  it("APIエラー時はError Stateを表示する", async () => {
    getDashboardSummaryMock.mockRejectedValue(new Error("Network error"));

    render(<DashboardPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ダッシュボードの取得に失敗しました。",
    );
  });

  it("求人一覧と求人追加へのリンクを表示する", () => {
    getDashboardSummaryMock.mockImplementation(() => new Promise(() => {}));

    render(<DashboardPage />);

    expect(
      screen.getByRole("link", {
        name: "求人一覧",
      }),
    ).toHaveAttribute("href", "/jobs");

    expect(
      screen.getByRole("link", {
        name: "求人を追加",
      }),
    ).toHaveAttribute("href", "/jobs/new");
  });
});
