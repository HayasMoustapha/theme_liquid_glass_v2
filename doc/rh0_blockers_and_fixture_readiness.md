# RH0.1 Blockers And Fixture Readiness

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Status: RH0.1 readiness complete, no theme hardening applied

## Purpose

RH0.1 clarifies RH0 blockers that were caused by missing or weak fixtures rather
than by a measured BAO theme defect. It does not close any component and does not
authorize RH1-RH3 fixes.

RH0 remains the official baseline. RH0.1 only makes later campaigns honest by
making `S3`, `S6`, and `S7` testable under the Governor viewport/profile matrix.

## Non-Goals

- No SCSS hardening.
- No theme JavaScript hardening.
- No BAO visual correction.
- No component closure.
- No broad route redesign.
- No write RPC in the readiness proof run.

The `column_width_hook.js` console error remains a separate runtime chantier. It
must not be hidden inside CSS fixes.

## Proof Source

Runner:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a.py`

Readiness report:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh0_1_fixture_readiness_20260516_b/report.json`

Executed matrix:

| Axis | Values |
|---|---|
| Scenarios | `S3`, `S6`, `S7` |
| Widths | `1920`, `1366`, `1024`, `390` |
| Profiles | `normal`, `stress` |
| Zoom | `1.0` |

Result:

| Scenario | Passed | Failed | Blocked | Total |
|---|---:|---:|---:|---:|
| `S3` | 8 | 0 | 0 | 8 |
| `S6` | 8 | 0 | 0 | 8 |
| `S7` | 8 | 0 | 0 | 8 |
| Total | 24 | 0 | 0 | 24 |

Guards:

| Guard | Observed |
|---|---:|
| Write RPC requests | 0 |
| Console errors | 0 |
| CSS/JS network errors | 0 |

## S3 Clarification At 390

RH0 blocker: `bao_settings_not_found`.

Classification: route/probe/navigation issue, not a confirmed real UI defect.

Cause:

- The BAO settings action opens the Odoo settings shell.
- At narrow width the BAO settings block is not guaranteed to be the initially
  active settings panel.
- The RH0 probe expected BAO content immediately and did not activate
  `data-key='bao_backend_theme'`.

RH0.1 runner behavior:

- Opens `action_bao_theme_settings`.
- Clicks `a.tab[data-key='bao_backend_theme']` when available.
- Falls back to `/odoo/settings?debug=assets#bao_backend_theme`.
- Validates `.app_settings_block[data-key='bao_backend_theme'] .o_setting_box`
  or equivalent BAO settings content.

Outcome:

`S3` is now testable at `390` in both `normal` and `stress` profiles. The previous
blocker is not carried as a real UI failure for RH1.

## S6 Fixture Readiness

RH0 blocker: `edit_button_not_available` on the purchase form route.

Classification: fixture/proof-route issue, not a stable theme defect.

Fixture route:

`/odoo/action-theme_liquid_glass_v2.action_bao_theme_rh01_fixture?db=bao-theme&debug=assets`

Fixture contract:

| Item | Value |
|---|---|
| Action | `theme_liquid_glass_v2.action_bao_theme_rh01_fixture` |
| View | `theme_liquid_glass_v2.bao_theme_rh01_fixture_view_form` |
| Model | `bao.theme.config` |
| Record | `theme_liquid_glass_v2.bao_theme_config_default` |
| Stable edit field | `color_primary` |

Odoo 19 note:

The old explicit `Edit` button is not a reliable invariant for this runtime.
The form exposes hidden save/cancel controls that become visible when a scalar
field becomes dirty. RH0.1 therefore proves readiness by:

1. Opening the fixture record.
2. Capturing the initial form state.
3. Mutating `color_primary` in the browser to enter edit/dirty state.
4. Verifying save and cancel controls are visible.
5. Clicking cancel.
6. Verifying no write RPC was sent.

This makes the scenario testable without persisting a database change. A future
controlled-save proof would require an explicit reset policy and is outside RH0.1.

Outcome:

`S6` is now testable across `1920`, `1366`, `1024`, and `390`, in both `normal`
and `stress` profiles.

## S7 Fixture Readiness

RH0 fixture gap: notebook had 2 tabs, not the required 8 tabs.

Classification: fixture/proof-route issue.

Fixture route:

`/odoo/action-theme_liquid_glass_v2.action_bao_theme_rh01_fixture?db=bao-theme&debug=assets`

Fixture notebook pages:

1. `Global Colors`
2. `Surfaces`
3. `Borders`
4. `Text`
5. `Typography`
6. `Radius`
7. `Shadows`
8. `Overrides`

Outcome:

`S7` is now testable with 8 notebook tabs across all Governor P0 widths and both
content profiles.

## Runner Changes

Changes are readiness-only:

- `S3` activates the BAO settings tab before deciding `bao_settings_not_found`.
- `S6` and `S7` use the RH0.1 fixture action instead of an arbitrary purchase
  record.
- `S6` proves edit/save-cancel readiness with a dirty scalar field and cancel,
  without clicking save.
- Stress injection no longer writes `textContent` into `.o_field_widget`
  containers, because that destroys OWL field DOM and creates false blockers.
- Stress injection excludes autocomplete fields when it needs a scalar editable
  input.

## Server Fixture Contract

A targeted server test fixes the contract:

`tests/test_bao_theme_config.py::TestBaoThemeConfig::test_rh01_fixture_action_is_editable_with_eight_notebook_tabs`

It asserts:

- the action targets `bao.theme.config`;
- the action opens the seeded default record;
- the configured user has write rights on the record;
- the fixture form has at least 8 notebook pages.

Executed validation:

```powershell
python -m py_compile .ai-dev-system\governor\sessions\bao-backend-liquid-v2\proofs\rh0_responsive_baseline_20260516_a.py
& 'C:\Program Files\Odoo 19.0.20260317\python\python.exe' -m py_compile tests\test_bao_theme_config.py
& 'C:\Program Files\Odoo 19.0.20260317\python\python.exe' 'C:\Program Files\Odoo 19.0.20260317\server\odoo-bin' -c '.\bao_theme.windows.conf' -d 'bao-theme' -u theme_liquid_glass_v2 --test-enable --test-tags '/theme_liquid_glass_v2:TestBaoThemeConfig.test_rh01_fixture_action_is_editable_with_eight_notebook_tabs' --stop-after-init --no-http --log-level=test
```

Observed result: `0 failed, 0 error(s)` for the targeted server test.

## Remaining Blockers After RH0.1

RH0.1 clears fixture readiness blockers for `S3`, `S6`, and `S7`. It does not
clear theme failures from RH0 and does not close any P0 component.

Remaining work order stays:

1. RH1: Shell Global Resilience (`S1`)
2. RH2: Launcher Apps Resilience (`S2`)
3. RH3: Floating/Launcher Runtime Return (`S8`)
4. RH4: Control/Form Runtime Transition Errors (`S5`)
5. Then `S6` and `S7`

The `column_width_hook.js` error remains a distinct runtime-transition issue for
the RH4/RH8 runtime track, not a CSS overflow fix.

## Closure State

No component is closed by RH0.1.

| Scope | `responsive_safe` | `content_stress_safe` | `identity_preserved` | `closed` |
|---|---|---|---|---|
| `S3` fixture readiness | yes | yes | yes | no |
| `S6` fixture readiness | yes | yes | yes | no |
| `S7` fixture readiness | yes | yes | yes | no |

The `yes` values above apply only to scenario readiness. They are not component
closure claims under Q01-Q20.
