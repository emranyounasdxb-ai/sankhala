import type { StaffRole } from "./domain";

export type StaffIdentity = { id: string; role: StaffRole; active: boolean };
export type RecordScope = {
  assignedRecruiterId: string | null;
  assignedStaffIds: string[];
};
export type AtsAction =
  | "view"
  | "document"
  | "note"
  | "interview"
  | "stage"
  | "export"
  | "manage_jobs"
  | "manage_staff"
  | "retention"
  | "link_duplicate";

/** Call with server-resolved staff and assignments, never request-body roles. */
export function mayAccess(
  staff: StaffIdentity | null,
  action: AtsAction,
  record?: RecordScope,
): boolean {
  if (!staff?.active) return false;
  if (staff.role === "admin") return true;
  if (
    !record ||
    ![record.assignedRecruiterId, ...record.assignedStaffIds].includes(staff.id)
  )
    return false;
  if (staff.role === "recruiter")
    return [
      "view",
      "document",
      "note",
      "interview",
      "stage",
      "export",
    ].includes(action);
  if (staff.role === "hiring_manager")
    return ["view", "document", "note", "interview"].includes(action);
  return false;
}
