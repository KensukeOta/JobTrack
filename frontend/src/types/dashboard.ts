import type { JobStatus } from "@/types/job";

export type UpcomingAction = {
  job_id: string;
  company_name: string;
  job_title: string;
  status: JobStatus;
  next_action: string | null;
  next_action_date: string;
};

export type DashboardSummary = {
  total_jobs: number;
  active_jobs: number;
  status_counts: Record<JobStatus, number>;
  upcoming_actions: UpcomingAction[];
};
