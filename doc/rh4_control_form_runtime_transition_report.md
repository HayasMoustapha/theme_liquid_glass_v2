# RH4 Control Form Runtime Transition Report

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: `RH4 = Control/Form Runtime Transition Errors`
Scenario: `S5`
Status: S5 gate passed, direct runtime residue probe passed, prior RH gates still passed

## Scope

RH4 covers runtime stability during list -> form -> list transitions:

- route transition from purchase list into a record form;
- browser back from form to list;
- refresh return on the list route;
- resize after route return;
- BAO control-panel transition classes and helper node cleanup;
- prevention of duplicated runtime observers/listeners from repeated navbar setup.

RH4 does not harden broad form layout, notebook layout, modal/dialog layout, or table
content resilience. Those remain in later slices.

## Baseline

Fresh S5 baseline after RH3:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh4_s5_baseline_after_rh3_20260516_a/report.json`

Result: `7/8 passed`, `1 failed`, `0 blocked`.

Observed failure:

- row: `S5_1024_normal`;
- failure: `no_console_errors`;
- cause: `ERR_NO_BUFFER_SPACE` while loading
  `/partner_autocomplete/static/lib/jsvat.js`;
- classification: local runtime resource pressure during parallel browser work, not a BAO
  theme layout/runtime defect.

Historical RH0 also recorded intermittent:

`TypeError: Cannot read properties of null (reading 'parentNode')`
from `/web/static/src/views/list/column_width_hook.js:550`.

Governor classification: `column_width_hook.js` remains a distinct runtime chantier.
RH4 watches for it and proves whether it is present, but does not hide it with CSS.

## Implementation

Changed file:

- `static/src/js/navbar_sidebar.js`

Root correction:

- make `initControlPanelBao()` idempotent so repeated `NavBar.setup()` calls do not
  stack duplicate `resize`, `scroll`, `pointerdown`, `keydown`, `click`, or
  `MutationObserver` handlers;
- add `clearControlPanelTransitionResidue()` to clear pending timers and BAO
  transition classes during `pagehide`;
- preserve existing control-panel normalization behavior and launcher behavior.

The change is runtime-only and does not change CSS layout budgets, form structure,
list columns, modal behavior, or Odoo core assets.

## Popover Finding

The first direct RH4 runtime probe found one visible `.o_popover` after `back` in
`S5_1024_stress`.

Focused probe:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh4_s5_popover_origin_probe_20260516_a/report.json`

Finding:

- popover text: `Mitchell Admin`;
- type: native hover tooltip on the current list row;
- behavior: disappears after moving the pointer away;
- classification: current-screen hover tooltip, not previous-screen route residue.

The final direct residue probe neutralizes pointer hover before measuring open-layer
residue.

## Final Proof

Canonical S5 matrix after runtime cleanup:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh4_s5_after_runtime_cleanup_20260516_a/report.json`

Result: `8/8 passed`, `0 failed`, `0 blocked`.

Direct runtime residue probe:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh4_s5_runtime_residue_probe_20260516_b/report.json`

Result: `8/8 passed`, `0 failed`.

The direct probe validates:

- list initial state;
- form after record click;
- list after browser back;
- list after refresh;
- resize chain after route return;
- normal and stress profiles;
- widths `1920`, `1366`, `1024`, `390`.

Measured forbidden symptoms:

- root/body horizontal overflow: none;
- stale BAO transition classes: none;
- open-layer residue after pointer-neutral measurement: none;
- duplicated generated breadcrumb trail: none;
- console/page/network/write errors: none;

Anti-regression after RH4:

- `rh4_s1_regression_20260516_a`: `8/8 passed`
- `rh4_s2_regression_20260516_a`: `8/8 passed`
- `rh4_s8_regression_20260516_a`: `8/8 passed`

## Component Checklist

Checklist key: Q01-Q08 responsive safety, Q09-Q16 content stress safety,
Q17-Q20 identity preservation.

| Component | responsive_safe | content_stress_safe | identity_preserved | closed | Checklist result | Problems observed | Trigger | Severity | Root fix/status |
|---|---|---|---|---|---|---|---|---|---|
| `route_swap_flash_guard` | yes | yes | yes | yes | Q01-Q20 passed for S5 route transition | Historical risk of stale BAO transition classes/list column console errors | list -> form -> list, stress, refresh, resize | P0 | Runtime init is idempotent; transition cleanup added on `pagehide`; S5 final proof clean |
| `refresh_return_guard` for S5 | yes | yes | yes | yes | Q01-Q20 passed for list refresh return | None after RH4 | refresh after returning to list | P1 | Direct probe shows no stale class/open layer/overflow |
| `control_panel_shell` transition state | yes | yes | yes | yes for runtime transition only | Q01-Q20 passed for S5 runtime state, not broad S4 content hardening | No stale `o_bao_*` transition classes after fix | route/back/refresh/resize | P0 | Observer/listener duplication guarded; cleanup added |
| `breadcrumb_shell` transition state | yes | yes | yes | yes for runtime transition only | Q01-Q20 passed for generated trail duplication guard | No duplicated generated breadcrumb trail in final probe | list -> form -> back under stress | P1 | Existing generated trail remains bounded |
| `form_header` | no | no | no | no | S5 opens form but does not fully harden form header content | Later RH5/S6 required | long titles/actions/statusbar | P0/P1 | Keep open for form-system slice |
| `sheet_shell` | no | no | no | no | S5 opens form but does not fully harden sheet layout | Later RH5/S6 required | dense fields/readonly-edit | P0/P1 | Keep open for form-system slice |
| `table_shell` / `table_cell` | no | no | no | no | S5 navigates from list but does not close data-display hardening | Later data-display slice required | long cells/columns | P0/P1 | Keep open for data-display slice |
| `column_width_hook.js` runtime chantier | no | no | no | no | Not closed in RH4 | Historical intermittent Odoo list ResizeObserver error | list column observer during route teardown | P0 runtime | Kept distinct; not solved by CSS; not reproduced in final S5 proofs |

## Closure Decision

Closed in RH4:

- `route_swap_flash_guard` for `S5`;
- S5 `refresh_return_guard`;
- `control_panel_shell` runtime transition residue;
- `breadcrumb_shell` generated-trail duplication guard.

Not closed in RH4:

- full `form_header`;
- full `sheet_shell`;
- full `table_shell` / `table_cell`;
- `column_width_hook.js` as a standalone runtime chantier.

RH4 is therefore closed only for the runtime transition contract it was authorized
to address.
