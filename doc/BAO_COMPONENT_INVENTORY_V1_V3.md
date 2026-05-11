# BAO Component Inventory V1 V3

## Purpose

This document replaces broad "family-only" thinking with a strict component inventory
for BAO backend alignment.

It is the working source of truth for future execution slices in
`theme_liquid_glass_v2`.

## Sources Of Truth

Primary sources read for this inventory:

- `../../theme_globale_bao/2_Tableau_de_bord`
- `../../bao_odoo_component_atlas_v3_governor/README.md`
- `../../bao_odoo_component_atlas_v3_governor/README_V3_ATLAS.md`
- `../../bao_odoo_component_atlas_v3_governor/GLOBAL_COMPONENT_FOUNDATION_V3.md`
- `../../bao_odoo_component_atlas_v3_governor/screen_index.md`
- `../../bao_odoo_component_atlas_v3_governor/screen_index_v3.csv`
- `../../bao_odoo_component_atlas_v3_governor/deep_component_catalog_v3.csv`

Fallback structural source explicitly retained by user decision:

- `../../theme_liquid_glass`

Launcher / App Selector exception:

- the launcher is classified as `ENTERPRISE_STRUCTURE_KEEP_BAO_STYLE`
- `doc/LAUNCHER_APP_SELECTOR_GOVERNOR_POLICY.md` is the governing policy for this
  surface
- Odoo Enterprise is the only structural and functional truth for the launcher
- BAO is limited to palette and typography for the launcher
- Liquid is not an authorized structural fallback for the launcher

Interpretation rule:

- `theme_globale_bao/2_Tableau_de_bord` is the visual truth set for atlas v1
- `bao_odoo_component_atlas_v3_governor` is the granular component truth set built
  from BAO v1 plus deeper Governor decomposition
- when v1 and v3 disagree in granularity, v1 stays the visual truth and v3 stays the
  execution taxonomy
- when BAO does not cover a surface strongly enough, or covers it only partially, the
  initial `theme_liquid_glass` addon becomes the fallback structural reference
- the current `theme_liquid_glass_v2` repo is not allowed to self-justify uncovered
  surfaces against its own already-modified state; fallback comparison must point to
  `../../theme_liquid_glass`

## Fallback Policy For Uncovered Or Partially Covered Surfaces

This rule is now part of the execution contract.

### BAO-first rule

- if BAO v1 and atlas v3 cover a component clearly, BAO remains the visual and
  behavioral target
- the initial Liquid code may still help identify technical structure, but it cannot
  overrule BAO

### Liquid fallback rule

- if BAO is silent on a surface
- or if BAO only covers a surface partially and does not define enough structure to
  close the component safely
- then the baseline reference becomes `../../theme_liquid_glass`

### Practical interpretation

- use BAO to decide what must look exact
- use initial Liquid to decide how to preserve or recover a sane underlying structure
  when BAO is incomplete
- do not use the current modified `theme_liquid_glass_v2` state as fallback truth for
  ambiguous surfaces

### Typical fallback candidates

These are not automatically "Liquid-owned", but they are the first places where the
fallback rule may be needed if BAO proof is weak:

- modal internals
- popovers and tooltips
- dropdown internals not explicitly visible in BAO
- residual calendar internals
- graph internals beyond the visible BAO shell
- notification micro-surfaces
- rare discuss/mail subwidgets

### Fallback source scope

The initial Liquid addon available for this purpose is:

- `C:\Users\moust\Documents\Work\sf-group\GinuTech\Bao\theme_liquid_glass`

Observed root structure:

- `__manifest__.py`
- `README.rst`
- `static/`
- `doc/`

This is recorded only as reference policy. It does not authorize copying blindly or
reintroducing Liquid styling where BAO is explicit.

## Coverage Summary

- BAO v1 screen references: `30`
- extra non-screen support assets in v1 folder: `4`
  - `icon.png`
  - `icon-active.png`
  - `messages-notif.png`
  - `user.png`
- atlas v3 indexed screens: `30`
- atlas v3 archetypes: `9`
- atlas v3 component rows: `1043`
- atlas v3 unique subcomponent keys: `78`

The screen set is effectively one-to-one between BAO v1 screens and atlas v3 screens.

## Screen Inventory

### Analytics

- `achat__commandes__analyse`
- `achat__commandes__analyse__camamberg`
- `achat__commandes__analyse__lines`

### List With KPI Band

- `achat__commandes__bon-de-commande-fournisseur`
- `achat__commandes__demande-de-prix`

### Purchase Form

- `achat__commandes__demande-de-prix__details`
- `achat__commandes__demande-de-prix__details__autres-infos`
- `achat__commandes__demande-de-prix__nouveau`
- `achat__commandes__demande-de-prix__nouveau__autre-info`
- `stock__operations__receptions-details__info-sup`
- `stock__operations__receptions-details__note`
- `stock__operations__receptions-details__produits`

### Kanban

- `achat__commandes__demande-de-prix__kanban`
- `achat__commandes__fournisseurs__kanban`

### Plain Lists

- `achat__commandes__fournisseurs`
- `stock__operations__reassort`
- `stock__operations__receptions`

### Product Or Partner Form

- `achat__commandes__fournisseurs__details`
- `achat__commandes__produits__details__achats`
- `achat__commandes__produits__details__attr-variantes`
- `achat__commandes__produits__details__info-generales`
- `achat__commandes__produits__details__inventaire`
- `achat__commandes__produits__details__point-de-vente`
- `achat__commandes__produits__details__ventes`

### Card Grid

- `achat__commandes__produits`

### Settings

- `preferences_utilisateur__calendrier`
- `preferences_utilisateur__preferences`
- `preferences_utilisateur__prive`
- `preferences_utilisateur__securite`

### Dashboard Overview

- `stock__vue-densemble`

## Archetype Counts

- `analytics`: `3`
- `list_kpi`: `2`
- `form_purchase`: `7`
- `kanban`: `2`
- `list_plain`: `3`
- `form_product_partner`: `7`
- `card_grid`: `1`
- `settings`: `4`
- `dashboard_overview`: `1`

## Component Surface Model

This is the real execution unit for the BAO rewrite. Each future slice should target
one surface or one narrow subset of a surface.

### `topbar`

Keys:

- `topbar_shell`
- `brand_zone`
- `nav_strip`
- `nav_entry`
- `global_search_shell`
- `global_search_input`
- `systray_shell`
- `systray_item`
- `profile_button`
- `topbar_dropdown_shell`

Importance:

- global
- critical_global
- appears across all indexed screens

### `control_panel`

Keys:

- `control_panel_shell`
- `breadcrumb_shell`
- `module_title`
- `search_shell`
- `search_input`
- `facet_chip`
- `primary_action_button`
- `secondary_action_button`
- `pager_shell`
- `view_switcher`
- `dropdown_filters`

Importance:

- mostly global
- mostly transverse
- shared by lists, forms, analytics, dashboard, settings, kanban

### `analytics`

Keys:

- `analytics_shell`
- `graph_container`
- `graph_toolbar`
- `legend_shell`
- `metric_card`

Importance:

- local to analytics screens
- visually critical for purchase analysis pages

### `dashboard_inventory`

Keys:

- `dashboard_shell`
- `dashboard_grid`
- `inventory_grid`
- `inventory_card`
- `kpi_card`

Importance:

- local but high-visibility
- directly tied to BAO overview identity

### `list`

Keys:

- `table_shell`
- `table_header_row`
- `table_header_cell`
- `table_body_row`
- `table_body_cell`
- `checkbox_cell`
- `row_badge`
- `inline_action`

Importance:

- shared across RFQ, PO, suppliers, receipts, replenishment
- strong BAO evidence in v1 and v3

### `form_header_status`

Keys:

- `form_header_shell`
- `primary_actions_zone`
- `record_title_zone`
- `smart_buttons_strip`
- `statusbar_shell`

Importance:

- shared across form screens
- belongs to document identity and action framing

### `form_sheet`

Keys:

- `form_shell`
- `sheet_shell`
- `field_shell`
- `label_shell`
- `editable_field`
- `readonly_field`
- `section_block`

Importance:

- shared across purchase and product forms
- large blast radius if changed carelessly

### `notebook`

Keys:

- `notebook_shell`
- `tab_strip`
- `tab_item`
- `active_tab_state`
- `tab_panel`

Importance:

- repeated in purchase details, product details, settings-like sections

### `x2many`

Keys:

- `x2many_shell`
- `embedded_toolbar`
- `embedded_table_shell`
- `embedded_header`
- `embedded_row`
- `add_line_action`

Importance:

- repeated in purchase lines and product embedded tables
- high regression risk

### `chatter`

Keys:

- `chatter_shell`
- `followers_block`
- `activity_block`
- `message_row`
- `composer_shell`

Importance:

- shared across forms
- BAO evidence exists, but structural tolerance is lower than shell/list work

### `kanban`

Keys:

- `kanban_shell`
- `kanban_column`
- `kanban_card_shell`
- `kanban_card_header`
- `kanban_card_body`
- `kanban_card_footer`

Importance:

- local to kanban screens
- still requires strict visual parity

### `settings`

Keys:

- `settings_shell`
- `preferences_panel`
- `settings_block`
- `settings_field_row`
- `section_header`

Importance:

- isolated enough to be a dedicated component family
- repeated across 4 settings references

## Strict Execution Groups

The old `doc/BACKEND_FAMILY_CLASSIFICATION.md` is still useful as a broad map, but it is
too coarse for exact BAO reproduction. Future work should use the groups below.

### Group A: Global Chrome

- `topbar`
- `control_panel`

Reason:

- these two surfaces propagate to almost every runtime page
- if they are wrong, every screen feels wrong

### Group B: List System

- `list`
- list-specific `control_panel` states

Reason:

- BAO list references are abundant and visually strict

### Group C: Form Frame

- `form_header_status`
- `form_sheet`
- `notebook`

Reason:

- shared document structure
- highest visible density after list work

### Group D: Deep Form Internals

- `x2many`
- `chatter`

Reason:

- more interactive
- higher regression risk
- should only start after Group C is stable

### Group E: Alternate Views

- `kanban`
- `analytics`
- `dashboard_inventory`
- `settings`

Reason:

- each has strong BAO references but lower propagation than chrome/list/form frame

## Recommended Slice Order

This is the strict component-by-component order to use next.

1. `topbar_shell`
2. `brand_zone`
3. `nav_strip`
4. `nav_entry`
5. `global_search_shell`
6. `global_search_input`
7. `systray_shell`
8. `systray_item`
9. `profile_button`
10. `topbar_dropdown_shell`
11. `control_panel_shell`
12. `breadcrumb_shell`
13. `module_title`
14. `search_shell`
15. `search_input`
16. `facet_chip`
17. `primary_action_button`
18. `secondary_action_button`
19. `pager_shell`
20. `view_switcher`
21. `dropdown_filters`
22. `table_shell`
23. `table_header_row`
24. `table_header_cell`
25. `table_body_row`
26. `table_body_cell`
27. `checkbox_cell`
28. `row_badge`
29. `inline_action`
30. `form_header_shell`
31. `primary_actions_zone`
32. `record_title_zone`
33. `smart_buttons_strip`
34. `statusbar_shell`
35. `form_shell`
36. `sheet_shell`
37. `field_shell`
38. `label_shell`
39. `editable_field`
40. `readonly_field`
41. `section_block`
42. `notebook_shell`
43. `tab_strip`
44. `tab_item`
45. `active_tab_state`
46. `tab_panel`
47. `x2many_shell`
48. `embedded_toolbar`
49. `embedded_table_shell`
50. `embedded_header`
51. `embedded_row`
52. `add_line_action`
53. `chatter_shell`
54. `followers_block`
55. `activity_block`
56. `message_row`
57. `composer_shell`
58. `kanban_shell`
59. `kanban_column`
60. `kanban_card_shell`
61. `kanban_card_header`
62. `kanban_card_body`
63. `kanban_card_footer`
64. `dashboard_shell`
65. `dashboard_grid`
66. `inventory_grid`
67. `inventory_card`
68. `kpi_card`
69. `analytics_shell`
70. `graph_container`
71. `graph_toolbar`
72. `legend_shell`
73. `metric_card`
74. `settings_shell`
75. `preferences_panel`
76. `settings_block`
77. `settings_field_row`
78. `section_header`

## Practical Rules For Next Execution

- one slice should touch one component or one very small cluster only
- every slice must name its BAO reference screens explicitly
- every slice must produce before/after proof on only the screens that expose the target component
- no component is "closed" if another screen still shows an Odoo residual on the same component
- if a component reappears on another archetype, parity must be checked before moving on

## Current Gap In Existing Repo Docs

`doc/BACKEND_FAMILY_CLASSIFICATION.md` remains valid for initial zoning, but it is stale
for exact BAO delivery because:

- it classifies by families that are too wide
- it does not enumerate all component keys
- it does not define a full component execution order
- it does not separate global surfaces from local surfaces sharply enough

This document should be used instead for future component-by-component execution.
