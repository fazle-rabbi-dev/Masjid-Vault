const NOTE_MAX = 300

export function parseReviewNote(
  formData: FormData
): { value: string | null } | { error: string } {
  const note = String(formData.get("reviewNote") ?? "").trim()

  if (note.length > NOTE_MAX) {
    return { error: `Review note must be ${NOTE_MAX} characters or fewer.` }
  }

  return { value: note || null }
}
