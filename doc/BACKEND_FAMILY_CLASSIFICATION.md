# Backend Family Classification

## Scope

This document captures the step-1 Governor cartography for `theme_liquid_glass_v2`.
It uses only:

- the local addon sources in this module;
- `../../theme_globale_bao/2_Tableau_de_bord`;
- `../../bao_odoo_component_atlas_v3_governor`.

## Addon Inconsistencies Corrected In This Slice

1. The addon folder is `theme_liquid_glass_v2`, but the manifest asset paths still pointed to `theme_liquid_glass`.
2. The shared background image URL in backend and website SCSS also pointed to `theme_liquid_glass`.
3. The nearby README and release notes still drifted on the module identity.

This first executable slice fixes the technical identity mismatch so Odoo can resolve the addon assets under the current module name before any BAO restyling tranche expands.

## BAO Evidence Used

- Atlas screen index types:
  - `dashboard_overview`
  - `list_plain`
  - `list_kpi`
  - `form_purchase`
  - `form_product_partner`
  - `kanban`
  - `settings`
  - `analytics`
- Representative atlas component families:
  - `webclient_top_navigation_plus_systray`
  - `action_header-*`
  - `o_list_renderer-list_view`
  - `status_pills-row_widgets-state_chips`
  - `form_action_bar_plus_statusbar-smart_actions`
  - `o_form_sheet-form_main_body`
  - `notebook_tabs-section_tabs`
  - `one2many_list-embedded_grid`
  - `mail_chatter-activity-notes_sidebar`
  - `o_kanban_renderer-kanban_board`
  - `kanban_card-card_metadata-badges`
  - `settings_tabs-preference_tabs`
  - `resusers_settings_sections-settings_cards`
  - `graph_view_shell-chart_container`
  - `legend-metric_strip-chart_annotations`

## Family Classification

| Local family | Local sources | BAO reference signal | Classification | Reason |
|---|---|---|---|---|
| Webclient chrome, systray, apps entry | `static/src/js/navbar_sidebar.js`, `static/src/xml/apps_sidebar.xml`, `static/src/scss/navbar.scss` | `webclient_top_navigation_plus_systray` | `rewrite BAO` | Atlas gives a strong chrome target, and this addon already changes structure with a custom apps sidebar. |
| Action header, breadcrumbs, search, pager, view switcher | `static/src/scss/glass_theme.scss` | `action_header-*`, `o_control_panel + search view + view switcher` | `rewrite BAO` | BAO explicitly defines these shared shells across list, kanban, dashboard, and analytics surfaces. |
| List renderer and row states | `static/src/scss/lists.scss`, `static/src/scss/glass_theme.scss` | `o_list_renderer-list_view`, `status_pills-row_widgets-state_chips` | `rewrite BAO` | List density, headers, row focus, and state chips are directly covered by atlas references. |
| Form action bar, statusbar, smart buttons, sheet | `static/src/scss/forms.scss`, `static/src/scss/buttons.scss`, `static/src/scss/glass_theme.scss` | `form_action_bar_plus_statusbar-smart_actions`, `o_form_sheet-form_main_body` | `rewrite BAO` | BAO coverage is explicit on the main form skeleton and should override the current generic glass look. |
| Notebook tabs, embedded grids, totals footer | `static/src/scss/forms.scss`, `static/src/scss/lists.scss`, `static/src/scss/glass_theme.scss` | `notebook_tabs-section_tabs`, `one2many_list-embedded_grid`, `totals_block-summary_footer` | `rewrite BAO` | These families appear in the form atlas and should converge to the BAO component language. |
| Settings tabs and settings cards | `static/src/scss/glass_theme.scss` | `settings_tabs-preference_tabs`, `resusers_settings_sections-settings_cards` | `rewrite BAO` | Preferences screens are directly represented in BAO. |
| Kanban board, columns, cards | `static/src/scss/kanban.scss` | `o_kanban_renderer-kanban_board`, `kanban_column-section_focus`, `kanban_card-card_metadata-badges` | `rewrite BAO` | Kanban has explicit BAO structure and visual targets. |
| Dashboard cards, KPI strips, analytics shells | `static/src/js/canvas_text.js`, `static/src/scss/glass_theme.scss` | `dashboard_grid-overview_cards`, `kpi_card-*`, `graph_view_shell-chart_container`, `legend-metric_strip-chart_annotations` | `keep structure + BAO reskin` | BAO covers the visible language, but the Odoo widgets remain mostly standard containers; the current addon can keep the base structure while converging visually. |
| Chatter, discuss, activity sidebars | `static/src/scss/glass_theme.scss` | `mail_chatter-activity-notes_sidebar` | `keep structure + BAO reskin` | Atlas covers the family visually, but the underlying mail widgets should stay structurally intact unless CSS proves insufficient. |
| Search panel, calendar, graph widget internals, notifications, tours | `static/src/scss/glass_theme.scss`, `static/src/js/canvas_text.js` | Partial or indirect atlas coverage only | `keep structure + BAO reskin` | These surfaces are adjacent to BAO-covered screens but not fully specified as standalone rewrite targets in the current references. |
| Modals, dropdowns, popovers, tooltips | `static/src/scss/modals.scss`, `static/src/scss/glass_theme.scss` | No strong standalone atlas family found in the inspected references | `fallback` | Keep the existing Liquid structure for now and only align visually when a stronger BAO target is available. |
| Website/login leftovers | `static/src/scss/website.scss` | No backend BAO requirement for this step | `fallback` | The tranche is backend-only; keep these leftovers isolated unless they block backend identity. |

## First Executable Slice Launched

`technical-identity-alignment`

Applied in this step:

1. fix manifest asset paths to use `theme_liquid_glass_v2/...`;
2. fix shared background URLs to use `/theme_liquid_glass_v2/static/...`;
3. align nearby addon metadata docs with the current module identity.

## Recommended Next Safe Slice

Start with the shared backend shell:

1. `navbar.scss`
2. `apps_sidebar.xml`
3. `navbar_sidebar.js`
4. control-panel selectors in `glass_theme.scss`

Reason:
BAO atlas coverage is strongest on `webclient_top_navigation_plus_systray` and `action_header-*`, and those families propagate visually to every module before deeper view-specific work starts.
