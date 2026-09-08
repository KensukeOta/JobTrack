import { apiRequest } from "./client";

import type { JobListResponse } from "@/types/job";

export function getJobs(): Promise<JobListResponse> {
  const params = new URLSearchParams({
    page: "1",
    page_size: "20",
    sort: "created_at",
    order: "desc",
  });

  return apiRequest<JobListResponse>(`/api/v1/jobs?${params.toString()}`);
}
