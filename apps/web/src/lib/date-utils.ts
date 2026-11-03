export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDays(dateString?: string | null): string {
  if (!dateString) return "Not scheduled";
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return "Invalid date";

  const now = new Date();
  // Strip time for clean day comparison
  const dTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = dTarget.getTime() - dNow.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Renews Today";
  if (diffDays === 1) return "Renews Tomorrow";
  if (diffDays === -1) return "Renewed Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `Renews in ${diffDays} days`;
  if (diffDays > 7) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

export function toInputDateValue(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

