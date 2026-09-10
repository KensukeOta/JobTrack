import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { getJob } from "@/lib/api/jobs";
import type { Job } from "@/types/job";

import JobDetailPage from "./page";

const mocks = vi.hoisted(() => ({
  jobId: "job-1",
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({
    jobId: mocks.jobId,
  }),
}));

vi.mock("@/lib/api/jobs", () => ({
  getJob: vi.fn(),
}));

vi.mock("@/components/auth/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/app-header", () => ({
  AppHeader: () => <div data-testid="app-header">AppHeader</div>,
}));

vi.mock("@/components/jobs/delete-job-button", () => ({
  DeleteJobButton: ({
    jobId,
    companyName,
  }: {
    jobId: string;
    companyName: string;
  }) => (
    <div data-testid="delete-job-button">
      {jobId}:{companyName}
    </div>
  ),
}));

const getJobMock = vi.mocked(getJob);

const JOB: Job = {
  id: "job-1",
  user_id: "user-1",
  company_name: "ABC株式会社",
  job_title: "Webエンジニア",
  status: "interview",
  job_url: "https://example.com/jobs/1",
  location: "大阪府大阪市",
  employment_type: "full_time",
  salary_min: 3000000,
  salary_max: 5000000,
  next_action: "一次面接",
  next_action_date: "2026-09-20",
  memo: "テストメモ",
  created_at: "2026-09-01T10:00:00+09:00",
  updated_at: "2026-09-05T15:30:00+09:00",
};

describe("JobDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.jobId = "job-1";
  });

  it("読み込み中はLoading Stateを表示する", () => {
    getJobMock.mockImplementation(() => new Promise(() => {}));

    render(<JobDetailPage />);

    expect(
      screen.getByText("求人情報を読み込んでいます..."),
    ).toBeInTheDocument();
  });

  it("求人情報を取得して表示する", async () => {
    getJobMock.mockResolvedValue(JOB);

    render(<JobDetailPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Webエンジニア",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("ABC株式会社")).toBeInTheDocument();

    expect(screen.getByText("面接")).toBeInTheDocument();

    expect(screen.getByText("大阪府大阪市")).toBeInTheDocument();

    expect(screen.getByText("正社員")).toBeInTheDocument();

    expect(screen.getByText("3,000,000円 〜 5,000,000円")).toBeInTheDocument();

    expect(screen.getByText("一次面接")).toBeInTheDocument();

    expect(screen.getByText("2026/09/20")).toBeInTheDocument();

    expect(screen.getByText("テストメモ")).toBeInTheDocument();

    expect(getJobMock).toHaveBeenCalledWith("job-1");

    expect(getJobMock).toHaveBeenCalledTimes(1);
  });

  it("求人URLを外部リンクとして表示する", async () => {
    getJobMock.mockResolvedValue(JOB);

    render(<JobDetailPage />);

    const link = await screen.findByRole("link", {
      name: "https://example.com/jobs/1",
    });

    expect(link).toHaveAttribute("href", "https://example.com/jobs/1");

    expect(link).toHaveAttribute("target", "_blank");

    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("編集画面へのリンクを表示する", async () => {
    getJobMock.mockResolvedValue(JOB);

    render(<JobDetailPage />);

    const editLink = await screen.findByRole("link", {
      name: "編集",
    });

    expect(editLink).toHaveAttribute("href", "/jobs/job-1/edit");
  });

  it("求人一覧へのリンクを表示する", async () => {
    getJobMock.mockResolvedValue(JOB);

    render(<JobDetailPage />);

    const links = await screen.findAllByRole("link", {
      name: /求人一覧へ戻る/,
    });

    expect(links.some((link) => link.getAttribute("href") === "/jobs")).toBe(
      true,
    );
  });

  it("DeleteJobButtonへ求人情報を渡す", async () => {
    getJobMock.mockResolvedValue(JOB);

    render(<JobDetailPage />);

    expect(await screen.findByTestId("delete-job-button")).toHaveTextContent(
      "job-1:ABC株式会社",
    );
  });

  it("404の場合はNot Found Stateを表示する", async () => {
    getJobMock.mockRejectedValue(new ApiError(404, "Job not found"));

    render(<JobDetailPage />);

    expect(
      await screen.findByRole("heading", {
        name: "求人が見つかりません",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/この求人は存在しないか/)).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "求人一覧へ戻る",
      }),
    ).toHaveAttribute("href", "/jobs");
  });

  it("404以外のAPIエラーの場合はError Stateを表示する", async () => {
    getJobMock.mockRejectedValue(new ApiError(500, "Internal server error"));

    render(<JobDetailPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /求人情報の取得に失敗しました。/,
    );

    expect(
      screen.getByRole("link", {
        name: "求人一覧へ戻る",
      }),
    ).toHaveAttribute("href", "/jobs");
  });

  it("通信エラーの場合もError Stateを表示する", async () => {
    getJobMock.mockRejectedValue(new Error("Network error"));

    render(<JobDetailPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /求人情報の取得に失敗しました。/,
    );
  });

  it("任意項目が未設定の場合は未設定表示にする", async () => {
    getJobMock.mockResolvedValue({
      ...JOB,
      job_url: null,
      location: null,
      employment_type: null,
      salary_min: null,
      salary_max: null,
      next_action: null,
      next_action_date: null,
      memo: null,
    });

    render(<JobDetailPage />);

    await screen.findByRole("heading", {
      name: "Webエンジニア",
    });

    expect(screen.getAllByText("未設定").length).toBeGreaterThanOrEqual(5);

    expect(screen.getByText("メモはありません。")).toBeInTheDocument();
  });
});
