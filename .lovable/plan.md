

## Why the background is dark

The `data-theme="fantasy"` attribute is placed on a `<div>` inside `ThemeProvider`, but the `background-color: hsl(var(--background))` is applied to `body`. Since `body` doesn't have the `data-theme` attribute, it always uses the `:root` (sci-fi dark) background color.

## Fix

**`src/contexts/ThemeContext.tsx`**: Add a `useEffect` that sets `data-theme` on `document.documentElement` (the `<html>` element) whenever the theme changes. This ensures `:root` level CSS variable overrides apply to `body`.

Alternatively, keep the `data-theme` on the div but also set `background-color` on that div so it covers the body. The simplest fix is to apply the theme attribute to `document.documentElement`.

### Changes:
1. **`src/contexts/ThemeContext.tsx`** — Add `useEffect` to sync `data-theme` to `document.documentElement`, and give the wrapper div `min-h-screen` to ensure full coverage.

