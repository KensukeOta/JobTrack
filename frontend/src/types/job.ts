export type JobStatus =
  | "interested"
  | "planned"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type EmploymentType =
  | "full_time"
  | "contract"
  | "part_time"
  | "temporary"
  | "other";

export type Job = {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  status: JobStatus;
  job_url: string | null;
  location: string | null;
  employment_type: EmploymentType | null;
  salary_min: number | null;
  salary_max: number | null;
  next_action: string | null;
  next_action_date: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type JobCreateRequest = {
  company_name: string;
  job_title: string;
  status: JobStatus;
  job_url: string | null;
  location: string | null;
  employment_type: EmploymentType | null;
  salary_min: number | null;
  salary_max: number | null;
  next_action: string | null;
  next_action_date: string | null;
  memo: string | null;
};

export type JobUpdateRequest = Partial<JobCreateRequest>;

export type JobListResponse = {
  items: Job[];
  total: number;
  page: number;
  page_size: number;
};
