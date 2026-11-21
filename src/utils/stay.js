// Helpers for the stay criteria carried in the URL (?checkIn=&checkOut=&guests=&...), so a search
// can be shared, reloaded and passed from the result list to the room detail page.

const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Nights in [checkIn, checkOut); 0 when either date is missing or the range is invalid. */
export function nightsBetween(checkIn, checkOut) {
  if (!DATE.test(checkIn || '') || !DATE.test(checkOut || '')) return 0
  const nights = Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000)
  return Number.isFinite(nights) && nights > 0 ? nights : 0
}

const SEARCH_KEYS = ['checkIn', 'checkOut', 'guests', 'minPrice', 'maxPrice', 'sort', 'page', 'hotelId', 'roomTypeId']

/** Search criteria from URLSearchParams; unknown keys are ignored. */
export function readSearch(params) {
  const out = {}
  for (const key of SEARCH_KEYS) {
    const value = params.get(key)
    if (value !== null && value !== '') out[key] = value
  }
  return out
}

/** Query string for the given criteria, dropping empty values. */
export function searchQuery(criteria) {
  const params = new URLSearchParams()
  for (const key of SEARCH_KEYS) {
    const value = criteria[key]
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

/** Only the stay part (dates and guests), to carry from a list to a detail page. */
export function stayQuery(criteria) {
  return searchQuery({ checkIn: criteria.checkIn, checkOut: criteria.checkOut, guests: criteria.guests })
}
