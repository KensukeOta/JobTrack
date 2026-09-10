import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { getJob, updateJob } from "@/lib/api/jobs";
import type { Job, JobCreateRequest } from "@/types/job";

import EditJobPage from "./page";

const mocks = vi.hoisted(() => ({
  jobId: "job-1",
  push: vi.fn(),
  refresh: vi.fn(),
}));

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

const UPDATE_DATA: JobCreateRequest = {
  company_name: "XYZ株式会社",
  job_title: "フロントエンドエンジニア",
  status: "applied",
  job_url: null,
  location: "大阪府大阪市",
  employment_type: "full_time",
  salary_min: 3500000,
  salary_max: 5500000,
  next_action: "書類提出",
  next_action_date: "2026-09-25",
  memo: "更新後メモ",
};

vi.mock("next/navigation", () => ({
  useParams: () => ({
    jobId: mocks.jobId,
  }),
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/lib/api/jobs", () => ({
  getJob: vi.fn(),
  updateJob: vi.fn(),
}));

vi.mock("@/components/auth/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/app-header", () => ({
  AppHeader: () => <div data-testid="app-header">AppHeader</div>,
}));

vi.mock("@/components/jobs/job-form", () => ({
  JobForm: ({
    initialValues,
    submitLabel,
    submittingLabel,
    cancelHref,
    apiError,
    onSubmit,
  }: {
    initialValues: {
      companyName: string;
      jobTitle: string;
      status: string;
      jobUrl: string;
      location: string;
      employmentType: string;
      salaryMin: string;
      salaryMax: string;
      nextAction: string;
      nextActionDate: string;
      memo: string;
    };
    submitLabel: string;
    submittingLabel: string;
    cancelHref: string;
    apiError: string | null;
    onSubmit: (data: JobCreateRequest) => Promise<void>;
  }) => (
    <div>
      <div data-testid="company-name">{initialValues.companyName}</div>

      <div data-testid="job-title">{initialValues.jobTitle}</div>

      <div data-testid="status">{initialValues.status}</div>

      <div data-testid="job-url">{initialValues.jobUrl}</div>

      <div data-testid="location">{initialValues.location}</div>

      <div data-testid="employment-type">{initialValues.employmentType}</div>

      <div data-testid="salary-min">{initialValues.salaryMin}</div>

      <div data-testid="salary-max">{initialValues.salaryMax}</div>

      <div data-testid="next-action">{initialValues.nextAction}</div>

      <div data-testid="next-action-date">{initialValues.nextActionDate}</div>

      <div data-testid="memo">{initialValues.memo}</div>

      <div data-testid="submit-label">{submitLabel}</div>

      <div data-testid="submitting-label">{submittingLabel}</div>

      <div data-testid="cancel-href">{cancelHref}</div>

      {apiError && <div role="alert">{apiError}</div>}

      <button
        type="button"
        onClick={() => {
          void onSubmit(UPDATE_DATA);
        }}
      >
        テスト更新
      </button>
    </div>
  ),
}));

const getJobMock = vi.mocked(getJob);
const updateJobMock = vi.mocked(updateJob);

describe("EditJobPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.jobId = "job-1";
  });

  it("読み込み中はLoading Stateを表示する", () => {
    getJobMock.mockImplementation(() => new Promise(() => {}));

    render(<EditJobPage />);

    expect(
      screen.getByText("求人情報を読み込んでいます..."),
    ).toBeInTheDocument();
  });

  it("既存求人を取得してJobFormへ初期値を渡す", async () => {
    getJobMock.mockResolvedValue(JOB);

    render(<EditJobPage />);

    await screen.findByRole("heading", {
      name: "求人を編集",
    });

    expect(getJobMock).toHaveBeenCalledWith("job-1");

    expect(screen.getByTestId("company-name")).toHaveTextContent("ABC株式会社");

    expect(screen.getByTestId("job-title")).toHaveTextContent("Webエンジニア");

    expect(screen.getByTestId("status")).toHaveTextContent("interview");

    expect(screen.getByTestId("job-url")).toHaveTextContent(
      "https://example.com/jobs/1",
    );

    expect(screen.getByTestId("location")).toHaveTextContent("大阪府大阪市");

    expect(screen.getByTestId("employment-type")).toHaveTextContent(
      "full_time",
    );

    expect(screen.getByTestId("salary-min")).toHaveTextContent("3000000");

    expect(screen.getByTestId("salary-max")).toHaveTextContent("5000000");

    expect(screen.getByTestId("next-action")).toHaveTextContent("一次面接");

    expect(screen.getByTestId("next-action-date")).toHaveTextContent(
      "2026-09-20",
    );

    expect(screen.getByTestId("memo")).toHaveTextContent("テストメモ");
  });

  it("nullの任意項目を空文字へ変換する", async () => {
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

    render(<EditJobPage />);

    await screen.findByRole("heading", {
      name: "求人を編集",
    });

    expect(screen.getByTestId("job-url")).toHaveTextContent("");

    expect(screen.getByTestId("location")).toHaveTextContent("");

    expect(screen.getByTestId("employment-type")).toHaveTextContent("");

    expect(screen.getByTestId("salary-min")).toHaveTextContent("");

    expect(screen.getByTestId("salary-max")).toHaveTextContent("");

    expect(screen.getByTestId("next-action")).toHaveTextContent("");

    expect(screen.getByTestId("next-action-date")).toHaveTextContent("");

    expect(screen.getByTestId("memo")).toHaveTextContent("");
  });

  it("JobFormへ編集画面用の設定を渡す", async () => {
    getJobMock.mockResolvedValue(JOB);

    render(<EditJobPage />);

    await screen.findByRole("heading", {
      name: "求人を編集",
    });

    expect(screen.getByTestId("submit-label")).toHaveTextContent("変更を保存");

    expect(screen.getByTestId("submitting-label")).toHaveTextContent(
      "保存しています...",
    );

    expect(screen.getByTestId("cancel-href")).toHaveTextContent("/jobs/job-1");

    expect(
      screen.getByRole("link", {
        name: /求人詳細へ戻る/,
      }),
    ).toHaveAttribute("href", "/jobs/job-1");
  });

  it("送信時にupdateJob APIを呼び出す", async () => {
    const user = userEvent.setup();

    getJobMock.mockResolvedValue(JOB);

    render(<EditJobPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト更新",
      }),
    );

    await waitFor(() => {
      expect(updateJobMock).toHaveBeenCalledWith("job-1", UPDATE_DATA);
    });

    expect(updateJobMock).toHaveBeenCalledTimes(1);
  });

  it("更新成功時に求人詳細へ遷移してrefreshする", async () => {
    const user = userEvent.setup();

    getJobMock.mockResolvedValue(JOB);

    render(<EditJobPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト更新",
      }),
    );

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/jobs/job-1");
    });

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("求人取得時の404はNot Found Stateを表示する", async () => {
    getJobMock.mockRejectedValue(new ApiError(404, "Job not found"));

    render(<EditJobPage />);

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

  it("求人取得時のその他のエラーはError Stateを表示する", async () => {
    getJobMock.mockRejectedValue(new Error("Network error"));

    render(<EditJobPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "求人情報の取得に失敗しました。",
    );
  });

  it("更新時の404はNot Found Stateへ切り替える", async () => {
    const user = userEvent.setup();

    getJobMock.mockResolvedValue(JOB);

    updateJobMock.mockRejectedValue(new ApiError(404, "Job not found"));

    render(<EditJobPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト更新",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "求人が見つかりません",
      }),
    ).toBeInTheDocument();

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("更新時の403はセキュリティエラーを表示する", async () => {
    const user = userEvent.setup();

    getJobMock.mockResolvedValue(JOB);

    updateJobMock.mockRejectedValue(
      new ApiError(403, "CSRF validation failed"),
    );

    render(<EditJobPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト更新",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "セキュリティ情報を確認できませんでした。再ログインしてお試しください。",
    );

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("更新時の422は入力エラーを表示する", async () => {
    const user = userEvent.setup();

    getJobMock.mockResolvedValue(JOB);

    updateJobMock.mockRejectedValue(new ApiError(422, "Validation error"));

    render(<EditJobPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト更新",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "入力内容を確認してください。",
    );

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("更新時の通信エラーは更新失敗メッセージを表示する", async () => {
    const user = userEvent.setup();

    getJobMock.mockResolvedValue(JOB);

    updateJobMock.mockRejectedValue(new Error("Network error"));

    render(<EditJobPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "テスト更新",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "求人の更新に失敗しました。もう一度お試しください。",
    );

    expect(mocks.push).not.toHaveBeenCalled();
  });
});
