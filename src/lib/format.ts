/** Format a date as "Jun 2025". */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

/**
 * Format a date range. When no end date is present, renders "Present"
 * (used for current roles / ongoing education).
 */
export function formatDateRange(
  start: Date | null | undefined,
  end?: Date | null | undefined,
): string {
  if (!start) return "";
  const startLabel = formatMonthYear(start);
  const endLabel = end ? formatMonthYear(end) : "Present";
  return `${startLabel} — ${endLabel}`;
}
