import { JobCard } from "./job-card";

import type { Job } from "@/types/job";

type JobListProps = {
  jobs: Job[];
};

export function JobList({ jobs }: JobListProps) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
