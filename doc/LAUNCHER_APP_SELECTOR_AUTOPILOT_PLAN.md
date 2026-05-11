# Launcher / App Selector Autopilot Implementation Plan

## Governor Decision Gate

Canonical classification: `ENTERPRISE_STRUCTURE_KEEP_BAO_STYLE`.

This plan is ready for auto-pilot execution, but it supersedes the current active
Governor slice `R1-wave4-form-control-panel` if started immediately.

Execution choice:

- `queue`: keep `R1-wave4-form-control-panel` active and treat launcher as the next
  exception slice.
- `supersede`: pause wave4 explicitly and make launcher the active slice.

No implementation may start without one of these two states being recorded in the
Governor session artifacts.

## Enterprise Example Inputs

Reference examples supplied by the user:

- `C:\Users\moust\Documents\Work\sf-group\GinuTech\Bao\entreprise_launcher_app_model_example\e.jpeg`
- `C:\Users\moust\Documents\Work\sf-group\GinuTech\Bao\entreprise_launcher_app_model_example\entreprise_launcher_app.jpeg`

These screenshots are Enterprise structure examples, not BAO structure targets.

Observed Enterprise invariants:

- launcher reads as a full-screen or native app menu surface, not a custom desktop
  drawer;
- app grid is centered and regular, with app icon above app label;
- topbar/company/user/systray remain visible and usable in their Enterprise
  relationship;
- app navigation is item based and native;
- launcher background is broad and unobtrusive behind the app grid;
- app tiles do not become arbitrary oversized cards;
- active/open topbar state is visible without moving systray/company/user zones.

## Objective

Recover launcher/app selector parity under this formula:

`Enterprise structure + Enterprise behavior + BAO colors + BAO typography`.

Explicit non-goals:

- no BAO structural launcher;
- no BAO pixel-perfect claim;
- no Liquid recolored launcher;
- no custom sidebar/drawer on desktop unless Enterprise reference proves that
  topology for the target viewport;
- no arbitrary launcher card geometry.

## Resource Orchestration Policy

Mandatory resources for auto-pilot:

- main Codex orchestrator: owns integration, conflict resolution, final edits and
  final proof judgment;
- `repo_analyst` or explorer: verifies current launcher files and no hidden launcher
  assets;
- `execution_architect`: checks slice order, file ownership and rollback boundaries;
- `browser_debugger`: produces runtime proof for open/close/navigation/topbar zones;
- `qa_reviewer`: reviews the patch and evidence against forbidden drift;
- Context7/Odoo 19 docs or installed Odoo source: verifies native Odoo 19 selectors
  and behavior before editing.

Cost rule:

- use sub-agents only on disjoint tasks with explicit ownership;
- close each sub-agent as soon as its result is consumed;
- do not spawn parallel agents that inspect or edit the same file range;
- use local Odoo source before broad web/MCP research;
- use one runtime instance on `http://127.0.0.1:8078` and one proof script.

## Implementation Slices

### L0 Governor Scope Switch

Objective:

- record whether launcher is queued after wave4 or supersedes wave4 now.

Touched areas:

- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/governor-next-slice.md`
- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/current-scope.md`
- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/governor-component-plan.md`

Acceptance:

- active slice is unambiguous;
- launcher is named as `ENTERPRISE_STRUCTURE_KEEP_BAO_STYLE`;
- wave4 status is either still active or explicitly paused.

Validation:

- grep for conflicting active-slice claims;
- no implementation files touched in L0.

### L1 Native Structure Recovery

Objective:

- remove the custom Liquid/sidebar desktop launcher structure and restore the
  Enterprise launcher topology shown in the user-supplied Enterprise screenshots:
  topbar trigger, full-screen app selector surface under the topbar, centered app
  grid, icon + label tiles, and stable app navigation.

Touched areas:

- `static/src/xml/apps_sidebar.xml`
- `static/src/js/navbar_sidebar.js`
- `__manifest__.py` only if XML/JS files are removed, split or renamed.

Required changes:

- stop injecting `.o_apps_sidebar` after `web.NavBar`;
- stop replacing `.o_navbar_apps_menu` with `.o_navbar_sidebar_toggle`;
- replace the Community desktop dropdown only as needed to reproduce the
  Enterprise full-screen launcher topology; this is not a BAO structure claim;
- preserve native `web.NavBar.AppsMenu.Sidebar` small-screen behavior;
- remove launcher-only `sidebarState`, `toggleSidebar`, and `closeSidebar` from the
  broad navbar patch unless another active feature still depends on them;
- keep control-panel normalization code untouched.

Acceptance:

- no visible `.o_apps_sidebar` or `.o_sidebar_overlay` remains in desktop launcher
  flow;
- `.o_navbar_apps_menu` keeps the Enterprise launcher trigger relation to the
  topbar;
- `.o_app` items remain menu entries with `data-menu-xmlid`, `data-section`,
  `href` and native menu selection/navigation.

Validation:

- static grep for removed custom selectors;
- assets compile;
- runtime open/close check.

Rollback:

- revert only `apps_sidebar.xml` and launcher-specific JS removal if native launcher
  recovery breaks asset loading.

### L2 BAO Palette And Typography Skin

Objective:

- apply BAO colors and typography to native Enterprise launcher selectors without
  altering structure.

Touched areas:

- `static/src/scss/navbar.scss`
- `static/src/scss/variables.scss` only if an existing BAO token is missing.

Required style scope:

- `.o_navbar_apps_menu .dropdown-toggle`
- `.o-dropdown--menu .o_app`
- `.o-dropdown--menu [data-menu-xmlid]`
- mobile native `.o_app_menu_sidebar`
- `.o_sidebar_topbar`
- `.o_burger_menu_content.o_burger_menu_app`
- app labels/icons only through color/type-safe rules.

Forbidden style changes:

- new desktop drawer geometry;
- arbitrary app tile dimensions;
- transform-based hover lift;
- glass blur, Liquid gradients, capsule cards or heavy shadows;
- reordering company/user/systray zones.

Acceptance:

- colors read BAO;
- typography reads BAO;
- native layout dimensions, order and hit targets remain Enterprise.

Validation:

- computed-color/type snapshot for trigger, app item, label, menu background,
  hover/focus/current states;
- screenshot comparison against Enterprise examples for structure only.

Rollback:

- remove the launcher-specific SCSS block while keeping topbar BAO styling intact.

### L3 Runtime Proof Script

Objective:

- produce closure-grade runtime evidence for Enterprise structure/function and BAO
  palette/type.

Touched areas:

- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/launcher_app_selector_enterprise_bao_<date>_a/`

Proof states:

- launcher closed;
- launcher open;
- app item hover;
- active/current app state;
- trigger open state;
- company dropdown after launcher cycle;
- user dropdown after launcher cycle;
- systray dropdown/popover after launcher cycle;
- navigation through one app;
- desktop plus at least one narrower viewport.

Required assertions:

- no visible `.o_apps_sidebar`;
- no visible `.o_sidebar_overlay`;
- desktop launcher root is the Enterprise full-screen app selector surface;
- narrow viewport preserves the native Odoo mobile sidebar path;
- `.o_main_navbar` order remains stable before and after open/close;
- `.o_menu_systray`, `.o_switch_company_menu`, and `.o_user_menu` remain usable;
- app navigation changes route/action and closes launcher like Enterprise;
- console errors and page errors are empty.

Artifacts:

- `report.json`
- `closed_full.png`
- `open_full.png`
- `hover_app.png`
- `company_open.png`
- `user_open.png`
- `systray_open.png`
- `responsive_open.png`

### L4 QA Review And Claim Gate

Objective:

- verify the patch and proof against the strict Governor policy.

Reviewer ownership:

- `qa_reviewer` reads all changed files and proof artifacts;
- reviewer does not edit files;
- main orchestrator applies any fix.

Acceptance:

- allowed claims only:
  - Enterprise structural parity;
  - Enterprise functional parity;
  - BAO palette parity;
  - BAO typography parity;
  - no Liquid residue.
- forbidden claims absent:
  - BAO strict launcher;
  - BAO pixel-perfect launcher;
  - launcher structurellement BAO;
  - launcher clone depuis BAO.

Validation:

- `git diff --check`;
- asset build or Odoo module upgrade;
- runtime proof script passes;
- QA reviewer has no blocking finding.

### L5 Commit And Handoff

Objective:

- commit the accepted launcher slice and update Governor state.

Commit shape:

- `fix: launcher enterprise structure with BAO style`

Governor updates:

- `executor-return.md`
- `stage-review.md`
- `session-manifest.yml`
- `resume-brief.md`
- `pilotage-memory.md` only for durable lessons.

Acceptance:

- worktree clean except intentional Governor runtime logs if excluded;
- commit pushed if user policy still requires push after accepted slices;
- next slice is explicitly restored to wave4 or advanced according to Governor.

## File Ownership For Parallel Work

| Workstream | Owner | Write scope | Notes |
| --- | --- | --- | --- |
| Structure recovery | main Codex or worker A | `static/src/xml/apps_sidebar.xml`, launcher-specific section of `static/src/js/navbar_sidebar.js` | must not edit control-panel normalization |
| BAO skin | worker B | launcher-specific block in `static/src/scss/navbar.scss` | no XML/JS edits |
| Proof script | worker C/browser_debugger | proof directory only | no source edits |
| QA review | qa_reviewer | read-only | reports blockers only |
| Governor docs | main Codex | plan/session artifacts only | integrates decisions and final claims |

No two workers may write the same source file simultaneously.

## Closure Blockers

- no Enterprise reference comparison;
- native launcher replaced by custom sidebar/drawer without Enterprise proof;
- `.o_apps_sidebar` or `.o_sidebar_overlay` remains visible in desktop flow;
- app grid/card geometry is invented;
- company/user/systray are moved, hidden, blocked or reordered;
- navigation does not follow native Enterprise behavior;
- console/page errors appear;
- proof lacks open/closed/hover/active/topbar zone states;
- any forbidden BAO structural launcher claim appears.

## Recommended Auto-Pilot Path

1. Supersede current wave4 only if Governor explicitly prioritizes launcher now.
2. Execute L1 and L2 in separate file scopes.
3. Run L3 runtime proof on `bao-theme`.
4. Run L4 QA review.
5. Commit/push only after all closure gates pass.
6. Restore the previous wave4 queue item or advance to the next Governor-approved
   launcher follow-up.
