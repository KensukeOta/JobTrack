import type { EmploymentType, JobStatus } from "@/types/job";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  interested: "興味あり",
  planned: "応募予定",
  applied: "応募済み",
  screening: "選考中",
  interview: "面接",
  offer: "内定",
  rejected: "不採用",
  withdrawn: "辞退",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "正社員",
  contract: "契約社員",
  part_time: "パート・アルバイト",
  temporary: "派遣",
  other: "その他",
};
