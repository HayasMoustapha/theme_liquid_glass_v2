# BAO Responsive And Dynamic Content Hardening Plan

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Status: planning artifact, no runtime hardening code in this step
Governor session: `bao-backend-liquid-v2`

## 0. Closure Doctrine

This chantier is structural hardening. A component is not closed because it is visually
good on one screenshot. It is closed only when responsive safety, content stress
safety, and BAO identity preservation are proven together.

Mandatory component gate:

| Field | Rule |
|---|---|
| `responsive_safe` | `yes` only if Q01-Q08 all pass under evidence |
| `content_stress_safe` | `yes` only if Q09-Q16 all pass under evidence |
| `identity_preserved` | `yes` only if Q17-Q20 all pass under evidence |
| `closed` | `yes` only if the three previous fields are `yes` and no forbidden symptom remains |

Mandatory checklist for every audited or corrected component:

| ID | Axis | Question |
|---|---|---|
| Q01 | Responsive safety | Holds at normal desktop width |
| Q02 | Responsive safety | Holds at reduced desktop width |
| Q03 | Responsive safety | Holds at tablet width |
| Q04 | Responsive safety | Avoids overlap |
| Q05 | Responsive safety | Avoids unwanted horizontal overflow |
| Q06 | Responsive safety | Preserves visual hierarchy when width shrinks |
| Q07 | Responsive safety | Remains readable when width shrinks |
| Q08 | Responsive safety | Keeps coherent BAO density under constraint |
| Q09 | Content stress safety | Supports long text |
| Q10 | Content stress safety | Supports very long text |
| Q11 | Content stress safety | Supports long numeric values |
| Q12 | Content stress safety | Supports long labels |
| Q13 | Content stress safety | Supports long badge/state text |
| Q14 | Content stress safety | Supports long button/action text |
| Q15 | Content stress safety | Supports unpredictable Odoo dynamic content |
| Q16 | Content stress safety | Remains readable under stressed content |
| Q17 | Identity preservation | Still reads as BAO under constraint |
| Q18 | Identity preservation | Does not fall back to raw Odoo reading under constraint |
| Q19 | Identity preservation | Does not show Liquid residue under constraint |
| Q20 | Identity preservation | Stays coherent with neighboring components |

Refusal rule: if one overlap, one critical overflow, one long-content break, one BAO
hierarchy loss, or one Odoo/Liquid fallback is observed, `closed=no`.

For this planning pass, every P0 component below is marked `closed=no` unless prior
evidence already proves the full 20-question gate. Existing proofs are useful
baselines, but they do not cover the full stress matrix.

## 1. Global Diagnostic

### Current Architecture Reading

The module is an Odoo 19 backend addon. The real runtime stack is:

- manifest assets in `web.assets_backend`;
- SCSS rendering layer in `static/src/scss/`;
- OWL/webclient patching in `static/src/js/navbar_sidebar.js`;
- QWeb extension in `static/src/xml/apps_sidebar.xml`;
- BAO runtime CSS injection through `/bao/theme/runtime.css`;
- Odoo Settings integration through `res.config.settings`;
- resolver and token inheritance in `models/bao_theme_config.py`.

The operational source of truth is the current workspace code. Some older Governor
artifacts still say "design only / no implementation started"; this is now stale for
the configurable theme work. For this hardening chantier, docs remain intent, but the
codebase is the real implementation baseline.

### Where The Theme Is Likely To Break At Reduced Width

- `control_navigation`: centered search/control panel grids use fixed middle tracks
  such as `minmax(320px, 468px)` and inline JS reserves smart-button width with
  absolute positioning. These rules are fragile at reduced desktop and tablet widths.
- `form_system`: form headers, smart buttons, statusbar, sheet/chatter grids and
  x2many cards contain fixed heights, fixed widths, `nowrap`, `overflow:hidden`, and
  grid formulas that can force compression or clipping.
- `launcher_apps`: desktop launcher uses fixed top inset and bounded grid widths;
  below 992px the custom enterprise launcher is hidden, so mobile/tablet behavior
  must be verified against native Odoo expectations.
- `data_display`: list headers use `white-space: nowrap`, fixed selector/image
  columns, and badges with `max-content` behavior. Tables can keep BAO density at
  large widths but are at risk under many columns.
- `analytics_dashboard_settings`: dashboard and settings shells contain native
  widgets with overlays/toolbars and block layouts; current styling may work on
  happy-path content but needs stress proof for long legends, settings help text,
  and KPI values.
- `floating_surfaces`: modal preference layouts use fixed visual zones and
  `overflow:hidden`; dropdown/popover shells depend on parent clipping and z-index.

### Where The Theme Is Likely To Break Under Long Content

- breadcrumbs and form titles longer than 80 characters;
- company/user names in the topbar;
- search facets and selection labels;
- primary/secondary button text;
- statusbar stage labels;
- smart button text plus six-digit counters;
- notebook tabs with eight or more labels;
- table headers and cells with long references, partner names, monetary values;
- settings block titles/help text;
- dropdowns with 12 or more items;
- modal titles/messages/forms.

### Where BAO Identity Is Most At Risk

- BAO may collapse into raw Odoo reading when content is allowed to wrap without
  hierarchy rules.
- Liquid residue can reappear through blur/backdrop/glass-like dashboard or modal
  treatments where BAO evidence is weaker.
- Excessive clipping can make the layout "stable" but not BAO: hierarchy, density,
  and readability are lost even if no overflow is visible.
- Runtime transitions can leave temporary classes or inline styles that make the
  interface read as improvised rather than as a coherent BAO system.

### Fragility Ranking

| Rank | Family | Reason |
|---|---|---|
| 1 | `form_system` | Largest CSS surface, many fixed dimensions, smartbuttons/statusbar/notebook/x2many/chatter share high blast radius |
| 2 | `control_navigation` | Global shell, search, pager, switcher, breadcrumbs and JS inline layout affect nearly every route |
| 3 | `runtime_transition_residue` | MutationObserver, timers, inline geometry and transition classes can leave residue after route/view changes |
| 4 | `data_display` | Tables and badges are exposed to uncontrolled Odoo content and many-column datasets |
| 5 | `launcher_apps` | Enterprise-structure exception needs strict responsive and open/close proof |
| 6 | `analytics_dashboard_settings` | Native widgets plus BAO skins need proof under long KPI/legend/settings content |
| 7 | `floating_surfaces` | High z-index/viewport risk but narrower surface if shells are corrected globally |
| 8 | `shell_global` | Visible everywhere; current topbar is simpler than form/control, but long names and systray badges remain P0-sensitive |

## 2. Fragility Map

| Family | Component | Fragility type | Symptom | Trigger | Severity | Probable frequency | Visual impact | Ergonomic impact |
|---|---|---|---|---|---|---|---|---|
| `shell_global` | `topbar_shell` | responsive compression | left/right clusters can collide or hide hierarchy | reduced desktop, tablet, long company/user names | P0 | high | topbar loses BAO balance | navigation and user menu harder to reach |
| `shell_global` | `nav_entries` | nowrap/label length | nav labels compress or force systray pressure | many menus, translated labels | P0 | medium | broken chrome rhythm | menu discovery degrades |
| `shell_global` | `systray_shell` | badge/value stress | badges or icons can crowd profile/company | notifications, debug/company switcher | P1 | medium | right cluster reads noisy | click targets shrink |
| `shell_global` | `profile_button` | long identity | user/company identity may be hidden or clipped | long names, multi-company | P1 | medium | identity zone inconsistent | profile/company menu discoverability drops |
| `launcher_apps` | `app_selector_toggle` | open/closed state stability | trigger can disturb topbar or lose active state | open/close, reduced width | P0 | medium | launcher relation unclear | user cannot trust launcher state |
| `launcher_apps` | `launcher_shell` | viewport fit | fixed top inset/panel may leave residue or wrong scroll | reduced height, refresh/back | P1 | medium | overlay reads detached | launcher close/navigation risk |
| `launcher_apps` | `launcher_card` | long labels | app label truncates without enough affordance | long app names, translations | P0 | high | app grid loses polish | app identification slows |
| `launcher_apps` | `apps_grid` | grid rigidity | columns/gaps may underfit at tablet | many apps, zoom | P1 | medium | unbalanced grid | scrolling/searching worsens |
| `control_navigation` | `control_panel_shell` | grid/flex rigidity | breadcrumb/search/actions/pager can overlap | 1366/1024, many actions/facets | P0 | high | global header collapses | primary workflows blocked |
| `control_navigation` | `breadcrumb_shell` | long hierarchy | title/breadcrumb truncates destructively or pushes actions | document title > 80 chars | P0 | high | hierarchy lost | user loses location |
| `control_navigation` | `search_shell` | facet pressure | search/facets overflow or clip | many active filters, long facets | P0 | high | search bar breaks BAO density | filtering becomes hard |
| `control_navigation` | `facet_chip` | long state text | chip pushes input/toggler or gets unreadable | translated filters, saved filters | P1 | high | busy header | removal/reading degraded |
| `control_navigation` | `primary_action_button` | long action label | CTA grows into neighboring zones | translations/custom actions | P0 | medium | action area deformed | main action unclear |
| `control_navigation` | `secondary_action_button` | action row pressure | secondary actions wrap badly or overflow | action menus, bulk selection | P1 | medium | uneven toolbar | actions harder to scan |
| `control_navigation` | `pager_shell` | count width | pager count/buttons collide with switcher/search | long ranges, narrow width | P0 | high | navigation cluster broken | paging blocked |
| `control_navigation` | `view_switcher_shell` | fixed button cluster | switcher can crowd pager or disappear | multiple views, tablet | P0 | medium | view mode state unclear | switching views harder |
| `data_display` | `table_header` | nowrap and many columns | header forces table overflow or hidden labels | 10+ columns, long labels | P0 | high | table hierarchy damaged | sorting/reading degraded |
| `data_display` | `table_cell` | long values | cells widen table or clip important data | long names, refs, amounts | P0 | high | row rhythm breaks | data becomes unreliable |
| `data_display` | `badge` | max-content | badges push cells or wrap badly | long status/tag text | P1 | medium | row density inconsistent | status reading harder |
| `data_display` | `status_pill` | long state | status pill overflows cell/form header | workflow states, translations | P1 | medium | status hierarchy degrades | state meaning less clear |
| `data_display` | `kpi_card_shell` | fixed height/grid | KPI values or labels clip inside fixed cards | long values, responsive columns | P1 | medium | dashboard cards uneven | metric interpretation slows |
| `form_system` | `form_header` | title/actions/status collision | document header can overlap or require destructive clipping | long title, many buttons, edit mode | P0 | high | document identity fails | create/edit workflows degrade |
| `form_system` | `smartbuttons` | nowrap/fixed rail | smart buttons exceed rail or hide text/counts | 6+ buttons, 6-digit counts | P0 | high | header actions broken | linked records less accessible |
| `form_system` | `sheet_shell` | grid/chatter pressure | sheet/chatter layout can force horizontal pressure | chatter present, tablet | P0 | high | form body collapses | data entry harder |
| `form_system` | `field_shell` | readonly/edit jump | fields change size between readonly and edit | edit toggle, validation states | P0 | high | layout jumps | data entry confidence drops |
| `form_system` | `readonly_shell` | verbose values | readonly values clip or force row height inconsistently | long names, multi-line text | P1 | high | form scan degrades | value reading unreliable |
| `form_system` | `edit_shell` | input addons | many2one/date/input buttons can overlap text | narrow columns, long values | P1 | high | input shell noisy | field editing harder |
| `form_system` | `notebook_shell` | tab overflow | tabs wrap or become inaccessible | 8+ tabs, long tab labels | P0 | high | form structure breaks | tab navigation blocked |
| `form_system` | `statusbar` | long stages | state pipeline overflows or loses active state | many stages, long labels | P0 | medium | workflow state unclear | state transition risk |
| `form_system` | `x2many_shell` | embedded table width | nested lists force parent overflow | many columns, edit rows | P1 | high | sheet width unstable | line editing harder |
| `form_system` | `chatter_shell` | fixed side rail | chatter competes with sheet width | tablet, long messages | P1 | medium | form/chatter balance lost | discussion context harder |
| `analytics_dashboard_settings` | `settings_block` | block text and row width | settings blocks lose structure or push page | help text, fields, narrow width | P0 | high | settings read as broken | admin config harder |
| `analytics_dashboard_settings` | `settings_left_rail` | tab/app label length | settings rail labels clip or crowd | many apps, translations | P1 | medium | settings navigation noisy | app settings harder to find |
| `analytics_dashboard_settings` | `preferences_panel` | modal form rigidity | user preferences can overflow or clip | long name, mobile, auth/API sections | P0 | medium | preferences dialog broken | user cannot update prefs |
| `analytics_dashboard_settings` | `dashboard_shell` | native dashboard fit | grid/toolbars collide with cards | KPI stress, date filters | P1 | medium | dashboard loses rhythm | analytics actions harder |
| `analytics_dashboard_settings` | `graph_container` | chart/toolbars/legend | graph shell clips legends or controls | long legends, pivot/graph switch | P1 | medium | chart shell inconsistent | interpretation and controls degrade |
| `floating_surfaces` | `dropdown_shell` | viewport/z-index/clipping | menu can be clipped or hidden below header | filters/actions/systray open | P0 | high | opened surface broken | action selection blocked |
| `floating_surfaces` | `popover_shell` | parent clipping | popover can escape or get clipped | autocomplete/help/activity | P1 | medium | floating surface unstable | selection/reading harder |
| `floating_surfaces` | `dialog_shell` | width/height/content stress | dialog or preference modal can overflow viewport | long title/body/forms | P0 | medium | modal unusable | save/cancel blocked |
| `runtime_transition_residue` | `route_swap_flash_guard` | unstyled flash | layout can flicker Odoo/Liquid during route swap | list->form, back, refresh | P0 | medium | identity breaks temporarily | user loses trust |
| `runtime_transition_residue` | `readonly_edit_transition_guard` | layout jump | readonly/edit shifts fields/buttons | edit/save/cancel | P0 | high | form jumps | data-entry errors more likely |
| `runtime_transition_residue` | `launcher_open_close_transition` | stale state | launcher classes/state can remain after close/back | open/close/reopen/back | P1 | medium | launcher residue | navigation confusion |
| `runtime_transition_residue` | `dropdown_open_close_transition` | refresh deferral | dropdown can be re-normalized while open | MutationObserver/timers | P1 | medium | menu jump/clipping | option selection disrupted |

## 3. P0 / P1 / P2 Classification

### P0 Critical

P0 components can break global structure, destroy BAO reading, or block core Odoo
workflows:

- `topbar_shell`
- `nav_entries`
- `app_selector_toggle`
- `launcher_card`
- `control_panel_shell`
- `breadcrumb_shell`
- `search_shell`
- `primary_action_button`
- `pager_shell`
- `view_switcher_shell`
- `table_header`
- `table_cell`
- `form_header`
- `smartbuttons`
- `sheet_shell`
- `field_shell`
- `notebook_shell`
- `statusbar`
- `settings_block`
- `preferences_panel`
- `dropdown_shell`
- `dialog_shell`
- `route_swap_flash_guard`
- `readonly_edit_transition_guard`

### P1 Important

P1 components can strongly degrade quality without necessarily collapsing the whole
view:

- `systray_shell`
- `profile_button`
- `launcher_shell`
- `apps_grid`
- `facet_chip`
- `secondary_action_button`
- `badge`
- `status_pill`
- `kpi_card_shell`
- `readonly_shell`
- `edit_shell`
- `x2many_shell`
- `chatter_shell`
- `settings_left_rail`
- `dashboard_shell`
- `graph_container`
- `popover_shell`
- `launcher_open_close_transition`
- `dropdown_open_close_transition`

### P2 Secondary

P2 follows after roots are stable:

- minor hover-only polish;
- non-blocking micro spacing;
- rare internal graph or calendar widgets not exposed by the BAO atlas;
- long-session exploratory residues after P0/P1 pass.

## 3.1 P0 Component Closure Register

The table below is not a closure claim. It is the initial P0 gate. Every row is
`closed=no` until the 20-question checklist and validation matrix pass with evidence.

| Family | Component | `responsive_safe` | `content_stress_safe` | `identity_preserved` | `closed` | Problems observed | Triggers | Severity | Probable root fix |
|---|---|---:|---:|---:|---:|---|---|---|---|
| `shell_global` | `topbar_shell` | no | no | no | no | Long right/left clusters not stress-proven | reduced width, long company/user | P0 | define compressible zones, priority collapse, non-destructive overflow policy |
| `shell_global` | `nav_entries` | no | no | no | no | `white-space: nowrap` and dynamic menu count risk | translated labels, many menus | P0 | introduce nav track wrapping/collapse contract without hiding native affordances |
| `launcher_apps` | `app_selector_toggle` | no | no | no | no | open state/topbar relation not stress-proven | open/close/reopen, tablet | P0 | keep native trigger semantics, add state/overflow proof and focus contract |
| `launcher_apps` | `launcher_card` | no | no | no | no | long app labels rely on clipping | long app names, many apps | P0 | Enterprise geometry plus BAO typography, label wrapping/tooltip/ellipsis policy |
| `control_navigation` | `control_panel_shell` | no | no | no | no | fixed centered grid and JS absolute smart rail risk collision | 1366/1024, many actions | P0 | replace coordinate reservations with resilient zone priority and reflow rules |
| `control_navigation` | `search_shell` | no | no | no | no | facets/input/toggler can compress destructively | many long facets | P0 | facet line policy, scroll/wrap contract, input min-width floor |
| `control_navigation` | `primary_action_button` | no | no | no | no | long CTA can deform action zone | translations/custom actions | P0 | max inline size, wrap/line-height policy, button group reflow |
| `control_navigation` | `pager_shell` | no | no | no | no | count/buttons can crowd switcher | long ranges, narrow widths | P0 | pager fixed affordance with compressible count and sibling priority |
| `control_navigation` | `view_switcher_shell` | no | no | no | no | switcher can collide with pager/actions | many view modes, tablet | P0 | bounded icon group, row reflow after action/search priorities |
| `data_display` | `table_header` | no | no | no | no | headers are nowrap and can force table overflow | 10+ columns, long labels | P0 | table container strategy, priority columns, header wrap/ellipsis affordance |
| `data_display` | `table_cell` | no | no | no | no | long values may widen or clip cells | refs, partners, amounts | P0 | cell content policies by type, internal scroll only for legitimate table overflow |
| `form_system` | `form_header` | no | no | no | no | title/actions/status/smart buttons not stress-proven together | long title, edit mode, many actions | P0 | explicit form header grid priorities and breakpoints |
| `form_system` | `smartbuttons` | no | no | no | no | fixed rail/dropdown widths and nowrap labels | 6+ buttons, large counters | P0 | responsive smartbutton strip, overflow menu, count/text policy |
| `form_system` | `sheet_shell` | no | no | no | no | sheet/chatter grids can force pressure | chatter, tablet, long fields | P0 | fluid sheet/chatter layout with minmax(0,1fr) and owned stacking rules |
| `form_system` | `field_shell` | no | no | no | no | readonly/edit can jump or overlap addons | edit toggle, long values | P0 | unified readonly/edit field box metrics and multi-line handling |
| `form_system` | `notebook_shell` | no | no | no | no | long/many tabs can wrap or disappear | 8+ tabs, long tab labels | P0 | tab strip overflow/scroll policy with active tab visibility |
| `form_system` | `statusbar` | no | no | no | no | current stage and long stages can crowd | many stages, translated labels | P0 | pipeline compression, current state priority, overflow dropdown proof |
| `analytics_dashboard_settings` | `settings_block` | no | no | no | no | settings rows/help text can lose structure | long help, narrow widths | P0 | block/row grid rules, label/help wrapping, field min-width floors |
| `analytics_dashboard_settings` | `preferences_panel` | no | no | no | no | modal preferences has fixed avatar/auth widths | mobile, long user name | P0 | responsive modal grid, scroll regions, header/body/footer containment |
| `floating_surfaces` | `dropdown_shell` | no | no | no | no | open menus can clip under parents or viewport | control/topbar dropdowns | P0 | global floating surface viewport/z-index/scroll contract |
| `floating_surfaces` | `dialog_shell` | no | no | no | no | modals can overflow or clip content | long title/body/forms | P0 | modal sizing tokens, internal scroll, non-destructive header/footer wrapping |

## 4. Responsive Hardening Strategy

Canonical widths:

- `1920`: large desktop reference.
- `1366`: reduced desktop.
- `1024`: tablet / constrained workspace.
- `390`: narrow mobile-class viewport.

Canonical zoom:

- `100%`: P0 baseline for all scenarios.
- `125%`: required before broader rollout for `S1`, `S4`, `S6`, `S7`, `S8`.
- `150%`: final hardening for `1024` and `390` on `S4`, `S6`, `S7`, `S8`.

Structural rules:

- All flex/grid children that may shrink must have `min-width: 0`.
- `width:max-content`, `fit-content`, hard `min-width`, hard heights, and `nowrap`
  must be justified by component contract, not by one screenshot.
- Global root overflow is forbidden on `body`, `.o_web_client`, `.o_action_manager`,
  `.o_content`, `.o_control_panel`, `.o_form_sheet`, `.o_notebook`, `.modal`,
  `.dropdown-menu`, launcher shells.
- Reflow is preferred over destructive clipping. If a component cannot fit, it must
  either wrap predictably, move secondary actions to another row/menu, or own an
  internal scroll region.
- Fixed-position or absolute-position layout is allowed only for true floating
  surfaces. It must not be used as the main control-panel geometry source.
- Visual hierarchy must degrade by priority, not by random CSS compression.

Component priority under width pressure:

1. Primary action and currently edited/saved state.
2. Current record/view identity.
3. Active search/filter state.
4. Pager and view mode.
5. Secondary actions.
6. Decorative or repeated metadata.

## 5. Content Stress Hardening Strategy

Two content profiles are required.

`normal` profile:

- usual BAO/Odoo labels;
- 3-5 visible table columns;
- 1-3 smart buttons;
- 3-5 notebook tabs;
- ordinary values and badges.

`stress` profile:

- breadcrumb and document title over 80 characters;
- company/user name over 45 characters;
- 6+ smart buttons with at least one six-digit counter;
- 8+ notebook tabs, at least one long label;
- table with 10+ columns, long headers, long refs, long monetary values;
- 12+ item dropdown;
- modal/dialog with long title, long message, and dense form;
- readonly and edit fields with multi-line values;
- settings help text and setting title long enough to wrap.

Content rules:

- Long text is not automatically truncated. Truncation is allowed only when the
  component still exposes enough context or an affordance.
- Primary identity text can wrap to a bounded number of lines when required.
- Badges and status pills must keep readable text and cannot push the parent out of
  bounds.
- Numeric values need tabular stability, but not at the cost of table overflow.
- Button/action labels may wrap to two lines in constrained contexts if height and
  baseline stay BAO-consistent.
- Tables can own horizontal scroll only inside the table region, never by pushing the
  global page.
- Odoo dynamic content is assumed uncontrolled. The theme must handle it without
  selector-per-screen hacks.

## 6. Family-By-Family Hardening Contracts

### `shell_global`

Objectives:

- stable topbar geometry at all canonical widths;
- readable brand/navigation/systray/profile clusters;
- no global horizontal overflow.

Critical components:

- `topbar_shell`, `brand_zone`, `nav_entries`, `global_search_shell`,
  `systray_shell`, `profile_button`, `topbar_dropdown_shell`.

Layout rules:

- left, center and right clusters must be compressible with `min-width:0`;
- non-essential labels may collapse only through a declared priority rule;
- topbar height must not jump during route changes.

Long-content rules:

- long company/user/menu labels must not cover systray or launcher trigger;
- systray badges must keep their hit area and stay inside the cluster.

Identity rules:

- BAO blue shell and typography remain visible;
- no Liquid blur/glass capsule residue;
- no raw Odoo fallback caused by responsive collapse.

Closure criteria:

- P0 checklist passes for `topbar_shell` and `nav_entries`;
- open topbar dropdowns remain visible and above content;
- no root overflow at `1920/1366/1024/390`.

### `launcher_apps`

Objectives:

- preserve Odoo Enterprise launcher structure and behavior;
- apply BAO only through palette and typography;
- keep open/close/navigation stable.

Critical components:

- `app_selector_toggle`, `launcher_shell`, `apps_grid`, `launcher_card`,
  `app_menu_sidebar`.

Layout rules:

- no invented BAO launcher structure;
- grid must adapt without arbitrary card geometry;
- launcher closed state must leave no residue.

Long-content rules:

- app labels support long names without breaking card hit area;
- many apps keep scroll owned by launcher, not page.

Identity rules:

- Enterprise structure + Enterprise behavior + BAO colors + BAO typography;
- no Liquid sidebar/glass reading.

Closure criteria:

- closed/open/reopen/back/Escape proofs;
- P0 checklist passes for `app_selector_toggle` and `launcher_card`;
- no topbar destabilization while launcher opens or closes.

### `control_navigation`

Objectives:

- make action header/control panel robust across list, form, kanban, pivot, graph,
  dashboard and settings;
- prevent collisions between breadcrumb, search, actions, pager and view switcher.

Critical components:

- `control_panel_shell`, `breadcrumb_shell`, `search_shell`, `facet_chip`,
  `primary_action_button`, `secondary_action_button`, `pager_shell`,
  `view_switcher_shell`, `control_dropdown_shell`.

Layout rules:

- no coordinate-only centering as structural truth;
- search/actions/navigation must reflow by priority;
- dropdowns cannot be clipped by the control panel.

Long-content rules:

- long breadcrumbs and facets must remain readable enough to orient the user;
- long buttons and pager counts must not deform the whole header.

Identity rules:

- BAO action-header hierarchy stays visible;
- native Odoo controls remain functional.

Closure criteria:

- P0 checklist passes for `control_panel_shell`, `search_shell`,
  `primary_action_button`, `pager_shell`, `view_switcher_shell`;
- dropdowns open without clipping at all canonical widths.

### `data_display`

Objectives:

- stable list/table/card presentation under many columns and long cell content;
- no global horizontal overflow caused by tables.

Critical components:

- `table_shell`, `table_header`, `table_row`, `table_cell`, `badge`,
  `status_pill`, `kpi_card_shell`, `stat_card_shell`.

Layout rules:

- table overflow must be owned by table shell when unavoidable;
- headers and cells need per-type content policies;
- row height may grow predictably, not randomly.

Long-content rules:

- references, partner names, amounts, statuses and badges must not break the row;
- truncation must not remove critical meaning.

Identity rules:

- BAO density and table rhythm remain coherent;
- no raw Bootstrap/Odoo table fallback under stress.

Closure criteria:

- P0 checklist passes for `table_header` and `table_cell`;
- stress table has 10+ columns and long values at `1920/1366/1024/390`.

### `form_system`

Objectives:

- stable document header, sheet, fields, notebook, statusbar, smartbuttons, x2many
  and chatter under real Odoo content.

Critical components:

- `form_header`, `sheet_shell`, `field_shell`, `readonly_shell`, `edit_shell`,
  `notebook_shell`, `statusbar`, `x2many_shell`, `chatter_shell`, `totals_footer`,
  `smartbuttons`.

Layout rules:

- title/actions/status cannot overlap;
- sheet/chatter must reflow before page overflow;
- readonly/edit states must use compatible box metrics.

Long-content rules:

- long record titles, long field values, long tab labels and many smartbuttons are
  mandatory stress cases;
- x2many tables/cards must not push form sheet out of viewport.

Identity rules:

- BAO document identity remains visible in readonly and edit;
- no Liquid glass residue or raw Odoo form fallback.

Closure criteria:

- P0 checklist passes for `form_header`, `smartbuttons`, `sheet_shell`,
  `field_shell`, `notebook_shell`, `statusbar`;
- `readonly -> edit -> readonly` and `list -> form -> list` are proven.

### `analytics_dashboard_settings`

Objectives:

- keep dashboard, graph, KPI and settings structures stable while preserving BAO skin;
- respect native Odoo widget mechanics.

Critical components:

- `analytics_shell`, `graph_container`, `legend_metric_strip`, `dashboard_shell`,
  `inventory_card`, `settings_block`, `settings_left_rail`, `preferences_panel`.

Layout rules:

- graph/dashboard engines keep native structure;
- toolbars and legends cannot overlap renderers;
- settings blocks stack or reflow with readable labels/help text.

Long-content rules:

- KPI values, legends, settings help text and preference labels are stressed;
- settings fields keep their input affordances.

Identity rules:

- BAO surfaces, type and spacing remain coherent;
- no graph/dashboard rewrite that breaks Odoo internals.

Closure criteria:

- P0 checklist passes for `settings_block` and `preferences_panel`;
- dashboard and graph shells validated at normal/stress content.

### `floating_surfaces`

Objectives:

- keep dropdowns, popovers, dialogs, wizards and modals inside logical viewport
  boundaries with native focus behavior preserved.

Critical components:

- `dropdown_shell`, `popover_shell`, `dialog_shell`, `wizard_shell`, `modal_shell`.

Layout rules:

- floating surfaces own their scroll when needed;
- no parent clipping;
- z-index ordering must keep menus/dialogs above headers and overlays.

Long-content rules:

- long menu items, long dialog titles and dense forms must remain usable;
- modal footer actions must stay accessible.

Identity rules:

- neutral BAO shell;
- no destructive blur/glass residue;
- native Odoo focus trap and close behavior preserved.

Closure criteria:

- P0 checklist passes for `dropdown_shell` and `dialog_shell`;
- open/close/refresh/back proofs have no leaked panel or blocked focus.

### `runtime_transition_residue`

Objectives:

- make transient classes, timers, observers and inline geometry idempotent;
- prevent unstyled flashes and stale layout reservations.

Critical components:

- `initial_boot_shell`, `route_swap_flash_guard`,
  `launcher_open_close_transition`, `dropdown_open_close_transition`,
  `notebook_transition_guard`, `readonly_edit_transition_guard`,
  `dialog_return_guard`, `refresh_return_guard`.

Layout rules:

- every temporary class must be removed deterministically;
- inline styles cannot become permanent layout truth;
- refresh scheduling must not mutate an open overlay destructively.

Long-content rules:

- transitions must be proven with stress content, not only empty routes.

Identity rules:

- no Odoo/Liquid flash under normal network/runtime timing;
- BAO tokens remain stable across route changes.

Closure criteria:

- P0 transition scenarios pass with before/after screenshots and DOM/runtime JSON;
- no stale classes or duplicate runtime CSS injection after repeated cycles.

## 7. Validation Matrix

Minimum P0 campaign:

- `4 widths x 2 content profiles x 8 scenarios = 64 runs` at `100%` zoom.
- Each run produces one PNG full viewport and one JSON report.
- Open-state scenarios produce one extra screenshot per open state.

Hardening campaign:

- `125%` zoom on `1366/1024/390` for `S1`, `S4`, `S6`, `S7`, `S8`.
- `150%` zoom on `1024/390` for `S4`, `S6`, `S7`, `S8`.

| ID | Scenario | Families tested | Components tested | Required actions | Forbidden symptoms | Expected proof |
|---|---|---|---|---|---|---|
| `S1` | Shell/navbar load | `shell_global`, `runtime_transition_residue` | topbar, nav, systray, profile | load backend, resize, refresh | root overflow, overlap, raw Odoo/Liquid flash | PNG, DOM widths, CSS var hash, console/network |
| `S2` | Launcher open/close | `launcher_apps`, `shell_global` | toggle, launcher, app cards | open, close, reopen, back | residue, wrong `aria-expanded`, launcher behind content | open/closed PNG, ARIA state, panel geometry |
| `S3` | BAO Settings runtime | `analytics_dashboard_settings`, `runtime_transition_residue` | settings block, runtime CSS | open settings, preview, save, reset, refresh | runtime CSS 404/500, token mismatch, settings overflow | PNG, computed tokens, `/bao/theme/runtime.css` network |
| `S4` | List/control panel dropdowns | `control_navigation`, `data_display`, `floating_surfaces` | search, facets, pager, switcher, dropdowns | open filters/group/favorites, apply, close | clipped menu, z-index failure, header overlap | open/closed PNG, menu position, overflow scan |
| `S5` | List to form to list | `control_navigation`, `form_system`, `runtime_transition_residue` | form header, sheet, table shell | open record, return list, browser back | flash, stale inline styles, lost BAO tokens | before/after PNG sequence, DOM class diff |
| `S6` | Form readonly/edit | `form_system`, `floating_surfaces` | field shell, statusbar, smartbuttons | readonly -> edit -> save/cancel -> readonly | field jump, action overlap, unreadable edit mode | PNG per state, classes, element bounds |
| `S7` | Notebook stress | `form_system` | notebook, tabs, panels | switch tabs, long tab, rightmost tab, refresh | tab inaccessible, broken wrap, active state lost | PNG, active tab visible, tab overflow scan |
| `S8` | Floating surfaces and return | `floating_surfaces`, `launcher_apps`, `runtime_transition_residue` | dropdown, dialog, launcher | open surfaces, refresh/back, close | overlay leak, click-through, focus loss, panel off viewport | open/closed PNG, focus target, overlay stack JSON |

JSON report contract per run:

- viewport width and height;
- zoom/device scale setting;
- route and scenario id;
- content profile id;
- selected surface selectors;
- `clientWidth` and `scrollWidth` for root and relevant components;
- list of nodes with horizontal overflow;
- open layers and z-index/position data;
- hash of resolved `--bao-*` variables;
- network status for `/bao/theme/runtime.css`;
- CSS/JS 404/500 entries;
- console errors/page errors;
- stale transition classes after stabilization.

Quality gates:

| Gate | Required result |
|---|---|
| P0 | `64/64` runs pass at `100%`; `0` console/page error; `0` runtime network error; `0` root horizontal overflow; `0` forbidden symptom |
| P1 | `125%` zoom passes for required scenarios; stress content passes on all four widths; refresh/back proven without theme loss |
| P2 | `150%` zoom passes on `1024/390`; revalidated after asset purge/rebuild; long-session exploratory pass completed |

## 8. Runtime State Hardening

Runtime states to prove:

- initial load;
- route change;
- list -> form;
- form -> list;
- notebook switch;
- readonly -> edit;
- edit -> save;
- edit -> cancel;
- dropdown open/close;
- dialog open/close;
- launcher open/close;
- refresh;
- browser back navigation.

Hardening rules:

- temporary classes such as `o_bao_cp_switching_pivot`,
  `o_bao_transition_control_panel`, `o_bao_cp_pivot_pending`,
  `o_bao_shared_cp_surface`, `o_bao_center_search_panel`,
  `o_bao_form_control_panel`, and `_new_record` must be idempotent.
- inline styles applied by JS must be cleared on every branch where their owner
  condition becomes false.
- DOM normalization must not run destructively while native overlays are open.
- route changes must not duplicate generated helper nodes.
- runtime CSS link must remain exactly one active BAO runtime style source unless
  Odoo core duplicates assets intentionally.
- token hashes must remain stable across refresh/back unless the user changes
  Settings.

## 9. Slice Plan

### `RH0` Validation Harness And Stress Fixtures

Objective:

- create reusable proof scripts and stress profiles before CSS/JS hardening.

Touched areas:

- proof scripts under Governor proof folder;
- optional test docs or fixtures;
- no runtime styling change.

Acceptance:

- scenarios `S1-S8` can run with normal and stress content;
- JSON report detects overflow, layers, console/network, token hash.

Validation:

- dry-run on one route at `1366` normal and `390` stress.

### `RH1` Shell Global Resilience

Objective:

- harden topbar, brand, nav, systray, profile and topbar dropdown relation.

Touched areas:

- `navbar.scss`;
- relevant topbar selectors in `glass_theme.scss`;
- proof for `S1` and topbar dropdown.

Acceptance:

- P0 checklist passes for `topbar_shell` and `nav_entries`.

### `RH2` Launcher Apps Resilience

Objective:

- keep Enterprise launcher behavior and BAO palette/type under responsive and
  content stress.

Touched areas:

- `navbar.scss`;
- `apps_sidebar.xml`;
- `navbar_sidebar.js` only if behavior state cleanup is needed.

Acceptance:

- P0 checklist passes for `app_selector_toggle` and `launcher_card`;
- no custom BAO launcher structure claim.

### `RH3` Control Navigation Resilience

Objective:

- remove fragile collisions in control panel, search, actions, pager and switcher.

Touched areas:

- `glass_theme.scss`;
- `forms.scss` where form control panel overrides exist;
- `navbar_sidebar.js` if inline geometry must be converted to class-driven rules.

Acceptance:

- P0 checklist passes for `control_panel_shell`, `search_shell`,
  `primary_action_button`, `pager_shell`, `view_switcher_shell`.

### `RH4` Data Display Resilience

Objective:

- stabilize lists/tables/badges/KPI cards under many columns and long values.

Touched areas:

- `lists.scss`;
- `kanban.scss`;
- relevant dashboard/list blocks in `glass_theme.scss`.

Acceptance:

- P0 checklist passes for `table_header` and `table_cell`;
- table overflow is owned and intentional when unavoidable.

### `RH5` Form System Resilience

Objective:

- harden form header, smartbuttons, sheet, fields, notebook, statusbar, x2many and
  chatter.

Touched areas:

- `forms.scss`;
- `buttons.scss` if action button shared behavior is affected;
- `navbar_sidebar.js` for breadcrumb/smartbutton/statusbar normalization cleanup.

Acceptance:

- P0 checklist passes for `form_header`, `smartbuttons`, `sheet_shell`,
  `field_shell`, `notebook_shell`, `statusbar`;
- readonly/edit transition proof passes.

### `RH6` Analytics Dashboard Settings Resilience

Objective:

- stabilize dashboards, analytics shells, settings blocks and preferences panel.

Touched areas:

- `glass_theme.scss`;
- `kanban.scss` for inventory dashboard cards;
- `modals.scss` for preferences panel;
- settings views only if source markup needs safe grouping.

Acceptance:

- P0 checklist passes for `settings_block` and `preferences_panel`;
- dashboard/graph/settings stress proof passes.

### `RH7` Floating Surfaces Resilience

Objective:

- make dropdowns, popovers, dialogs and modals viewport-safe.

Touched areas:

- `modals.scss`;
- dropdown/popover blocks in `glass_theme.scss` and `forms.scss`.

Acceptance:

- P0 checklist passes for `dropdown_shell` and `dialog_shell`;
- open surfaces never clip or leave viewport under normal/stress.

### `RH8` Runtime Transition Hardening

Objective:

- make route/view/open/close transitions idempotent and residue-free.

Touched areas:

- `navbar_sidebar.js`;
- transition guard styles in SCSS.

Acceptance:

- P0 checklist passes for `route_swap_flash_guard` and
  `readonly_edit_transition_guard`;
- all S5/S6/S8 transition proofs pass.

### `RH9` Global Residue Sweep

Objective:

- remove local hacks, duplicate rules, stale Liquid remnants and false stability.

Touched areas:

- all SCSS/JS touched by RH1-RH8;
- docs and proof reports.

Acceptance:

- P0/P1 matrix passes;
- `rg` residue scans defined for known Liquid/proxy classes;
- `git diff --check`, module update, asset purge/rebuild and browser proof pass.

## 10. Anti-Regression Rules

- No route-specific fix unless the selector is truly route-owned by Odoo and the
  Governor plan records that exception.
- No screen-by-screen patch without a shared root cause.
- No arbitrary fixed width or height unless component contract documents why it is
  safe under stress.
- No destructive clipping on text, focus rings, dropdowns, badges, buttons, table
  cells, notebook tabs, modal headers or setting rows.
- No hidden primary action, pager, view switcher, save/cancel, reset, or modal
  footer button as a stability shortcut.
- No loss of BAO hierarchy to make overflow disappear.
- No raw Odoo fallback under width/content pressure.
- No Liquid residue under width/content pressure.
- No closure claim without normal and stress content.
- No closure claim without reduced width evidence.
- No closure claim without open/close state evidence for components that can open.
- No regression of sibling routes that reuse the same Odoo component.
- No repeated runtime CSS injection or token drift across refresh/back.
- No stale transition class after the UI stabilizes.
- No commit/release readiness claim until the validation matrix gate matching the
  requested scope passes.

## Resources Used For This Plan

- Local Governor session `bao-backend-liquid-v2`.
- Local repo inspection of manifest, SCSS, JS, XML, models, views and tests.
- Existing docs: `BAO_THEME_CONFIGURATION_DESIGN.md`,
  `BACKEND_FAMILY_CLASSIFICATION.md`, `BAO_COMPONENT_INVENTORY_V1_V3.md`,
  `BAO_COMPONENT_SLICE_PLAN.md`, `LAUNCHER_APP_SELECTOR_GOVERNOR_POLICY.md`.
- Context7 Odoo 19 asset documentation: backend assets are declared in manifest
  bundles such as `web.assets_backend`; SCSS customization should respect Odoo /
  Bootstrap structure before adding specific rules.
- `ui-ux-pro-max` guidance: data-dense admin interfaces need table overflow
  handling, no accidental horizontal scroll, and no destructive `overflow:hidden`.
- Sidecar analyses: repo impact map, UI family contracts, QA validation matrix.

## Immediate Next Action

Start `RH0` before touching runtime CSS/JS:

1. implement the proof harness and stress content fixtures;
2. run the complete P0 matrix: `S1-S8` x `normal/stress` x `1920/1366/1024/390`
   for 64 accounted rows;
3. use the resulting measured failures to scope `RH1-RH3` precisely.
