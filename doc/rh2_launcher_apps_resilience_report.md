# RH2 Launcher Apps Resilience Report

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: `RH2 = Launcher Apps Resilience`
Scenario: `S2`
Status: S2 gate passed, no RH3 runtime-return work included

## Scope

RH2 only covers launcher/app-selector readiness and resilience:

- `app_selector_toggle`
- `launcher_shell`
- `apps_grid`
- `launcher_card`
- `app_menu_sidebar`

The launcher policy remains unchanged: launcher structure/function follows Odoo
Enterprise/native behavior; BAO is limited to color, typography, density, and
non-destructive responsiveness.

No control-panel, form, table, notebook, dialog, or `column_width_hook.js`
runtime correction was performed.

## Baseline After RH1

Pre-RH2 proof:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh2_s2_baseline_after_rh1_20260516_a/report.json`

| Width | Normal | Stress | Result |
|---:|---|---|---|
| `1920` | passed | passed | desktop launcher opened |
| `1366` | passed | passed | desktop launcher opened |
| `1024` | passed | passed | desktop launcher opened |
| `390` | blocked | blocked | `launcher_did_not_open` |

Classification:

`390` was a proof topology issue, not a real UI failure. At small width Odoo uses
native `.o_menu_toggle` and `.o_app_menu_sidebar`; the RH0 runner only looked for
desktop `.o_enterprise_launcher_toggle` and `.o_enterprise_app_launcher`.

## Implementation

Changed files:

- `static/src/xml/apps_sidebar.xml`
- `static/src/js/navbar_sidebar.js`
- `static/src/scss/navbar.scss`
- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a.py`
- `doc/scenario_runner_spec.md`
- `doc/responsive_validation_matrix.md`

Theme/runtime changes:

- desktop launcher root now has stable `id`, `role`, and `aria-label`;
- desktop launcher toggle now has `aria-controls`;
- app links expose native `title` with the real app name;
- desktop launcher toggle no-ops/closes in `env.isSmall` or scoped app mode;
- resize into small/scoped state closes the desktop launcher state;
- launcher card labels have `min-width: 0` and `overflow-wrap: anywhere`.

Runner/proof changes:

- `S2` opens `.o_enterprise_launcher_toggle` on desktop/tablet;
- `S2` opens native `.o_menu_toggle` at small width;
- `S2` validates either `.o_enterprise_app_launcher` or `.o_app_menu_sidebar`;
- stress profile mutates launcher app/card/sidebar labels;
- final closed-state check includes mobile `.o_app_menu_sidebar`.

## Final Proof

Final S2 matrix:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh2_s2_after_launcher_guards_20260516_b/report.json`

| Width | Normal | Stress | Root/body overflow | Console errors |
|---:|---|---|---:|---:|
| `1920` | passed | passed | `0px` | 0 |
| `1366` | passed | passed | `0px` | 0 |
| `1024` | passed | passed | `0px` | 0 |
| `390` | passed | passed | `0px` | 0 |

Summary: `8 passed / 0 failed / 0 blocked`.

Open/close proof:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh2_launcher_open_close_probe_20260516_b/report.json`

| Proof item | Result |
|---|---:|
| Rows | 8 |
| Opened overlays/sidebar | 8 |
| Closed overlays/sidebar | 8 |
| Open-state root/body overflow rows | 0 |
| Label overflow rows | 0 |
| Probe errors | 0 |

Anti-regression S1 proof:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh2_s1_regression_after_launcher_20260516_a/report.json`

Result: `8 passed / 0 failed / 0 blocked`.

## Component Checklist Q01-Q20

Legend:

- `yes`: proven by S2 final matrix and open/close probe.
- `native`: native Odoo mobile/Enterprise behavior is preserved; BAO does not
  claim structural authorship.

| Component | Q01 | Q02 | Q03 | Q04 | Q05 | Q06 | Q07 | Q08 | Q09 | Q10 | Q11 | Q12 | Q13 | Q14 | Q15 | Q16 | Q17 | Q18 | Q19 | Q20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `app_selector_toggle` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | n/a | yes | yes | yes | yes | yes | yes |
| `launcher_shell` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | n/a | yes | yes | native | yes | yes | yes |
| `apps_grid` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | n/a | yes | yes | native | yes | yes | yes |
| `launcher_card` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | yes | yes | yes | native | yes | yes | yes |
| `app_menu_sidebar` | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | n/a | yes | n/a | yes | yes | yes | native | yes | yes | yes |

## Closure Decisions

| Component | `responsive_safe` | `content_stress_safe` | `identity_preserved` | `closed` | Problems observed | Trigger | Severity | Root correction |
|---|---|---|---|---|---|---|---|---|
| `app_selector_toggle` | yes | yes | yes | yes | mobile proof missed native toggle | `390` S2 runner selector | P0 | desktop/mobile selector split, ARIA guard |
| `launcher_shell` | yes | yes | yes | yes | open-state geometry not JSON-proven before RH2 | desktop/tablet launcher open | P1 | open-state probe, stable root attributes |
| `apps_grid` | yes | yes | yes | yes | long labels could stretch rows | app label stress | P1 | label wrapping without grid geometry rewrite |
| `launcher_card` | yes | yes | yes | yes | long app labels risked overflow | stress app names | P0 | `min-width: 0`, `overflow-wrap: anywhere`, title |
| `app_menu_sidebar` | yes | yes | yes | yes | mobile sidebar was not in runner contract | `390` native Odoo path | P0 | runner validates `.o_menu_toggle` + `.o_app_menu_sidebar` |

## Anti-Regression Rules For RH3+

- Do not force `.o_enterprise_app_launcher` onto small width; `390` uses native
  `.o_app_menu_sidebar`.
- Do not replace Odoo/Enterprise launcher topology with a custom BAO launcher.
- Preserve desktop `aria-controls` / open-state relation when touching launcher.
- Preserve S1 topbar constraints; RH2 changes must keep S1 at `8/8`.
- RH3 may test floating/launcher runtime return, but must not reclassify RH2
  structure as BAO-owned.
- `column_width_hook.js` remains a separate runtime chantier.
