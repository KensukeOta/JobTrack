import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { JobCreateRequest } from "@/types/job";

import { JobForm, type JobFormValues } from "./job-form";

const INITIAL_VALUES: JobFormValues = {
  companyName: "",
  jobTitle: "",
  status: "interested",
  jobUrl: "",
  location: "",
  employmentType: "",
  salaryMin: "",
  salaryMax: "",
  nextAction: "",
  nextActionDate: "",
  memo: "",
};

function renderJobForm(
  options: {
    initialValues?: JobFormValues;
    apiError?: string | null;
    onSubmit?: (data: JobCreateRequest) => Promise<void>;
    cancelHref?: string;
  } = {},
) {
  const onSubmit =
    options.onSubmit ?? vi.fn<(data: JobCreateRequest) => Promise<void>>();

  render(
    <JobForm
      initialValues={options.initialValues ?? INITIAL_VALUES}
      submitLabel="求人を登録"
      submittingLabel="登録しています..."
      cancelHref={options.cancelHref ?? "/jobs"}
      apiError={options.apiError ?? null}
      onSubmit={onSubmit}
    />,
  );

  return {
    onSubmit,
  };
}

describe("JobForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期値を表示する", () => {
    const initialValues: JobFormValues = {
      companyName: "ABC株式会社",
      jobTitle: "Webエンジニア",
      status: "interview",
      jobUrl: "https://example.com/jobs/1",
      location: "大阪府大阪市",
      employmentType: "full_time",
      salaryMin: "3000000",
      salaryMax: "5000000",
      nextAction: "一次面接",
      nextActionDate: "2026-09-20",
      memo: "テストメモ",
    };

    renderJobForm({
      initialValues,
    });

    expect(screen.getByLabelText(/企業名/)).toHaveValue("ABC株式会社");

    expect(screen.getByLabelText(/職種/)).toHaveValue("Webエンジニア");

    expect(screen.getByLabelText("ステータス")).toHaveValue("interview");

    expect(screen.getByLabelText("求人URL")).toHaveValue(
      "https://example.com/jobs/1",
    );

    expect(screen.getByLabelText("勤務地")).toHaveValue("大阪府大阪市");

    expect(screen.getByLabelText("雇用形態")).toHaveValue("full_time");

    expect(screen.getByLabelText("最低給与")).toHaveValue(3000000);

    expect(screen.getByLabelText("最高給与")).toHaveValue(5000000);

    expect(screen.getByLabelText("内容")).toHaveValue("一次面接");

    expect(screen.getByLabelText("日付")).toHaveValue("2026-09-20");

    expect(screen.getByLabelText("メモ")).toHaveValue("テストメモ");
  });

  it("各フィールドへ入力できる", async () => {
    const user = userEvent.setup();

    renderJobForm();

    await user.type(screen.getByLabelText(/企業名/), "ABC株式会社");

    await user.type(screen.getByLabelText(/職種/), "Webエンジニア");

    await user.selectOptions(screen.getByLabelText("ステータス"), "applied");

    await user.type(
      screen.getByLabelText("求人URL"),
      "https://example.com/jobs/1",
    );

    await user.type(screen.getByLabelText("勤務地"), "大阪府大阪市");

    await user.selectOptions(screen.getByLabelText("雇用形態"), "full_time");

    await user.type(screen.getByLabelText("最低給与"), "3000000");

    await user.type(screen.getByLabelText("最高給与"), "5000000");

    await user.type(screen.getByLabelText("内容"), "書類提出");

    await user.type(screen.getByLabelText("日付"), "2026-09-20");

    await user.type(screen.getByLabelText("メモ"), "応募予定");

    expect(screen.getByLabelText(/企業名/)).toHaveValue("ABC株式会社");

    expect(screen.getByLabelText(/職種/)).toHaveValue("Webエンジニア");

    expect(screen.getByLabelText("ステータス")).toHaveValue("applied");

    expect(screen.getByLabelText("雇用形態")).toHaveValue("full_time");
  });

  it("企業名と職種が未入力の場合はエラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderJobForm();

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    expect(screen.getByText("企業名を入力してください。")).toBeInTheDocument();

    expect(screen.getByText("職種を入力してください。")).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("最低給与が負数の場合はエラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderJobForm();

    await user.type(screen.getByLabelText(/企業名/), "ABC株式会社");
    await user.type(screen.getByLabelText(/職種/), "Webエンジニア");

    await user.type(screen.getByLabelText("最低給与"), "-1");

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    expect(
      screen.getByText("最低給与は0以上の整数で入力してください。"),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("最高給与が最低給与より小さい場合はエラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderJobForm();

    await user.type(screen.getByLabelText(/企業名/), "ABC株式会社");
    await user.type(screen.getByLabelText(/職種/), "Webエンジニア");

    await user.type(screen.getByLabelText("最低給与"), "5000000");
    await user.type(screen.getByLabelText("最高給与"), "3000000");

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    expect(
      screen.getByText("最高給与は最低給与以上で入力してください。"),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("正常入力時に変換したデータをonSubmitへ渡す", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderJobForm({
      onSubmit,
    });

    await user.type(screen.getByLabelText(/企業名/), "  ABC株式会社  ");

    await user.type(screen.getByLabelText(/職種/), "  Webエンジニア  ");

    await user.selectOptions(screen.getByLabelText("ステータス"), "applied");

    await user.type(
      screen.getByLabelText("求人URL"),
      "  https://example.com/jobs/1  ",
    );

    await user.type(screen.getByLabelText("勤務地"), "  大阪府大阪市  ");

    await user.selectOptions(screen.getByLabelText("雇用形態"), "full_time");

    await user.type(screen.getByLabelText("最低給与"), "3000000");

    await user.type(screen.getByLabelText("最高給与"), "5000000");

    await user.type(screen.getByLabelText("内容"), "  一次面接  ");

    await user.type(screen.getByLabelText("日付"), "2026-09-20");

    await user.type(screen.getByLabelText("メモ"), "  テストメモ  ");

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
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
      });
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("空の任意項目をnullへ変換する", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderJobForm({
      onSubmit,
    });

    await user.type(screen.getByLabelText(/企業名/), "ABC株式会社");

    await user.type(screen.getByLabelText(/職種/), "Webエンジニア");

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        company_name: "ABC株式会社",
        job_title: "Webエンジニア",
        status: "interested",
        job_url: null,
        location: null,
        employment_type: null,
        salary_min: null,
        salary_max: null,
        next_action: null,
        next_action_date: null,
        memo: null,
      });
    });
  });

  it("apiErrorが指定された場合はエラーを表示する", () => {
    renderJobForm({
      apiError: "求人の登録に失敗しました。",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "求人の登録に失敗しました。",
    );
  });

  it("キャンセルリンクに指定されたURLを設定する", () => {
    renderJobForm({
      cancelHref: "/jobs/job-1",
    });

    expect(
      screen.getByRole("link", {
        name: "キャンセル",
      }),
    ).toHaveAttribute("href", "/jobs/job-1");
  });

  it("企業名と職種が200文字を超える場合はエラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderJobForm();

    await user.type(screen.getByLabelText(/企業名/), "a".repeat(201));

    await user.type(screen.getByLabelText(/職種/), "b".repeat(201));

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    expect(
      screen.getByText("企業名は200文字以内で入力してください。"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("職種は200文字以内で入力してください。"),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("最低給与が整数でない場合はエラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderJobForm();

    await user.type(screen.getByLabelText(/企業名/), "ABC株式会社");

    await user.type(screen.getByLabelText(/職種/), "Webエンジニア");

    await user.type(screen.getByLabelText("最低給与"), "100.5");

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    expect(
      screen.getByText("最低給与は0以上の整数で入力してください。"),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("最高給与が整数でない場合はエラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderJobForm();

    await user.type(screen.getByLabelText(/企業名/), "ABC株式会社");

    await user.type(screen.getByLabelText(/職種/), "Webエンジニア");

    await user.type(screen.getByLabelText("最高給与"), "100.5");

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    expect(
      screen.getByText("最高給与は0以上の整数で入力してください。"),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("送信中はボタンを無効化して二重送信を防止する", async () => {
    const user = userEvent.setup();

    let resolveSubmit: (() => void) | undefined;

    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    renderJobForm({
      onSubmit,
    });

    await user.type(screen.getByLabelText(/企業名/), "ABC株式会社");

    await user.type(screen.getByLabelText(/職種/), "Webエンジニア");

    await user.click(
      screen.getByRole("button", {
        name: "求人を登録",
      }),
    );

    const submittingButton = screen.getByRole("button", {
      name: "登録しています...",
    });

    expect(submittingButton).toBeDisabled();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.click(submittingButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    resolveSubmit?.();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "求人を登録",
        }),
      ).toBeEnabled();
    });
  });
});
