"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { JobForm, type JobFormValues } from "@/components/jobs/job-form";
import { ApiError } from "@/lib/api/api-error";
import { createJob } from "@/lib/api/jobs";
import type { JobCreateRequest } from "@/types/job";

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

export function JobCreateForm() {
  const router = useRouter();

  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(data: JobCreateRequest) {
    setApiError(null);

    try {
      await createJob(data);

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          setApiError(
            "セキュリティ情報を確認できませんでした。再ログインしてお試しください。",
          );
          return;
        }

        if (error.status === 422) {
          setApiError("入力内容を確認してください。");
          return;
        }
      }

      setApiError("求人の登録に失敗しました。もう一度お試しください。");
    }
  }

  return (
    <JobForm
      initialValues={INITIAL_VALUES}
      submitLabel="求人を登録"
      submittingLabel="登録しています..."
      cancelHref="/jobs"
      apiError={apiError}
      onSubmit={handleSubmit}
    />
  );
}
