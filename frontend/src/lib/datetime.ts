// Convert a datetime-local value (e.g. "2025-09-22T18:30") to ISO string (UTC)
export function localToISO(dtLocal: string | null | undefined): string | null {
  if (!dtLocal) return null
  const d = new Date(dtLocal)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

// Convert ISO string to datetime-local input value
export function isoToLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  // pad to "YYYY-MM-DDTHH:MM"
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

// Nice display like "Mon, 22 Sep 2025, 18:30"
export function prettyDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleString()
}
