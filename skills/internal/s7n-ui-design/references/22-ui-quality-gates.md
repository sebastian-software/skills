# UI Quality Gates

Use these gates before calling UI implementation complete. They are not design
scores. Scores hide severity and reward improving a number instead of fixing the
right issue. Mark each category as `blocked`, `risky`, or `acceptable`.

## Measurable UI Gate

| Category | Blocked | Risky | Acceptable |
|----------|---------|-------|------------|
| Accessibility | WCAG AA blocker, keyboard trap, missing labels on critical controls, unreadable contrast | Minor ARIA gaps, weak focus styling, unclear alt text | Keyboard, semantics, labels, focus, contrast, target size, and announcements are covered |
| Responsive layout | Horizontal overflow, unusable mobile layout, clipped primary action, text that cannot fit | Awkward spacing, density, or ordering at one breakpoint | Mobile, tablet, desktop, zoom, long text, and touch input work |
| Performance | Implementation choice likely breaks LCP, INP, CLS, or interaction responsiveness | Heavy assets, expensive animation, or unbounded rendering need verification | Critical assets, layout stability, and interaction cost are handled |
| Theming | Hard-coded colors break tokens, dark mode, contrast, or semantic state colors | Some one-off values need token consolidation | Tokens and semantic colors are used consistently |
| State coverage | Missing empty, loading, error, success, disabled, or permission state for the core flow | Secondary states exist but need clearer copy or interaction detail | All states required by the brief are implemented in the real components |

## Interpretation

- Any `blocked`: do not call the UI done.
- Any `risky`: either fix now or explicitly name the follow-up risk.
- All `acceptable`: the implementation can ship from a measurable-quality
  perspective.

## Use With Judgment

This gate covers measurable quality. It does not replace design judgment. A UI
can pass every measurable gate and still have the wrong register, weak
hierarchy, or unclear primary action. Use the Design Readiness Check before
implementation and this gate before completion.
