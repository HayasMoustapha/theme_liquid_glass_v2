# RH5 S6 Readonly Edit Transition Report

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: `S6 = readonly -> edit -> cancel/save/restore` on RH0.1 fixture
Status: S6 gate passed, controlled edit/cancel/save proof passed, prior RH gates passed

## Scope

S6 validates the representative form fixture created in RH0.1:

- route: `theme_liquid_glass_v2.action_bao_theme_rh01_fixture`;
- model: `bao.theme.config`;
- record: `theme_liquid_glass_v2.bao_theme_config_default`;
- target field for controlled edit: `color_primary`;
- view state: form route with scalar fields, boolean field, many2one field, and 8 notebook tabs.

This slice validates readonly/edit transition behavior and save/cancel controls. It
does not close the whole `form_system`, all Odoo field widgets, the full form
header, x2many, chatter, smartbuttons, or notebook resilience. S7 remains the
dedicated notebook tab slice.

## Baseline

Canonical S6 matrix after RH4:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh5_s6_baseline_after_rh4_20260516_a/report.json`

Result: `8/8 passed`, `0 failed`, `0 blocked`.

This proves the fixture is reachable and can enter dirty/edit state with visible
save/cancel controls under all Governor widths and profiles.

## Direct Browser Proof

Controlled edit/cancel/save probe:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh5_s6_edit_cancel_save_probe_20260516_b/report.json`

Result: `8/8 passed`, `0 failed`.

Coverage:

- widths: `1920`, `1366`, `1024`, `390`;
- profiles: `normal`, `stress`;
- cancel path on all rows;
- controlled save + restore on `1366 normal` and `390 stress`;
- stress profile mutates labels/titles/buttons without mutating the target
  `color_primary` input;
- focus/pointer neutralization before residue measurement.

Validation rules:

- dirtying `color_primary` exposes `.o_form_button_save` and
  `.o_form_button_cancel`;
- cancel restores the original field value;
- cancel sends no `web_save`;
- controlled save sends expected `web_save`;
- restore sends expected `web_save` and returns the field to its original value;
- root/body horizontal overflow remains `0`;
- stale BAO transition classes remain `0`;
- final open-layer residue remains `0`;
- console/page/network errors remain `0`.

Final canonical S6 matrix after save/restore:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh5_s6_final_after_save_restore_20260516_a/report.json`

Result: `8/8 passed`, `0 failed`, `0 blocked`.

## Anti-Regression

After the controlled save/restore proof, prior RH gates were rerun:

- `rh5_s1_regression_20260516_a`: `8/8 passed`
- `rh5_s2_regression_20260516_a`: `8/8 passed`
- `rh5_s5_regression_20260516_a`: `8/8 passed`
- `rh5_s8_regression_20260516_a`: `8/8 passed`

No CSS, JS, XML, Python, or runner changes were required for S6.

## Component Checklist

Checklist key: Q01-Q08 responsive safety, Q09-Q16 content stress safety,
Q17-Q20 identity preservation.

| Component | responsive_safe | content_stress_safe | identity_preserved | closed | Checklist result | Problems observed | Trigger | Severity | Root fix/status |
|---|---|---|---|---|---|---|---|---|---|
| `readonly_edit_transition_guard` | yes | yes | yes | yes | Q01-Q20 passed for S6 fixture | None in final proof | dirty field -> cancel/save/restore | P0 | No code fix required; browser proof closes guard |
| `readonly_shell` | yes | yes | yes | yes for S6 fixture | Q01-Q20 passed for representative fixture state | None in final proof | initial form state, all widths/profiles | P1 | No code fix required |
| `edit_shell` | yes | yes | yes | yes for S6 fixture | Q01-Q20 passed for dirty/edit state and save/cancel controls | None in final proof | dirty scalar field under normal/stress | P1 | No code fix required |
| `field_shell` | no | no | no | no | S6 proves one scalar target field plus fixture visibility, not all Odoo field widgets | Full field taxonomy not audited | many2many/x2many/date/money/rich widgets outside fixture target | P0/P1 | Keep open for broader form-system/data slices |
| `form_header` | no | no | no | no | Not fully audited in S6 | Header title/actions/statusbar not stress-closed here | long document titles/actions/statusbar | P0/P1 | Keep open for form-system hardening |
| `sheet_shell` | no | no | no | no | Fixture sheet is visible and stable, but full sheet density/content hardening is not closed | Nested groups and dense enterprise forms not exhausted | large forms/readonly-edit layout shifts | P0/P1 | Keep open for form-system hardening |
| `notebook_shell` | no | no | no | no | Fixture contains 8 tabs, but tab resilience belongs to S7 | Long tabs/switching not closed in S6 | 8 tabs, long labels, narrow width | P0 | Keep open for S7 |
| `smartbuttons` | no | no | no | no | Save/cancel proof does not close smartbutton resilience | Smartbutton count/value stress not covered here | 6-digit counts, long labels | P0/P1 | Keep open for dedicated form-system/data proof |

## Closure Decision

Closed in S6:

- `readonly_edit_transition_guard`;
- S6 fixture-level `readonly_shell`;
- S6 fixture-level `edit_shell`.

Not closed in S6:

- full `form_system`;
- full `field_shell`;
- `form_header`;
- `sheet_shell`;
- `notebook_shell`;
- `smartbuttons`;
- `x2many_shell`;
- `chatter_shell`;
- `totals_footer`.

S6 is therefore closed only for the controlled readonly/edit/cancel/save transition
contract it actually proved.
