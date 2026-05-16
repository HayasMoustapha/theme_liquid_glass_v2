# RH Large Screen And Dynamic Recontrol Report

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: RH1/RH2/RH3 recontrol after Governor large-screen and dynamic-residue add-on
Status: Passed for tested RH1/RH2/RH3 surfaces

## Purpose

This recontrol answers the Governor add-on that large screens must remain intact
and BAO-consistent after responsive hardening, and that responsive changes must be
automatic and dynamic without residue from the previous viewport or runtime state.

This is not a replacement for a future full-screen gold-master pixel-diff suite.
The repository currently has a narrow KPI pixel reference path, but no locked
full-screen pixel baseline for shell, launcher, dropdown, or app grid. Therefore
this recontrol uses the strongest available evidence for RH1/RH2/RH3: browser
screenshots, runtime geometry, overflow checks, open-layer cleanup, CSS/JS/network
guards, write-request guards, and static BAO identity references.

## Reference Set

Current authoritative large-screen runtime evidence:

- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh_recontrol_large_20260516_c/report.json`
- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh_recontrol_large_openmetrics_20260516_d/report.json`

Static BAO identity references:

- `static/description/img/1.png` for app grid/launcher-like identity
- `static/description/img/2.png`, `3.png`, `4.png`, `6png.png`, `7.png` for
  generic backend surfaces
- `static/description/img/responsive-backend-theme.png` for responsive overview
- `static/description/theme_screenshot.jpg` for marketplace/theme identity

Existing strict pixel reference:

- `static/src/img/bao_kpi_atlas_ref.png`

That KPI atlas does not cover RH1/RH2/RH3 shell, launcher, or dropdown surfaces.

## Large-Screen Recontrol

Harness:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh_recontrol_large_20260516_c/report.json`

Coverage:

- scenarios: `S1`, `S2`, `S8`
- widths: `1920x1080`, `1366x900`
- profiles: `normal`, `stress`

Result:

| Scenario | Family | Rows | Result |
|---|---|---:|---|
| `S1` | RH1 shell/global topbar | 4 | passed |
| `S2` | RH2 launcher/apps | 4 | passed |
| `S8` | RH3 floating/launcher runtime return | 4 | passed |

Total: `12/12 passed`, `0 failed`, `0 blocked`.

Open-state geometry harness:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh_recontrol_large_openmetrics_20260516_d/report.json`

Result: `4/4 passed`, `0 failed`, `0 blocked`.

Measured invariants:

- root/body horizontal overflow: `0 / 0` on all rows;
- topbar overlaps: `0`;
- console errors: `0`;
- page errors: `0`;
- CSS/JS/runtime network errors: `0`;
- write requests: `0`.

Large-screen launcher geometry:

- `1920`: `x=0`, `y=60`, `w=1920`, `h=1020`, `z=7020`
- `1366`: `x=0`, `y=60`, `w=1366`, `h=840`, `z=7020`

Large-screen dropdown geometry:

- `1920 normal`: `x=1157.5`, `y=57`, `w=297.5`, `h=468.4`, `z=1070`
- `1920 stress`: `x=921.2`, `y=57`, `w=533.8`, `h=422.4`, `z=1070`
- `1366 normal`: `x=643.3`, `y=57`, `w=297.5`, `h=468.4`, `z=1070`
- `1366 stress`: `x=406.9`, `y=57`, `w=533.8`, `h=422.4`, `z=1070`

Conclusion: RH1/RH2/RH3 keep the large-screen BAO envelope for the tested
surfaces. The responsive hardening did not introduce large-screen overflow,
topbar collision, launcher geometry drift, dropdown clipping, console errors, or
runtime residue.

## Dynamic Responsive Recontrol

Harness:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/rh_dynamic_residue_recontrol_20260516_a/report.json`

Coverage:

- profiles: `normal`, `stress`
- dynamic viewport chain:
  - desktop launcher open: `1920 -> 1366 -> 1024 -> 390 -> 1920`
  - dropdown open: `1920 -> 1366 -> 1024 -> 390 -> 1920`
  - mobile sidebar open: `390 -> 1024 -> 1366 -> 1920 -> 390`

Result: `2/2 passed`, `0 failed`.

Measured invariants at each step:

- root/body horizontal overflow: `0`;
- topbar overlaps: `0`;
- stale BAO transition classes: `0`;
- layer out-of-viewport overflow: `0`;
- final open-layer residue after close: `0`;
- console/page/network/write errors: `0`.

Conclusion: for RH1/RH2/RH3 surfaces, responsive adaptation is dynamic and does
not retain invalid desktop launcher, mobile sidebar, dropdown, backdrop, or
transition residue when the viewport changes.

## Pixel-Perfect Truth Rule

The requested large-screen requirement is accepted as a strict gate, but the
current repository does not contain a locked full-screen BAO gold master for
RH1/RH2/RH3. Therefore:

- do not claim formal full-screen pixel-perfect equivalence for RH1/RH2/RH3;
- do claim browser-proven large-screen preservation for the tested surfaces;
- keep static description images as identity references, not strict pixel baselines;
- keep KPI pixel-diff claims limited to the KPI atlas path;
- before any future broad visual change, create a locked full-screen gold master
  for the exact route, viewport, database state, zoom, and profile being compared.

## Governor Recontrol Decision

RH1 remains closed for:

- `topbar_shell`
- `brand_zone`
- `nav_entries`
- `systray_shell`
- `profile_button`
- `topbar_dropdown_shell`

RH2 remains closed for:

- `app_selector_toggle`
- `launcher_shell`
- `apps_grid`
- `launcher_card`
- `app_menu_sidebar`

RH3 is closed only for:

- `dropdown_shell`
- `topbar_dropdown_shell`
- `launcher_open_close_transition`
- `dropdown_open_close_transition`
- `refresh_return_guard`

Still open:

- `global_search_shell`, because no visible route fixture was available in S1;
- `popover_shell`, `dialog_shell`, and `modal_shell`, because RH3 did not open
  dedicated fixtures for those surfaces;
- `column_width_hook.js`, which remains a separate runtime chantier.
