# RH0 Baseline Failures Report

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Status: RH0 baseline measured, not closed

## Scope

This report records the RH0 baseline for P0 scenarios `S1-S8`.

No theme CSS/JS/runtime correction has been applied in RH0. Runner-only quality
fixes were applied before the official baseline to remove false harness failures:

- `css_var_hash_present` now checks the hashed CSS variable evidence after raw
  input cleanup;
- blocked rows still collect runtime CSS, DOM metrics, screenshots and guards;
- `fixture_gap` is reported as a measured failure, not a hard blocker;
- stress mutations are scoped by scenario to avoid mutating unrelated widgets;
- write RPC guards prove that stress injection remains non-persistent.

Archived reports that are not the RH0 source of truth:

- `report_before_runner_css_hash_fix.json`
- `report_before_harness_quality_fix.json`
- `report_parallel_harness_quality_fix_invalid_resource_errors.json`

The official RH0 source of truth is:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/report.json`

## Runtime Status

| Item | Status |
|---|---|
| Odoo local runtime | reachable |
| Base URL | `http://127.0.0.1:8078` |
| Database | `bao-theme` |
| Runner | `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a.py` |
| Report JSON | written |
| Official run mode | serialized final run |
| Official row count | 64 |
| Runner stderr | empty |
| Theme correction during RH0 | none |
| Write RPC observed | 0 |

## Screen Size Coverage

All required RH0 widths were executed. No width was skipped.

| Width | Rows | Passed | Failed | Blocked | Horizontal overflow failures | Console failures | Write RPC failures |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1920 | 16 | 9 | 5 | 2 | 3 | 3 | 0 |
| 1366 | 16 | 9 | 5 | 2 | 3 | 3 | 0 |
| 1024 | 16 | 9 | 5 | 2 | 3 | 3 | 0 |
| 390 | 16 | 9 | 1 | 6 | 0 | 0 | 0 |

## Baseline Summary

| Metric | Count |
|---|---:|
| Total rows | 64 |
| Passed | 36 |
| Failed | 16 |
| Blocked | 12 |
| Normal profile rows | 32 |
| Normal passed | 26 |
| Normal failed | 0 |
| Normal blocked | 6 |
| Stress profile rows | 32 |
| Stress passed | 10 |
| Stress failed | 16 |
| Stress blocked | 6 |

## Scenario Results

| Scenario | Family focus | Passed | Failed | Blocked | Total |
|---|---|---:|---:|---:|---:|
| `S1` | shell/runtime | 5 | 3 | 0 | 8 |
| `S2` | launcher | 3 | 3 | 2 | 8 |
| `S3` | analytics/settings/runtime | 6 | 0 | 2 | 8 |
| `S4` | control/data/floating | 8 | 0 | 0 | 8 |
| `S5` | control/form/runtime | 5 | 3 | 0 | 8 |
| `S6` | form/floating | 0 | 0 | 8 | 8 |
| `S7` | form/notebook | 4 | 4 | 0 | 8 |
| `S8` | floating/launcher/runtime | 5 | 3 | 0 | 8 |

## Failure Counts

| Failure or blocker | Count | Interpretation |
|---|---:|---|
| `root_no_horizontal_overflow` | 9 | Real shell/launcher/runtime overflow under stress content |
| `no_console_errors` | 9 | Runtime list column width hook error under stress transitions |
| `blocked:edit_button_not_available` | 8 | `S6` cannot exercise readonly/edit transition from selected record |
| `fixture_gap_notebook_tabs` | 4 | Current fixture exposes 2 notebook tabs, not required 8 |
| `stress_has_8_tabs` | 4 | Notebook stress contract cannot pass on current record |
| `blocked:launcher_did_not_open` | 2 | Launcher cannot be opened at 390 in `S2` |
| `blocked:bao_settings_not_found` | 2 | BAO settings route not found at 390 in `S3` |
| `settings_contains_bao` | 2 | Same `S3` blocked rows failed BAO settings content check |

## Exact Horizontal Overflow Failures

All measured horizontal overflow failures happen in `stress` profile.

| Row | Scenario | Width | Root overflow | Body overflow | Failures |
|---|---|---:|---:|---:|---|
| `S1_1024_stress` | `S1` | 1024 | 946 | 946 | `root_no_horizontal_overflow` |
| `S1_1366_stress` | `S1` | 1366 | 1312 | 1312 | `root_no_horizontal_overflow` |
| `S1_1920_stress` | `S1` | 1920 | 758 | 758 | `root_no_horizontal_overflow` |
| `S2_1024_stress` | `S2` | 1024 | 946 | 946 | `root_no_horizontal_overflow` |
| `S2_1366_stress` | `S2` | 1366 | 1312 | 1312 | `root_no_horizontal_overflow` |
| `S2_1920_stress` | `S2` | 1920 | 758 | 758 | `root_no_horizontal_overflow` |
| `S8_1024_stress` | `S8` | 1024 | 946 | 946 | `root_no_horizontal_overflow` |
| `S8_1366_stress` | `S8` | 1366 | 1312 | 1312 | `root_no_horizontal_overflow` |
| `S8_1920_stress` | `S8` | 1920 | 758 | 758 | `root_no_horizontal_overflow` |

## Exact Blocked Rows

| Row | Scenario | Width | Profile | Blocker | Recorded failure |
|---|---|---:|---|---|---|
| `S2_390_normal` | `S2` | 390 | normal | `launcher_did_not_open` | none |
| `S2_390_stress` | `S2` | 390 | stress | `launcher_did_not_open` | none |
| `S3_390_normal` | `S3` | 390 | normal | `bao_settings_not_found` | `settings_contains_bao` |
| `S3_390_stress` | `S3` | 390 | stress | `bao_settings_not_found` | `settings_contains_bao` |
| `S6_390_normal` | `S6` | 390 | normal | `edit_button_not_available` | none |
| `S6_390_stress` | `S6` | 390 | stress | `edit_button_not_available` | none |
| `S6_1024_normal` | `S6` | 1024 | normal | `edit_button_not_available` | none |
| `S6_1024_stress` | `S6` | 1024 | stress | `edit_button_not_available` | `no_console_errors` |
| `S6_1366_normal` | `S6` | 1366 | normal | `edit_button_not_available` | none |
| `S6_1366_stress` | `S6` | 1366 | stress | `edit_button_not_available` | `no_console_errors` |
| `S6_1920_normal` | `S6` | 1920 | normal | `edit_button_not_available` | none |
| `S6_1920_stress` | `S6` | 1920 | stress | `edit_button_not_available` | `no_console_errors` |

## Fixture Gaps

| Row | Width | Profile | Gap | Failures |
|---|---:|---|---|---|
| `S7_390_stress` | 390 | stress | `notebook_tabs=2` | `fixture_gap_notebook_tabs`, `stress_has_8_tabs` |
| `S7_1024_stress` | 1024 | stress | `notebook_tabs=2` | `fixture_gap_notebook_tabs`, `stress_has_8_tabs`, `no_console_errors` |
| `S7_1366_stress` | 1366 | stress | `notebook_tabs=2` | `fixture_gap_notebook_tabs`, `stress_has_8_tabs`, `no_console_errors` |
| `S7_1920_stress` | 1920 | stress | `notebook_tabs=2` | `fixture_gap_notebook_tabs`, `stress_has_8_tabs`, `no_console_errors` |

## Console Failures

All console failures are stress-only. The repeated runtime error is:

`TypeError: Cannot read properties of null (reading 'parentNode')`
at `/web/static/src/views/list/column_width_hook.js:550`.

Affected rows:

| Row | Width | Scenario |
|---|---:|---|
| `S5_1024_stress` | 1024 | `S5` |
| `S5_1366_stress` | 1366 | `S5` |
| `S5_1920_stress` | 1920 | `S5` |
| `S6_1024_stress` | 1024 | `S6` |
| `S6_1366_stress` | 1366 | `S6` |
| `S6_1920_stress` | 1920 | `S6` |
| `S7_1024_stress` | 1024 | `S7` |
| `S7_1366_stress` | 1366 | `S7` |
| `S7_1920_stress` | 1920 | `S7` |

## Dominant Fragility Clusters

1. `form_system`: `S6` is fully blocked because the selected form route exposes no
   editable state; readonly/edit transition cannot be validated.
2. `form_system/notebook`: current production fixture exposes only 2 notebook tabs,
   so the 8-tab stress contract cannot close.
3. `launcher_apps`: launcher opening is blocked at `390`; launcher cards cannot be
   validated at narrow width.
4. `shell_global`: long dynamic nav/company/menu content overflows at
   `1024/1366/1920` under stress.
5. `runtime_transition_residue`: stress transitions trigger the Odoo list column
   width hook console error in `S5`, `S6`, and `S7`.
6. `floating_surfaces/runtime`: `S8` repeats shell overflow under stress after
   open/close state changes.

## Real Priority From Measures

| Priority | Scenario | Family | Score | Reason |
|---:|---|---|---:|---|
| 1 | `S6` | form/floating | 27 | Full scenario blocked across all widths |
| 2 | `S7` | form/notebook | 23 | 8-tab fixture gap plus stress console errors |
| 3 | `S2` | launcher | 18 | 390 launcher blocker plus stress overflow at larger widths |
| 4 | `S1` | shell/runtime | 12 | Topbar/nav overflow under stress at 1024/1366/1920 |
| 5 | `S5` | control/form/runtime | 12 | Stress transition console errors |
| 6 | `S8` | floating/launcher/runtime | 12 | Runtime return repeats shell overflow under stress |
| 7 | `S3` | analytics/settings/runtime | 8 | 390 settings blocker |

`S4` produced no failure in the final harness and is not a measured priority for
RH1, but its components remain unclosed until Q01-Q20 passes after RH hardening.

## Component Closure State

All P0 components remain not closed until Q01-Q20 and the relevant validation rows
pass. A blocked row, fixture gap, or stress failure is not a pass.

| Component | `responsive_safe` | `content_stress_safe` | `identity_preserved` | `closed` |
|---|---:|---:|---:|---:|
| `topbar_shell` | no | no | no | no |
| `nav_entries` | no | no | no | no |
| `app_selector_toggle` | no | no | no | no |
| `launcher_card` | no | no | no | no |
| `control_panel_shell` | no | no | no | no |
| `search_shell` | no | no | no | no |
| `primary_action_button` | no | no | no | no |
| `pager_shell` | no | no | no | no |
| `view_switcher_shell` | no | no | no | no |
| `table_header` | no | no | no | no |
| `table_cell` | no | no | no | no |
| `form_header` | no | no | no | no |
| `smartbuttons` | no | no | no | no |
| `sheet_shell` | no | no | no | no |
| `field_shell` | no | no | no | no |
| `notebook_shell` | no | no | no | no |
| `statusbar` | no | no | no | no |
| `settings_block` | no | no | no | no |
| `preferences_panel` | no | no | no | no |
| `dropdown_shell` | no | no | no | no |
| `dialog_shell` | no | no | no | no |

## RH0 Closure Decision

RH0 artifacts are produced and the P0 baseline is measured across all required
screen widths. RH0 does not close any component or family.

The next Governor action is RH0 review. RH1 must start from the measured priority
order above, with no claim of responsive/content-stress closure until Q01-Q20
passes on the relevant component rows.
