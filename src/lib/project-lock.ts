const LOCK_AFTER_DAYS = 3;

interface LockableProject {
  unlocked: boolean;
  resultsViewedAt: string | Date | null;
  updatedAt: string | Date;
}

export function isProjectLocked(project: LockableProject): boolean {
  if (project.unlocked || !project.resultsViewedAt) return false;
  const daysSinceActivity = (Date.now() - new Date(project.updatedAt).getTime()) / 86400000;
  return daysSinceActivity >= LOCK_AFTER_DAYS;
}
