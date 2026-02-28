/**
 * Normalizes and joins path or URL segments into a single clean path string.
 *
 * Handles the following path types:
 * - URLs with schemes (`https://`, `exp://`, etc.)
 * - POSIX paths (`abc.def//212/`, `/foo/bar`)
 * - Win32 drive letter paths (`C:\foo\\bar`)
 * - UNC paths (`\\server\share`)
 * - Win32 namespace paths (`\\?\C:\foo` or `\\.\C:\foo`)
 *
 * For browser or web-only contexts where Win32 paths are never needed,
 * prefer `pathnorm/posix` instead — it's lighter and purpose-built for
 * URLs and POSIX paths.
 *
 * @param parts - One or more path/URL segments to join and normalize
 * @returns A normalized path string
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
 * // Win32 drive letter
 * np("C:\\foo\\\\bar", "baz")
 * // → "C:\foo\bar\baz"
 *
 * @example
 * // UNC path
 * np("\\\\server\\share\\\\folder", "file.txt")
 * // → "//server/share/folder/file.txt"
 *
 * @example
 * // Win32 namespace path
 * np("\\\\?\\C:\\foo\\\\bar", "baz")
 * // → "//?/C:/foo/bar/baz"
 *
 * @example
 * // Mixed slashes in Win32
 * np("C:\\foo//bar\\\\baz")
 * // → "C:\foo\bar\baz"
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

	// Win32 namespace: \\?\ or \\.\
	if (first.startsWith('\\\\') && (first[2] === '?' || first[2] === '.') && first[3] === '\\') {
		prefix = `//${first[2]}/`
		rest = [first.slice(4), ...tail]
	}
	// UNC path: \\server\share
	else if (first.startsWith('\\\\')) {
		prefix = '//'
		rest = [first.slice(2), ...tail]
	}
	// Win32 drive letter: C:\
	else if (first.length >= 3 && first[1] === ':' && first[2] === '\\') {
		prefix = first.slice(0, 3)
		rest = [first.slice(3), ...tail]
	}
	// URL scheme: find "://" explicitly
	else {
		const schemeEnd = first.indexOf('://')
		if (schemeEnd !== -1) {
			prefix = first.slice(0, schemeEnd + 3) // e.g. "https://"
			rest = [first.slice(prefix.length), ...tail]
		} else {
			rest = parts
		}
	}

	const isWin32 =
		(prefix.length > 0 && prefix.includes('\\')) ||
		(first.length >= 3 && first[1] === ':' && first[2] === '\\')

	const sep = isWin32 ? '\\' : '/'

	const joined = rest.join(sep)
	const normalized = joined.replace(/[/\\]+/g, sep)

	if (prefix.length > 0) {
		// Strip leading slash to avoid e.g. "https:///foo"
		return `${prefix}${normalized.replace(sep === '\\' ? /^\\/ : /^\//, '')}`
	}

	// For plain paths, preserve leading slash if any segment introduced one
	const hasLeadingSlash = rest.some((p) => p.startsWith('/') || p.startsWith('\\'))
	return hasLeadingSlash ? `${sep}${normalized.replace(/^[/\\]/, '')}` : normalized
}

/**
 * Like `np(...)`, but always returns a Unix-style path.
 *
 * Useful when you're working with Win32 paths (drive letters, UNC, namespace)
 * but need the result in Unix format — for example, when passing a Windows
 * file path to a tool that expects forward slashes.
 *
 * Internally calls `np` to join and normalize the segments, then converts
 * all backslashes (`\`) in the result to forward slashes (`/`).
 *
 * @param parts - One or more path/URL segments to join and normalize
 * @returns A normalized Unix-style path string
 *
 * @example
 * // Win32 drive letter → Unix
 * unixNp("C:\\foo\\\\bar", "baz")
 * // → "C:/foo/bar/baz"
 *
 * @example
 * // UNC path → Unix
 * unixNp("\\\\server\\share\\\\folder", "file.txt")
 * // → "//server/share/folder/file.txt"
 *
 * @example
 * // Win32 namespace → Unix
 * unixNp("\\\\?\\C:\\foo\\\\bar", "baz")
 * // → "//?/C:/foo/bar/baz"
 *
 * @example
 * // POSIX paths pass through unchanged
 * unixNp("/foo//bar", "baz")
 * // → "/foo/bar/baz"
 */
export const unixNp = (...parts: string[]): string => np(...parts).replace(/\\/g, '/')
