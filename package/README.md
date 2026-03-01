# @knide/pathnorm

[![npm version](https://img.shields.io/npm/v/@knide/pathnorm)](https://www.npmjs.com/package/@knide/pathnorm)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@knide/pathnorm)](https://bundlephobia.com/package/@knide/pathnorm)
[![License](https://img.shields.io/npm/l/@knide/pathnorm)](./LICENSE)

Normalize and join path or URL segments into a single clean string.

- Zero dependencies
- Full TypeScript support
- Tree-shakeable
- **< 500B** minified + gzipped — use `@knide/pathnorm/posix` for an even lighter bundle in browser-only contexts

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
| `@knide/pathnorm`       | ✅    | ✅  | ✅        | ✅   | ✅    |  
| `@knide/pathnorm/posix` | ❌    | ❌  | ❌        | ✅   | ✅    |  

Use `@knide/pathnorm/posix` in browser or web server contexts where Win32 paths will never appear — it's lighter and purpose-built for URLs and POSIX paths.

---

## `@knide/pathnorm`

Exports `np` and `unixNp`.

```ts
import { np, unixNp } from '@knide/pathnorm'
```

### `np(...parts)` (POSIX + Win32 + UNC + URLs)

Joins and normalizes path or URL segments. Detects and handles URLs, POSIX paths, Win32 drive letters, UNC paths, and Win32 namespace paths automatically.

```ts
import { np } from '@knide/pathnorm'

// URLs
np("https://example.com//api/", "v1//users", "profile")
// → "https://example.com/api/v1/users/profile"

np("exp://com.myapp//screens/", "home")
// → "exp://com.myapp/screens/home"

// POSIX
np("/var/www//html/", "assets//images", "logo.png")
// → "/var/www/html/assets/images/logo.png"

np("uploads//images", "/photos")
// → "/uploads/images/photos"

// Win32 drive letter
np("C:\\Users\\\\Alice\\Documents", "report.pdf")
// → "C:\Users\Alice\Documents\report.pdf"

// UNC
np("\\\\server01\\share\\\\docs", "letter.txt")
// → "//server01/share/docs/letter.txt"

// Win32 namespace
np("\\\\?\\C:\\Users\\\\Alice", "report.pdf")
// → "//?/C:/Users/Alice/report.pdf"

// Mixed slashes
np("C:\\projects//my-app\\\\src")
// → "C:\projects\my-app\src"
```

### `unixNp(...parts)` (always forward slashes)

Like `np`, but always returns a Unix-style path with forward slashes. Useful when working with Win32 paths in a Unix-expecting context.

```ts
import { unixNp } from '@knide/pathnorm'

unixNp("C:\\Users\\\\Alice\\Documents", "report.pdf")
// → "C:/Users/Alice/Documents/report.pdf"

unixNp("\\\\server01\\share\\\\docs", "letter.txt")
// → "//server01/share/docs/letter.txt"

unixNp("\\\\?\\C:\\Users\\\\Alice", "report.pdf")
// → "//?/C:/Users/Alice/report.pdf"

unixNp("/var/www//html", "index.html")
// → "/var/www/html/index.html"
```

---

## `@knide/pathnorm/posix`

Exports `np`. No Win32 support — ideal for browser and web server environments.

```ts
import { np } from '@knide/pathnorm/posix'
```

### `np(...parts)` (POSIX + URLs)

```ts
import { np } from '@knide/pathnorm/posix'

// URLs
np("https://example.com//api/", "v1//users", "profile")
// → "https://example.com/api/v1/users/profile"

np("exp://com.myapp//screens/", "home")
// → "exp://com.myapp/screens/home"

// POSIX
np("/var/www//html/", "assets//images", "logo.png")
// → "/var/www/html/assets/images/logo.png"

np("uploads//images", "/photos")
// → "/uploads/images/photos"

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
// Only the first segment's scheme is treated as a URL prefix
np("https://example.com//", "/api/v1", "http://users")
// → "https://example.com/api/v1/http:/users"
```
