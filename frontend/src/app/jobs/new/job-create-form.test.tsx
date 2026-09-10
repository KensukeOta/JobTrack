import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { createJob } from "@/lib/api/jobs";
import type { JobCreateRequest } from "@/types/job";

import { JobCreateForm } from "./job-create-form";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

const JOB_DATA: JobCreateRequest = {
  company_name: "ABC株式会社",
  job_title: "Webエンジニア",
  status: "applied",
  job_url: "https://example.com/jobs/1",
  location: "大阪府大阪市",
  employment_type: "full_time",
  salary_min: 3000000,
  salary_max: 5000000,
  next_action: "一次面接",
  next_action_date: "2026-09-20",
  memo: "テストメモ",
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/lib/api/jobs", () => ({
  createJob: vi.fn(),
}));

vi.mock("@/components/jobs/job-form", () => ({
  JobForm: ({
    onSubmit,
    apiError,
    submitLabel,
    submittingLabel,
    cancelHref,
  }: {
    onSubmit: (data: JobCreateRequest) => Promise<void>;
    apiError: string | null;
    submitLabel: string;
    submittingLabel: string;
    cancelHref: string;
  }) => (
    <div>
      <div data-testid="submit-label">{submitLabel}</div>

      <div data-testid="submitting-label">{submittingLabel}</div>

      <div data-testid="cancel-href">{cancelHref}</div>

      {apiError && <div role="alert">{apiError}</div>}

      <button
        type="button"
        onClick={() => {
          void onSubmit(JOB_DATA);
        }}
      >
        テスト送信
      </button>
    </div>
  ),
}));

const createJobMock = vi.mocked(createJob);

describe("JobCreateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("JobFormへ作成画面用の設定を渡す", () => {
    render(<JobCreateForm />);

    expect(screen.getByTestId("submit-label")).toHaveTextContent("求人を登録");

    expect(screen.getByTestId("submitting-label")).toHaveTextContent(
      "登録しています...",
    );

    expect(screen.getByTestId("cancel-href")).toHaveTextContent("/jobs");
  });

  it("送信時にcreateJob APIを呼び出す", async () => {
    const user = userEvent.setup();

    render(<JobCreateForm />);

    await user.click(
      screen.getByRole("button", {
        name: "テスト送信",
      }),
    );

    await waitFor(() => {
      expect(createJobMock).toHaveBeenCalledWith(JOB_DATA);
    });

    expect(createJobMock).toHaveBeenCalledTimes(1);
  });

  it("作成成功時に求人一覧へ遷移してrefreshする", async () => {
    const user = userEvent.setup();

    render(<JobCreateForm />);

    await user.click(
      screen.getByRole("button", {
        name: "テスト送信",
      }),
    );

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/jobs");
    });

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("403の場合はCSRF関連のエラーを表示する", async () => {
    const user = userEvent.setup();

    createJobMock.mockRejectedValue(
      new ApiError(403, "CSRF validation failed"),
    );

    render(<JobCreateForm />);

    await user.click(
      screen.getByRole("button", {
        name: "テスト送信",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "セキュリティ情報を確認できませんでした。再ログインしてお試しください。",
    );

    expect(mocks.push).not.toHaveBeenCalled();

    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("422の場合は入力エラーを表示する", async () => {
    const user = userEvent.setup();

    createJobMock.mockRejectedValue(new ApiError(422, "Validation error"));

    render(<JobCreateForm />);

    await user.click(
      screen.getByRole("button", {
        name: "テスト送信",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "入力内容を確認してください。",
    );

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("通信エラーの場合は登録失敗メッセージを表示する", async () => {
    const user = userEvent.setup();

    createJobMock.mockRejectedValue(new Error("Network error"));

    render(<JobCreateForm />);

    await user.click(
      screen.getByRole("button", {
        name: "テスト送信",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "求人の登録に失敗しました。もう一度お試しください。",
    );

    expect(mocks.push).not.toHaveBeenCalled();

    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
