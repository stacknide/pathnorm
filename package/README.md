# @knide/pathnorm

Normalize and join path or URL segments into a single clean string.

- Zero dependencies
- Dual CJS + ESM build
- Full TypeScript support
- Tree-shakeable

## Installation

```sh
npm install @knide/pathnorm
# or
yarn add @knide/pathnorm
# or
pnpm add @knide/pathnorm
```

## Two Entry Points

| Import                  | Win32 | UNC | Namespace | URLs | POSIX |
|-------------------------|-------|-----|-----------|------|-------|
| `@knide/pathnorm`       |  ✅   | ✅  |    ✅     |  ✅  |   ✅  |  
| `@knide/pathnorm/posix` |  ❌   | ❌  |    ❌     |  ✅  |   ✅  |  

Use `@knide/pathnorm/posix` in browser or web server contexts where Win32 paths will never appear — it's lighter and purpose-built for URLs and POSIX paths.

---

## `@knide/pathnorm`

Exports `np` and `unixNp`.

```ts
import { np, unixNp } from '@knide/pathnorm'
```

### `np(...parts)`

Joins and normalizes path or URL segments. Detects and handles URLs, POSIX paths, Win32 drive letters, UNC paths, and Win32 namespace paths automatically.

```ts
import { np } from '@knide/pathnorm'
// URLs
np("https://abc.def//212/", "dw//we", "23123")
// → "https://abc.def/212/dw/we/23123"

np("exp://abc.def//212/", "dw/we")
// → "exp://abc.def/212/dw/we"

// POSIX
np("abc.def//212/", "dwwe", "23123")
// → "abc.def/212/dwwe/23123"

np("foo//bar", "/baz")
// → "/foo/bar/baz"

np("/foo//bar", "baz")
// → "/foo/bar/baz"

// Win32 drive letter
np("C:\\foo\\\\bar", "baz")
// → "C:\foo\bar\baz"

// UNC
np("\\\\server\\share\\\\folder", "file.txt")
// → "//server/share/folder/file.txt"

// Win32 namespace
np("\\\\?\\C:\\foo\\\\bar", "baz")
// → "//?/C:/foo/bar/baz"

// Mixed slashes in Win32
np("C:\\foo//bar\\\\baz")
// → "C:\foo\bar\baz"
```

### `unixNp(...parts)`

Like `np`, but always returns a Unix-style path. Useful when working with Win32 paths but the consumer expects forward slashes.

```ts
import { unixNp } from '@knide/pathnorm'
unixNp("C:\\foo\\\\bar", "baz")
// → "C:/foo/bar/baz"

unixNp("\\\\server\\share\\\\folder", "file.txt")
// → "//server/share/folder/file.txt"

unixNp("\\\\?\\C:\\foo\\\\bar", "baz")
// → "//?/C:/foo/bar/baz"

// POSIX paths pass through unchanged
unixNp("/foo//bar", "baz")
// → "/foo/bar/baz"
```

---

## `@knide/pathnorm/posix`

Exports `np`. No Win32 support — ideal for browser and web server environments.

```ts
import { np } from '@knide/pathnorm/posix'
```

### `np(...parts)` (POSIX + URLs)

Joins and normalizes URL or POSIX path segments.

```ts
import { np } from '@knide/pathnorm/posix'
// URLs
np("https://abc.def//212/", "dw//we", "23123")
// → "https://abc.def/212/dw/we/23123"

np("exp://abc.def//212/", "dw/we")
// → "exp://abc.def/212/dw/we"

// POSIX
np("abc.def//212/", "dwwe", "23123")
// → "abc.def/212/dwwe/23123"

np("foo//bar", "/baz")
// → "/foo/bar/baz"

np("/foo//bar", "baz")
// → "/foo/bar/baz"

// Typical web usage
np(window.location.origin, "/api/proxy//betterauth")
// → "https://myapp.com/api/proxy/betterauth"
```

---

## Behavior Notes

- Only the **first** segment is checked for a URL scheme (`://`). Subsequent segments that look like URLs are treated as plain path parts.
- Leading slashes are preserved if **any** segment introduces one.
- Consecutive slashes (or backslashes in Win32 mode) are collapsed into one.
- Trailing slashes are not preserved.

```ts
// Only first scheme is treated as prefix
np("exp://", "sdfasdf", "abc.def//212/", "dw//we", "23123", "https://")
// → "exp://sdfasdf/abc.def/212/dw/we/23123/https:/"
```
