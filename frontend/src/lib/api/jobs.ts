import { apiRequest } from "./client";

import type {
  Job,
  JobCreateRequest,
  JobListParams,
  JobListResponse,
  JobUpdateRequest,
} from "@/types/job";

export function getJobs(params: JobListParams = {}): Promise<JobListResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  searchParams.set("sort", params.sort ?? "created_at");

  searchParams.set("order", params.order ?? "desc");

  searchParams.set("page", String(params.page ?? 1));

  searchParams.set("page_size", String(params.page_size ?? 20));

  return apiRequest<JobListResponse>(`/api/v1/jobs?${searchParams.toString()}`);
}

export function getJob(jobId: string): Promise<Job> {
  return apiRequest<Job>(`/api/v1/jobs/${jobId}`);
}

export function createJob(data: JobCreateRequest): Promise<Job> {
  return apiRequest<Job>("/api/v1/jobs", {
    method: "POST",
    body: data,
  });
}

export function updateJob(jobId: string, data: JobUpdateRequest): Promise<Job> {
  return apiRequest<Job>(`/api/v1/jobs/${jobId}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteJob(jobId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/jobs/${jobId}`, {
    method: "DELETE",
  });
}
