import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { deleteJob } from "@/lib/api/jobs";

import { DeleteJobButton } from "./delete-job-button";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/lib/api/jobs", () => ({
  deleteJob: vi.fn(),
}));

const deleteJobMock = vi.mocked(deleteJob);

describe("DeleteJobButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("削除ボタンを押すと確認モーダルを表示する", async () => {
    const user = userEvent.setup();

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "求人を削除しますか？",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/ABC株式会社/)).toBeInTheDocument();
  });

  it("キャンセルするとモーダルを閉じて削除しない", async () => {
    const user = userEvent.setup();

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "キャンセル",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    expect(deleteJobMock).not.toHaveBeenCalled();
  });

  it("削除実行時にdeleteJob APIを呼び出す", async () => {
    const user = userEvent.setup();

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "削除する",
      }),
    );

    await waitFor(() => {
      expect(deleteJobMock).toHaveBeenCalledWith("job-1");
    });

    expect(deleteJobMock).toHaveBeenCalledTimes(1);
  });

  it("削除成功時に求人一覧へ遷移してrefreshする", async () => {
    const user = userEvent.setup();

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "削除する",
      }),
    );

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/jobs");
    });

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("404の場合は対象が存在しない旨を表示する", async () => {
    const user = userEvent.setup();

    deleteJobMock.mockRejectedValue(new ApiError(404, "Job not found"));

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "削除する",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "この求人は既に削除されているか、削除する権限がありません。",
    );

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("403の場合はセキュリティエラーを表示する", async () => {
    const user = userEvent.setup();

    deleteJobMock.mockRejectedValue(
      new ApiError(403, "CSRF validation failed"),
    );

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "削除する",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "セキュリティ情報を確認できませんでした。再ログインしてお試しください。",
    );
  });

  it("通信エラーの場合は通信エラーメッセージを表示する", async () => {
    const user = userEvent.setup();

    deleteJobMock.mockRejectedValue(new Error("Network error"));

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "削除する",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "通信エラーが発生しました。もう一度お試しください。",
    );

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("削除中はボタンを無効化して二重削除を防止する", async () => {
    const user = userEvent.setup();

    let resolveDelete: (() => void) | undefined;

    deleteJobMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        }),
    );

    render(<DeleteJobButton jobId="job-1" companyName="ABC株式会社" />);

    await user.click(
      screen.getByRole("button", {
        name: "削除",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "削除する",
      }),
    );

    const deletingButton = screen.getByRole("button", {
      name: "削除しています...",
    });

    expect(deletingButton).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "キャンセル",
      }),
    ).toBeDisabled();

    expect(deleteJobMock).toHaveBeenCalledTimes(1);

    await user.click(deletingButton);

    expect(deleteJobMock).toHaveBeenCalledTimes(1);

    resolveDelete?.();

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/jobs");
    });
  });
});
