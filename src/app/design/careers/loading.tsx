import { JobSkeleton } from "@/components/careers/career-components";
export default function LoadingCareers() {
  return (
    <main id="main" tabIndex={-1} className="page-shell career-shell">
      <h1 className="section-heading">Loading careers preview</h1>
      <JobSkeleton />
    </main>
  );
}
