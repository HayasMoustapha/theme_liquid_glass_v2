# RH0 Responsive Hardening Plan

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Governor session: `bao-backend-liquid-v2`
Scope: RH0 only, no visual/runtime correction

## Decision

The global Responsive And Dynamic Content Hardening architecture is validated.
Execution is authorized for RH0 only.

RH0 exists to make later hardening measurable before any RH1-RH3 correction starts.
It must freeze the stress fixtures, define the scenario runner, run a baseline when
runtime is available, and report measured failures without changing the theme.

## Non Goals

- No SCSS correction.
- No JS layout correction.
- No Python model correction.
- No XML view correction, except documentation or proof-only artifacts.
- No RH1, RH2, RH3, RH5, RH7, RH8 or RH9 implementation.
- No component closure claim.

## RH0 Deliverables

| Artifact | Role |
|---|---|
| `doc/responsive_hardening_plan.md` | RH0 execution frame and governance |
| `doc/stress_content_profiles.md` | Frozen normal and stress content fixtures |
| `doc/responsive_validation_matrix.md` | Canonical scenario/width/profile/zoom matrix |
| `doc/scenario_runner_spec.md` | Runner contract, JSON schema, selectors, gates |
| `doc/baseline_failures_report.md` | Baseline status, measured failures, priority from evidence |

Proof-only executable support:

- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a.py`
- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/`

## Component Gate

Every audited component must be evaluated through:

- `responsive_safe`
- `content_stress_safe`
- `identity_preserved`
- `closed`

No row can be marked `closed=yes` until Q01-Q20 pass with evidence. Existing
screenshots from earlier stages are useful baselines, but they are not enough for
closure because they do not cover the full responsive/content-stress matrix.

## P0 Scope For RH0

RH0 targets baseline evidence for the P0 scenario families:

| Scenario | Main P0 components |
|---|---|
| `S1` | `topbar_shell`, `nav_entries`, runtime boot guard |
| `S2` | `app_selector_toggle`, `launcher_card` |
| `S3` | `settings_block`, runtime CSS stability |
| `S4` | `control_panel_shell`, `search_shell`, `pager_shell`, `view_switcher_shell`, `dropdown_shell`, `table_header`, `table_cell` |
| `S5` | `route_swap_flash_guard`, `form_header`, `sheet_shell` |
| `S6` | `field_shell`, `smartbuttons`, `statusbar`, `readonly_edit_transition_guard` |
| `S7` | `notebook_shell` |
| `S8` | `dropdown_shell`, `dialog_shell`, `launcher_open_close_transition` |

## RH0 Execution Order

1. Freeze official content profiles.
2. Freeze the validation matrix and runner schema.
3. Create proof-only runner.
4. Start or detect local Odoo runtime.
5. Run baseline scenarios with no theme correction.
6. Write `baseline_failures_report.md`.
7. Stop and request Governor review before RH1.

## Acceptance Criteria

RH0 is complete when:

- all five requested artifacts exist;
- official stress fixture values are frozen;
- the runner spec explains how to execute all matrix rows;
- baseline status is recorded for all 64 P0 rows:
  `S1-S8` x `normal/stress` x `1920/1366/1024/390`;
- measured failures are separated from blocked/unmeasured rows;
- the real priority order is derived from measured failures;
- no runtime styling/behavior code is changed.

## Revalidation Gates

Governor review is mandatory after:

- RH0
- RH1
- RH2
- RH3
- RH5
- RH7
- RH8
- RH9

## RH0 Stop Conditions

Stop RH0 and report a blocker if:

- Odoo runtime cannot be started or reached;
- login credentials fail;
- no backend shell can be loaded;
- the runner cannot capture screenshots/JSON;
- a requested baseline row cannot be measured because the target Odoo route or
  dataset does not exist.

Blocked rows must be explicit in the baseline report. They do not count as passed.
