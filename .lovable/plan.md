

## Investigation Summary

I took screenshots of the Deathmatch Island page and confirmed: **no orange/coral accent color is visible anywhere**. The entire page renders in black, white, and grey.

### Root Cause

The CSS variable overrides in `.dmi-theme` (line 543 of `src/index.css`) set `--primary: 8 85% 58% !important` which should produce a coral/orange color. However, the Tailwind utility classes like `text-primary`, `bg-primary`, `border-primary` resolve to `hsl(var(--primary))` — and the `--primary` variable is being inherited from the parent `div[data-theme]` in `ThemeContext.tsx` (line 26), which wraps the entire app.

The `.dmi-theme, .dmi-theme *` selector with `!important` should theoretically win, but the combination of `@layer base` specificity, CSS custom property inheritance from the parent `[data-theme]` wrapper, and how Tailwind processes these variables is causing the overrides to fail silently.

### Fix Plan

Instead of relying on fragile CSS variable overrides, apply the orange accent color **directly** in the component using inline styles and explicit color values. This is more reliable and keeps the DMI page self-contained.

**Changes to `src/pages/DeathmatchIsland.tsx`:**
- Replace all `text-primary`, `bg-primary`, `border-primary` references with explicit orange/coral color values using Tailwind arbitrary values like `text-[hsl(8,85%,58%)]`, `bg-[hsl(8,85%,58%)]`, `border-[hsl(8,85%,58%)]`
- Alternatively, define a dedicated set of Tailwind color utilities (e.g., `text-dmi-accent`) in `tailwind.config.ts` and use those instead

**Changes to `src/index.css`:**
- Simplify the `.dmi-theme` block to only handle background/foreground overrides and disabling neon effects, since accent colors will be handled directly in the component

**Changes to `tailwind.config.ts`:**
- Add a `dmi` color entry (e.g., `dmi: { accent: "hsl(8 85% 58%)", ... }`) so we can use `text-dmi-accent`, `bg-dmi-accent`, `border-dmi-accent` throughout the component

This approach is bulletproof — it doesn't depend on CSS variable cascading or specificity battles with theme selectors.

