export const MAX_SEARCH_LENGTH = 100

/**
 * Sanitizes user search input to prevent injection, remove non-printable/control chars,
 * strip HTML/script markup, bidi overrides, collapse whitespace, and enforce maximum length limits.
 *
 * @param query - Raw search query from input or URL params
 * @returns Clean, safe search string
 */
export function sanitizeSearch(query: unknown): string {
  if (typeof query !== 'string') {
    return ''
  }

  // 1. Remove null bytes and ASCII control characters (0x00 to 0x1F, 0x7F)
  // eslint-disable-next-line no-control-regex
  let cleaned = query.replace(/[\x00-\x1F\x7F]/g, ' ')

  // 2. Remove Unicode directional formatting and Bidi override characters
  // \u200E (LRM), \u200F (RLM), \u202A-\u202E (LRE, RLE, PDF, LRO, RLO), \u2066-\u2069 (LRI, RLI, FSI, PDI)
  cleaned = cleaned.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')

  // 3. Strip HTML tags / script tags (e.g. <script>alert(1)</script>)
  cleaned = cleaned.replace(/<\/?[a-zA-Z][^>]*>/g, '')

  // 4. Remove angle brackets if any stray remain
  cleaned = cleaned.replace(/[<>]/g, ' ')

  // 5. Neutralize path traversal sequences
  cleaned = cleaned.replace(/\.\.[/\\]/g, '')

  // 6. Collapse multiple whitespace characters (spaces, tabs, newlines) into a single space
  cleaned = cleaned.replace(/\s+/g, ' ')

  // 7. Trim leading and trailing whitespace
  cleaned = cleaned.trim()

  // 8. Enforce strict max length
  if (cleaned.length > MAX_SEARCH_LENGTH) {
    cleaned = cleaned.slice(0, MAX_SEARCH_LENGTH).trim()
  }

  return cleaned
}
