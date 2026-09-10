import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getJobs } from "@/lib/api/jobs";
import type { Job, JobListResponse } from "@/types/job";

import JobsPage from "./page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/lib/api/jobs", () => ({
  getJobs: vi.fn(),
}));

vi.mock("@/components/auth/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/app-header", () => ({
  AppHeader: () => <div data-testid="app-header">AppHeader</div>,
}));

vi.mock("@/components/jobs/job-card", () => ({
  JobCard: ({ job }: { job: Job }) => (
    <div data-testid={`job-card-${job.id}`}>
      {job.company_name}:{job.job_title}
    </div>
  ),
}));

vi.mock("@/components/jobs/job-list-controls", () => ({
  JobListControls: ({
    q,
    status,
    sort,
    order,
    onSearch,
    onStatusChange,
    onSortChange,
    onOrderChange,
    onClear,
  }: {
    q: string;
    status: string;
    sort: string;
    order: string;
    onSearch: (value: string) => void;
    onStatusChange: (value: "interview" | "") => void;
    onSortChange: (value: "created_at" | "updated_at") => void;
    onOrderChange: (value: "asc" | "desc") => void;
    onClear: () => void;
  }) => (
    <div>
      <div data-testid="current-q">{q}</div>
      <div data-testid="current-status">{status}</div>
      <div data-testid="current-sort">{sort}</div>
      <div data-testid="current-order">{order}</div>

      <button type="button" onClick={() => onSearch("ABC")}>
        テスト検索
      </button>

      <button type="button" onClick={() => onStatusChange("interview")}>
        テストステータス
      </button>

      <button type="button" onClick={() => onSortChange("updated_at")}>
        テスト並び替え
      </button>

      <button type="button" onClick={() => onOrderChange("asc")}>
        テスト昇順
      </button>

      <button type="button" onClick={onClear}>
        テスト条件クリア
      </button>
    </div>
  ),
}));

vi.mock("@/components/jobs/job-pagination", () => ({
  JobPagination: ({
    page,
    pageSize,
    total,
    onPageChange,
  }: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  }) => (
    <div>
      <div data-testid="pagination-values">
        {page}:{pageSize}:{total}
      </div>

      <button type="button" onClick={() => onPageChange(2)}>
        テスト2ページ目
      </button>
    </div>
  ),
}));

const getJobsMock = vi.mocked(getJobs);

const JOB: Job = {
  id: "job-1",
  user_id: "user-1",
  company_name: "ABC株式会社",
  job_title: "Webエンジニア",
  status: "interview",
  job_url: null,
  location: "大阪府大阪市",
  employment_type: "full_time",
  salary_min: 3000000,
  salary_max: 5000000,
  next_action: "一次面接",
  next_action_date: "2026-09-20",
  memo: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-10T00:00:00Z",
};

const RESPONSE: JobListResponse = {
  items: [JOB],
  total: 1,
  page: 1,
  page_size: 20,
};

describe("JobsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  it("読み込み中はLoading Stateを表示する", () => {
    getJobsMock.mockImplementation(() => new Promise(() => {}));

    render(<JobsPage />);

    expect(
      screen.getByText("求人一覧を読み込んでいます..."),
    ).toBeInTheDocument();
  });

  it("求人一覧を取得して表示する", async () => {
    getJobsMock.mockResolvedValue(RESPONSE);

    render(<JobsPage />);

    expect(await screen.findByText("1件")).toBeInTheDocument();

    expect(screen.getByTestId("job-card-job-1")).toHaveTextContent(
      "ABC株式会社:Webエンジニア",
    );

    expect(getJobsMock).toHaveBeenCalledWith({
      q: undefined,
      status: undefined,
      sort: "created_at",
      order: "desc",
      page: 1,
      page_size: 20,
    });
  });

  it("求人が0件かつ条件なしの場合はEmpty Stateを表示する", async () => {
    getJobsMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
    });

    render(<JobsPage />);

    expect(
      await screen.findByRole("heading", {
        name: "求人がまだありません",
      }),
    ).toBeInTheDocument();

    const addJobLinks = screen.getAllByRole("link", {
      name: "求人を追加",
    });

    expect(addJobLinks).toHaveLength(2);

    for (const link of addJobLinks) {
      expect(link).toHaveAttribute("href", "/jobs/new");
    }
  });

  it("求人が0件かつ検索条件ありの場合は検索結果Empty Stateを表示する", async () => {
    mocks.searchParams = new URLSearchParams("q=ABC");

    getJobsMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
    });

    render(<JobsPage />);

    expect(
      await screen.findByRole("heading", {
        name: "条件に一致する求人がありません",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "検索条件をクリア",
      }),
    ).toBeInTheDocument();
  });

  it("APIエラー時はError Stateを表示する", async () => {
    getJobsMock.mockRejectedValue(new Error("Network error"));

    render(<JobsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "求人一覧の取得に失敗しました。",
    );
  });

  it("URLクエリをAPIとコントロールへ反映する", async () => {
    mocks.searchParams = new URLSearchParams(
      "q=ABC&status=interview&sort=updated_at&order=asc&page=3",
    );

    getJobsMock.mockResolvedValue({
      items: [JOB],
      total: 50,
      page: 3,
      page_size: 20,
    });

    render(<JobsPage />);

    await screen.findByText("50件");

    expect(getJobsMock).toHaveBeenCalledWith({
      q: "ABC",
      status: "interview",
      sort: "updated_at",
      order: "asc",
      page: 3,
      page_size: 20,
    });

    expect(screen.getByTestId("current-q")).toHaveTextContent("ABC");

    expect(screen.getByTestId("current-status")).toHaveTextContent("interview");

    expect(screen.getByTestId("current-sort")).toHaveTextContent("updated_at");

    expect(screen.getByTestId("current-order")).toHaveTextContent("asc");
  });

  it("不正なURLクエリはデフォルト値へ戻す", async () => {
    mocks.searchParams = new URLSearchParams(
      "status=invalid&sort=invalid&order=invalid&page=0",
    );

    getJobsMock.mockResolvedValue(RESPONSE);

    render(<JobsPage />);

    await screen.findByText("1件");

    expect(getJobsMock).toHaveBeenCalledWith({
      q: undefined,
      status: undefined,
      sort: "created_at",
      order: "desc",
      page: 1,
      page_size: 20,
    });
  });

  it("検索するとpageを削除してURLを更新する", async () => {
    const user = userEvent.setup();

    mocks.searchParams = new URLSearchParams("page=3");

    getJobsMock.mockResolvedValue(RESPONSE);

    render(<JobsPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト検索",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith("/jobs?q=ABC");
  });

  it("ステータス変更時にURLを更新する", async () => {
    const user = userEvent.setup();

    getJobsMock.mockResolvedValue(RESPONSE);

    render(<JobsPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テストステータス",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith("/jobs?status=interview");
  });

  it("並び替え変更時にURLを更新する", async () => {
    const user = userEvent.setup();

    getJobsMock.mockResolvedValue(RESPONSE);

    render(<JobsPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト並び替え",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith("/jobs?sort=updated_at");
  });

  it("昇順へ変更するとURLを更新する", async () => {
    const user = userEvent.setup();

    getJobsMock.mockResolvedValue(RESPONSE);

    render(<JobsPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト昇順",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith("/jobs?order=asc");
  });

  it("ページ変更時にpageクエリを更新する", async () => {
    const user = userEvent.setup();

    getJobsMock.mockResolvedValue({
      items: [JOB],
      total: 50,
      page: 1,
      page_size: 20,
    });

    render(<JobsPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト2ページ目",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith("/jobs?page=2");
  });

  it("検索条件をクリアすると/jobsへ戻す", async () => {
    const user = userEvent.setup();

    mocks.searchParams = new URLSearchParams("q=ABC");

    getJobsMock.mockResolvedValue(RESPONSE);

    render(<JobsPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト条件クリア",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith("/jobs");
  });
});
