# RH0 Scenario Runner Spec

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Runner: `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a.py`

## Purpose

The RH0 runner collects browser-level baseline evidence for the P0 responsive and
content-stress matrix. It is proof-only. It must not edit the database, SCSS, JS,
Python models, or XML views.

## Runtime Inputs

Environment variables:

| Variable | Default | Meaning |
|---|---|---|
| `BAO_BASE_URL` | `http://127.0.0.1:8078` | Odoo base URL |
| `BAO_DB` | `bao-theme` | Database name |
| `BAO_USER` | `admin` | Login |
| `BAO_PASSWORD` | `admin` | Password |
| `BAO_RH0_WIDTHS` | `1920,1366,1024,390` | Width list |
| `BAO_RH0_PROFILES` | `normal,stress` | Content profiles |
| `BAO_RH0_SCENARIOS` | `S1,S2,S3,S4,S5,S6,S7,S8` | Scenario list |
| `BAO_RH0_ZOOM` | `1.0` | Baseline zoom/page scale |
| `BAO_RH0_HEADLESS` | `1` | Headless browser when `1` |
| `BAO_RH0_OUT_NAME` | empty | Optional isolated output subdirectory for parallel scenario shards |

## Canonical Routes

| Scenario | Primary route | Fallback |
|---|---|---|
| `S1` | `/odoo?debug=assets` | `/web/login?db=<db>` then `/odoo?debug=assets` |
| `S2` | `/odoo?debug=assets`; desktop opens `.o_enterprise_launcher_toggle`, mobile opens native `.o_menu_toggle` | same |
| `S3` | `/odoo/action-theme_liquid_glass_v2.action_bao_theme_settings?debug=assets` then activate `data-key='bao_backend_theme'` | `/odoo/settings?debug=assets#bao_backend_theme` |
| `S4` | `/odoo/purchase?debug=assets` | `/odoo?debug=assets` |
| `S5` | `/odoo/purchase?debug=assets` | first available list renderer |
| `S6` | `/odoo/action-theme_liquid_glass_v2.action_bao_theme_rh01_fixture?debug=assets` | first visible editable form |
| `S7` | `/odoo/action-theme_liquid_glass_v2.action_bao_theme_rh01_fixture?debug=assets` | first visible form with 8+ notebook tabs |
| `S8` | `/odoo?debug=assets` plus topbar/profile/dropdown/dialog attempts | active backend shell |

## Stress Injection Rules

The `stress` profile may mutate browser DOM text after route load to simulate Odoo
dynamic content. This is deliberately non-persistent.

Allowed mutations:

- replace visible text in topbar/menu/company/user labels;
- replace visible launcher app/card/sidebar labels;
- replace table headers/cells/badges;
- replace button labels and smartbutton text;
- replace notebook tab labels;
- replace dropdown item text;
- replace modal title/body/footer button text if a modal opens.

Forbidden mutations:

- no database write;
- no asset write;
- no style correction;
- no hidden CSS injection to make layout pass;
- no deletion of visible native controls.

If a route has too few elements to support the official fixture, the run must report
`fixture_gap`. A fixture gap is a measured failure, not a hard blocker, unless the
surface itself cannot be reached.

RH0.1 readiness route:

- `action_bao_theme_rh01_fixture` opens the existing `bao.theme.config` default
  record in a proof-only form view with an editable state and eight notebook tabs.
- This action exists only to make `S6` and `S7` measurable. It must not add CSS,
  JS, visual hardening, or business behavior.

The runner must still collect runtime CSS, DOM metrics, screenshots, console
errors and network write guards when a scenario has a blocker after the page has
loaded. Blocked rows must not be mislabeled as `runtime_css_status_200=false`
unless the runtime CSS fetch was actually attempted and failed.

## JSON Report Schema

Top-level report:

```json
{
  "suite": "rh0_responsive_baseline_20260516_a",
  "timestamp_utc": "...",
  "base_url": "...",
  "db": "...",
  "widths": [1920, 1366, 1024, 390],
  "profiles": ["normal", "stress"],
  "scenarios": ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"],
  "rows": [],
  "summary": {
    "total": 64,
    "passed": 0,
    "failed": 0,
    "blocked": 0,
    "by_scenario": {
      "S1": {"passed": 0, "failed": 0, "blocked": 0, "total": 8}
    },
    "by_failure": {
      "root_no_horizontal_overflow": 0
    }
  },
  "priority": [
    {"scenario": "S1", "family": "shell_global/runtime_transition_residue", "score": 0}
  ]
}
```

Row schema:

```json
{
  "row_id": "S1_1366_stress",
  "scenario": "S1",
  "profile": "stress",
  "width": 1366,
  "height": 900,
  "zoom": 1.0,
  "status": "failed",
  "url": "...",
  "screenshots": ["...png"],
  "runtime_css": {"status": 200, "ok": true, "hash": "..."},
  "checks": {"root_no_horizontal_overflow": false},
  "failures": ["root_horizontal_overflow=34"],
  "blockers": [],
  "fixture_gaps": [],
  "metrics": {},
  "console_errors": [],
  "page_errors": [],
  "network_errors": [],
  "write_requests": []
}
```

## Metrics To Collect

Common metrics:

- viewport width/height;
- root `clientWidth` and `scrollWidth`;
- body `clientWidth` and `scrollWidth`;
- surface rectangles;
- open layer rectangles;
- elements with horizontal overflow;
- topbar cluster overlaps;
- dropdown/dialog/launcher bounds;
- stale transition classes;
- CSS variable hash for `--bao-*`;
- `/bao/theme/runtime.css` status and hash;
- console/page/network errors.

## Failure Rules

A row fails if any of these is true:

- `runtime_css.status != 200`;
- any CSS/JS request returns 404 or 500;
- page error exists;
- blocking console error exists;
- root horizontal overflow exists;
- measured P0 surface has horizontal overflow;
- visible cluster overlap is detected;
- required open surface does not open;
- open surface is outside viewport;
- launcher remains visible after close;
- edit mode cannot be entered where required;
- notebook active tab is not visible;
- stale transition classes remain after stabilization;
- a write RPC is observed in `write_requests`.

## Output Locations

Runner output folder:

`.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/rh0_responsive_baseline_20260516_a/`

Expected files:

- `report.json`
- one viewport PNG per row;
- additional open-state PNGs for `S2`, `S4`, `S8`;
- optional `console_network.json` if split from the main report.

## Command

Full P0 baseline:

```powershell
python .ai-dev-system\governor\sessions\bao-backend-liquid-v2\proofs\rh0_responsive_baseline_20260516_a.py
```

Reduced smoke sample:

```powershell
$env:BAO_RH0_WIDTHS='1366,390'
$env:BAO_RH0_PROFILES='normal,stress'
$env:BAO_RH0_SCENARIOS='S1,S2,S3,S4,S5,S6,S7,S8'
python .ai-dev-system\governor\sessions\bao-backend-liquid-v2\proofs\rh0_responsive_baseline_20260516_a.py
```

## Closure Rule

The runner can prove failures and can support later closure. It cannot by itself
close a component unless the component's Q01-Q20 checklist is also completed and
all relevant matrix rows pass.
