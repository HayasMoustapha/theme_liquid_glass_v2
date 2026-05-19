# RH1 Shell Global Resilience Report

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: `RH1 = Shell Global Resilience`
Scenario: `S1`
Status: S1 gate passed, no RH2/RH3 work included

## Scope

RH1 only hardens the global shell/topbar surface:

- `topbar_shell`
- `brand_zone`
- `nav_entries`
- `systray_shell`
- `profile_button`
- `topbar_dropdown_shell`

`global_search_shell` is not closed in RH1 because the S1 route did not expose a
visible global search DOM surface in the Odoo 19 topbar. It remains open until a
route/state with a real global-search shell is available.

No launcher hardening was performed. No control-panel, form, table, notebook, or
runtime-transition correction was performed.

## Baseline Failure

Pre-fix proof:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh1_s1_baseline_probe_20260516_a/report.json`

| Row | Status | Root/body overflow | Cause |
|---|---|---:|---|
| `S1_1920_stress` | failed | `758px` | long brand/nav/company content |
| `S1_1366_stress` | failed | `1312px` | long brand/nav/company content |
| `S1_1024_stress` | failed | `946px` | brand + systray pressure, nav sections squeezed |

Measured root cause:

- `.o_menu_sections` had `scrollWidth` up to `2045px` while its available width
  shrank to `756px`, `202px`, or `0px`.
- `.o_menu_brand` reached about `547px` with stress content.
- `.o_menu_systray` consumed about `509px` with long company/user context.
- Odoo's native "more" menu could not protect the layout because each visible
  section item still kept its own unbounded `nowrap` width.

## Implementation

Changed file:

`static/src/scss/navbar.scss`

Root correction:

- constrain `.o_main_navbar` to the viewport-width shell with `min-width: 0`;
- keep app selector fixed-size;
- give `.o_menu_brand` a responsive flex budget and ellipsis;
- make `.o_menu_sections` a true shrinkable flex track;
- cap visible nav entries with responsive max widths and ellipsis on text spans;
- preserve `.o_menu_sections_more` as an untruncated native affordance;
- give desktop/tablet systray a bounded budget without touching small-screen
  native behavior;
- keep topbar dropdown surfaces un-clipped by avoiding blanket navbar overflow.

The correction is CSS-only and does not change Odoo menu routing, launcher state,
or runtime JavaScript.

## Final Proof

Final S1 matrix:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh1_s1_after_badge_stress_20260516_b/report.json`

Stress profile includes:

- long module/brand labels;
- long nav labels;
- long company/user values;
- systray badge values set to `987654`.

| Width | Normal | Stress | Root/body overflow | Console errors |
|---:|---|---|---:|---:|
| `1920` | passed | passed | `0px` | 0 |
| `1366` | passed | passed | `0px` | 0 |
| `1024` | passed | passed | `0px` | 0 |
| `390` | passed | passed | `0px` | 0 |

Summary: `8 passed / 0 failed / 0 blocked`.

Dropdown proof:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh1_shell_dropdown_probe_20260516_b/report.json`

| Width | Nav dropdown | Company dropdown | User dropdown | Root/body overflow |
|---:|---|---|---|---:|
| `1920` | opened | opened | opened | `0px` |
| `1366` | opened | opened | opened | `0px` |
| `1024` | opened | opened | opened | `0px` |
| `390` | not visible by native small-screen layout | not visible | not visible | `0px` |

## Component Checklist Q01-Q20

Legend:

- `yes`: proven by final S1 matrix and/or dropdown proof.
- `n/a`: component is not rendered in that S1 state.
- `open`: not closed by RH1.

Questions:

`Q01` desktop normal, `Q02` desktop reduced, `Q03` tablet, `Q04` no overlap,
`Q05` no unwanted horizontal overflow, `Q06` hierarchy under reduced space,
`Q07` readable under reduced width, `Q08` BAO density under constraint,
`Q09` long text, `Q10` very long text, `Q11` long numeric value, `Q12` long label,
`Q13` long badge/state, `Q14` long button/action, `Q15` unpredictable Odoo content,
`Q16` readable under content stress, `Q17` remains BAO, `Q18` no Odoo fallback,
`Q19` no Liquid residue, `Q20` coherent with neighbors.

| Component | Q01 | Q02 | Q03 | Q04 | Q05 | Q06 | Q07 | Q08 | Q09 | Q10 | Q11 | Q12 | Q13 | Q14 | Q15 | Q16 | Q17 | Q18 | Q19 | Q20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `topbar_shell` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | yes | yes | yes | yes | yes |
| `brand_zone` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | n/a | yes | yes | yes | yes | yes | yes |
| `nav_entries` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | n/a | yes | yes | yes | yes | yes | yes |
| `systray_shell` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | yes | yes | yes | yes | yes |
| `profile_button` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | n/a | yes | yes | yes | yes | yes | yes |
| `topbar_dropdown_shell` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| `global_search_shell` | open | open | open | open | open | open | open | open | open | open | open | open | open | open | open | open | open | open | open | open |

## Closure Decisions

| Component | `responsive_safe` | `content_stress_safe` | `identity_preserved` | `closed` | Problems observed | Trigger | Severity | Root correction |
|---|---|---|---|---|---|---|---|---|
| `topbar_shell` | yes | yes | yes | yes | root/body overflow under stress | `S1` stress at `1920/1366/1024` | P0 | viewport-bounded flex shell with shrinkable tracks |
| `brand_zone` | yes | yes | yes | yes | long brand consumed `~547px` and squeezed nav | long app/module label | P0 | responsive brand budget plus ellipsis |
| `nav_entries` | yes | yes | yes | yes | visible nav items kept unbounded `nowrap` widths | translated/long menu labels | P0 | max-width budgets and text ellipsis on entries |
| `systray_shell` | yes | yes | yes | yes | company/user/badges added right-cluster pressure | long company and `987654` badges | P1 | desktop/tablet systray budget and company clamp |
| `profile_button` | yes | yes | yes | yes | risk of long user text pressure | long user context | P1 | avatar-only profile retained; no text re-enabled |
| `topbar_dropdown_shell` | yes | yes | yes | yes | potential clipping risk after flex fix | nav/company/user dropdown open | P0 | no blanket navbar clipping; dropdowns proven open |
| `global_search_shell` | no | no | no | no | no S1 topbar search DOM to audit | unavailable route/state | P2 | remains for later route with real surface |

## Anti-Regression Rules For RH2+

- Do not reintroduce unbounded topbar labels when working on launcher.
- Do not add `overflow: hidden` to `.o_main_navbar` as a broad fix; dropdowns
  must stay visible.
- Keep `.o_user_menu .oe_topbar_name` hidden in the topbar unless a new RH gate
  proves a safe text budget.
- If RH2 changes `.o_navbar_apps_menu` or `.o_enterprise_launcher_toggle`, rerun
  `S1` and the dropdown proof before closing RH2.
- `column_width_hook.js` remains out of RH1 scope.
