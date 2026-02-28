/**
 * Normalizes and joins URL or POSIX path segments into a single clean path string.
 *
 * Lighter alternative to the default `np` — no Win32 support. Ideal for browser
 * or web server contexts where backslashes and drive letters will never appear.
 *
 * Handles:
 * - URLs with schemes (`https://`, `exp://`, etc.)
 * - POSIX paths (`abc.def//212/`, `/foo/bar`)
 *
 * @param parts - One or more URL or POSIX path segments to join and normalize
 * @returns A normalized URL or POSIX path string
 *
 * @example
 * // URL with scheme
 * np("https://abc.def//212/", "dw//we", "23123")
 * // → "https://abc.def/212/dw/we/23123"
 *
 * @example
 * // Custom scheme
 * np("exp://abc.def//212/", "dw/we")
 * // → "exp://abc.def/212/dw/we"
 *
 * @example
 * // POSIX path without leading slash
 * np("abc.def//212/", "dwwe", "23123")
 * // → "abc.def/212/dwwe/23123"
 *
 * @example
 * // POSIX path with leading slash from any segment
 * np("foo//bar", "/baz")
 * // → "/foo/bar/baz"
 *
 * @example
 * // POSIX path with leading slash on first segment
 * np("/foo//bar", "baz")
 * // → "/foo/bar/baz"
 *
 * @example
 * // Typical web usage
 * np(window.location.origin, "/api/proxy//betterauth")
 * // → "https://myapp.com/api/proxy/betterauth"
 *
 * @example
 * // Multiple URL-like segments (only first scheme is treated as prefix)
 * np("exp://", "sdfasdf", "abc.def//212/", "dw//we", "23123", "https://")
 * // → "exp://sdfasdf/abc.def/212/dw/we/23123/https:/"
 */
export const np = (...parts: string[]): string => {
	if (parts.length === 0) return ''

	const [first, ...tail] = parts
	if (first === undefined) return ''

	let prefix = ''
	let rest: string[]

	const schemeEnd = first.indexOf('://')
	if (schemeEnd !== -1) {
		prefix = first.slice(0, schemeEnd + 3) // e.g. "https://"
		rest = [first.slice(prefix.length), ...tail]
	} else {
		rest = parts
	}

	const joined = rest.join('/')
	const normalized = joined.replace(/\/+/g, '/')

	if (prefix.length > 0) {
		return `${prefix}${normalized.replace(/^\//, '')}`
	}

	const hasLeadingSlash = rest.some((p) => p.startsWith('/'))
	return hasLeadingSlash ? `/${normalized.replace(/^\//, '')}` : normalized
}
