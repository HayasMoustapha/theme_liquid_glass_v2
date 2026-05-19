# RH3 Floating Launcher Runtime Return Report

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: `RH3 = Floating/Launcher Runtime Return`
Scenario: `S8`
Status: S8 gate passed, large-screen recontrol passed, dynamic residue recontrol passed

## Scope

RH3 only covers runtime return behavior for floating surfaces and launcher paths:

- dropdown open/close
- desktop launcher open/close
- native mobile sidebar open/close path used by Odoo at narrow width
- refresh return guard
- responsive resize while a floating/launcher surface is open

No control-panel, list, form, notebook, dialog implementation, modal implementation, or
`column_width_hook.js` correction is included in RH3.

## Baseline Finding

The canonical S8 matrix after RH2 was green, but direct browser probing exposed a real
content-stress defect at `390px`: a stressed dropdown item overflowed inside the
floating menu. The failing text was representative of a long Odoo dynamic filter
label.

The probe also showed that native mobile sidebar behavior does not close on `Escape`;
it closes through the backdrop/outside-click path. That is Odoo mobile behavior, so
RH3 validates the real close path instead of forcing a desktop keyboard contract onto
the mobile sidebar.

## Implementation

Changed files:

- `static/src/scss/glass_theme.scss`
- `static/src/scss/navbar.scss`
- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a.py`

Root corrections:

- constrain dropdown/popover/autocomplete surfaces to the viewport with
  `max-width: calc(100vw - 8px)`;
- prevent internal horizontal escape with `overflow-x: hidden`;
- allow stressed dropdown item labels to wrap with `min-width: 0`,
  `overflow-wrap: anywhere`, and `white-space: normal`;
- apply the same content-stress rule to topbar dropdown items;
- update S8 launcher probing to use both desktop `.o_enterprise_launcher_toggle`
  and mobile `.o_menu_toggle`;
- close native mobile sidebar through the real `.o_sidebar_close` or backdrop path
  after `Escape` when needed.

The correction is scoped to floating content stress and S8 proof coverage. It does
not change launcher desktop dimensions, topbar budgets, form/list layout, or modal
stacking rules.

## Proofs

Canonical S8 matrix after fix:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh3_s8_after_dropdown_fix_20260516_b/report.json`

Result: `8/8 passed`, `0 failed`, `0 blocked`.

Direct browser runtime probe:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh3_runtime_browser_probe_20260516_b/report.json`

Result: `8/8 passed`, `0 failed`. Open-state checks include dropdown, launcher,
closed state, refresh return, overflow, layer residue, console/page/network errors,
and write-request guard.

Anti-regression:

- `rh3_s1_regression_20260516_a`: `8/8 passed`
- `rh3_s2_regression_20260516_a`: `8/8 passed`

Large-screen recontrol:

- `rh_recontrol_large_20260516_c`: `12/12 passed` for `S1/S2/S8` at `1920`
  and `1366`, normal and stress.
- `rh_recontrol_large_openmetrics_20260516_d`: `4/4 passed`, with open-state
  geometry for topbar dropdowns, launcher, and S8 dropdowns.

Dynamic residue recontrol:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh_dynamic_residue_recontrol_20260516_a/report.json`

Result: `2/2 passed`, normal and stress. The probe tested:

- desktop launcher open while resizing `1920 -> 1366 -> 1024 -> 390 -> 1920`;
- dropdown open while resizing `1920 -> 1366 -> 1024 -> 390 -> 1920`;
- mobile sidebar open while resizing `390 -> 1024 -> 1366 -> 1920 -> 390`.

Forbidden symptoms observed: none. Root/body horizontal overflow: `0`. Topbar
overlaps: `0`. Stale transition classes: `0`. Final open-layer residue: `0`.

## Component Checklist

Checklist key: Q01-Q08 responsive safety, Q09-Q16 content stress safety,
Q17-Q20 identity preservation.

| Component | responsive_safe | content_stress_safe | identity_preserved | closed | Checklist result | Problems observed | Trigger | Severity | Root fix/status |
|---|---|---|---|---|---|---|---|---|---|
| `dropdown_shell` | yes | yes | yes | yes | Q01-Q20 passed by S8 + direct probe + large openmetrics | Pre-fix internal item overflow at `390px` | Very long Odoo dropdown item/filter label | P0 | Root wrapping/max-width rule applied to dropdown surfaces/items |
| `topbar_dropdown_shell` | yes | yes | yes | yes | Q01-Q20 passed by RH1 dropdown proof + large openmetrics | Same class of long item risk as dropdown shell | Long company/user/dropdown label | P0 | Same topbar dropdown item wrapping rule applied |
| `launcher_open_close_transition` | yes | yes | yes | yes | Q01-Q20 passed by S2/S8 + dynamic residue probe | Mobile `Escape` alone leaves native sidebar open | Native mobile sidebar/backdrop behavior | P1 proof-path issue | Runner validates real sidebar close path through close button/backdrop |
| `dropdown_open_close_transition` | yes | yes | yes | yes | Q01-Q20 passed by S8 + dynamic residue probe | None after fix | Open dropdown, stress text, resize, close | P0 | Open/close and resize return are clean |
| `refresh_return_guard` | yes | yes | yes | yes | Q01-Q20 passed by direct runtime probe | None after fix | Launcher/dropdown interaction then refresh | P1 | No open-layer residue after refresh |
| `popover_shell` | no | no | no | no | Not fully audited as a distinct popover fixture | No dedicated popover fixture opened in RH3 | Missing representative popover route/state | P1 | Keep open for RH7/floating-surfaces modal-popover proof |
| `dialog_shell` | no | no | no | no | Not audited in RH3 | No dedicated dialog fixture opened in RH3 | Missing no-write dialog path | P1 | Keep open for RH7 |
| `modal_shell` | no | no | no | no | Not audited in RH3 | No dedicated modal fixture opened in RH3 | Missing no-write modal path | P1 | Keep open for RH7 |

## Closure Decision

Closed in RH3:

- `dropdown_shell`
- `topbar_dropdown_shell`
- `launcher_open_close_transition`
- `dropdown_open_close_transition`
- `refresh_return_guard`

Not closed in RH3:

- `popover_shell`
- `dialog_shell`
- `modal_shell`

Those require dedicated RH7 proof with real opened fixtures. They are not hidden
inside the RH3 S8 pass.
