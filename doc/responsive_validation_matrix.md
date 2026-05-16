# RH0 Responsive Validation Matrix

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: canonical matrix for RH0 baseline and later hardening gates

## Canonical Axes

Widths:

| ID | Width | Height | Meaning |
|---|---:|---:|---|
| `desktop_large` | 1920 | 1080 | Large desktop reference |
| `desktop_reduced` | 1366 | 900 | Reduced desktop |
| `tablet` | 1024 | 900 | Tablet or constrained workspace |
| `narrow` | 390 | 844 | Narrow viewport |

Profiles:

| ID | Meaning |
|---|---|
| `normal` | Current route content |
| `stress` | Official stress values from `stress_content_profiles.md` |

Zoom:

| Gate | Zoom | Scope |
|---|---:|---|
| P0 | 100% | all `S1-S8`, all widths, normal and stress |
| P1 | 125% | `S1`, `S4`, `S6`, `S7`, `S8` at 1366, 1024, 390 |
| P2 | 150% | `S4`, `S6`, `S7`, `S8` at 1024 and 390 |

## P0 Baseline Matrix

The full P0 matrix is:

```text
4 widths x 2 profiles x 8 scenarios = 64 rows at 100% zoom
```

No blocked row counts as passed. If the runtime or route is unavailable, the row is
`blocked`, and RH0 must report the blocker explicitly.

## Scenario Matrix

| ID | Name | Families | Components | Required actions | Forbidden symptoms | Required evidence |
|---|---|---|---|---|---|---|
| `S1` | Shell/navbar load | `shell_global`, `runtime_transition_residue` | topbar, nav, systray, profile | load backend, resize, refresh | root overflow, overlap, Odoo/Liquid flash | viewport PNG, DOM widths, CSS var hash, console/network |
| `S2` | Launcher open/close | `launcher_apps`, `shell_global` | app selector toggle, launcher, app cards, mobile app sidebar | open desktop launcher or native mobile sidebar, close, reopen, browser back where possible | residue, wrong desktop `aria-expanded`, launcher behind content, overflow X | open/closed PNG, ARIA state where native, panel geometry |
| `S3` | BAO Settings runtime | `analytics_dashboard_settings`, `runtime_transition_residue` | settings block, runtime CSS | open settings, preview, save/reset readiness, refresh | runtime CSS error, token mismatch, settings overflow | PNG, computed tokens, runtime CSS network |
| `S4` | List/control panel dropdowns | `control_navigation`, `data_display`, `floating_surfaces` | search, facets, pager, switcher, dropdowns, table header/cell | open filters/group/favorites, apply if safe, close | clipped menu, z-index failure, header overlap, table root overflow | open/closed PNG, menu position, overflow scan |
| `S5` | List to form to list | `control_navigation`, `form_system`, `runtime_transition_residue` | form header, sheet shell, table shell | open record from list, return list, browser back | flash, stale inline styles, BAO token loss, route residue | before/after PNG sequence, DOM class diff |
| `S6` | Form readonly/edit | `form_system`, `floating_surfaces` | field shell, smartbuttons, statusbar | readonly -> edit -> cancel/save -> readonly | field jump, action overlap, edit mode unreadable | PNG per state, state classes, element bounds |
| `S7` | Notebook stress | `form_system` | notebook shell, tabs, panels | switch tab, long tab, rightmost tab, refresh | inaccessible tab, broken wrap, active state lost | PNG, active tab visible, tab overflow scan |
| `S8` | Floating surfaces and return | `floating_surfaces`, `launcher_apps`, `runtime_transition_residue` | dropdown, dialog, launcher | open dropdown, dialog, launcher, refresh/back, close | overlay leak, click-through, focus loss, panel off viewport | open/closed PNG, focus target, overlay stack JSON |

## Row Status Values

| Status | Meaning |
|---|---|
| `passed` | All checks for the row passed |
| `failed` | Runtime ran and one or more checks failed |
| `blocked` | Runtime, route, login, or required element unavailable |
| `fixture_gap` | Route loaded but did not expose enough elements for the official fixture |
| `not_run` | Row intentionally not executed in a reduced baseline sample |

## Required Checks Per Row

Common checks:

- `runtime_css_status_200`
- `no_console_errors`
- `no_page_errors`
- `no_network_404_500_css_js`
- `root_no_horizontal_overflow`
- `surface_no_horizontal_overflow`
- `no_visible_overlap_for_measured_cluster`
- `css_var_hash_present`
- `screenshot_written`
- `json_written`

Scenario-specific checks:

- `S1`: topbar present, topbar clusters do not overlap.
- `S2`: launcher opens, `aria-expanded=true` while open, closes cleanly.
- `S3`: BAO Settings block loads, computed tokens visible or runtime CSS available.
- `S4`: dropdown opens, menu bounds remain inside viewport or own scroll.
- `S5`: list opens a form, then returns without stale transition classes.
- `S6`: edit mode creates save/cancel state, cancel/save returns to readonly.
- `S7`: notebook exists, active tab remains visible, stress row has eight-tab fixture or reports `fixture_gap`.
- `S8`: at least one dropdown or dialog opens, overlay stack remains inside viewport.

## Gate Interpretation

- P0 is release-blocking for this hardening chantier.
- P1 blocks broader rollout.
- P2 blocks final hardening closure.
- A scenario can be useful as baseline evidence even if it fails. It cannot close a
  component until all relevant rows pass.
