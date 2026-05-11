# BAO Component Slice Plan

## Status

This document is now the authoritative Governor planning artifact for BAO backend
alignment in `theme_liquid_glass_v2`.

It supersedes the old family-first execution logic that previously drove slices like
`D2`.

Old family zoning remains useful for orientation only. It is no longer authoritative
for execution order, proof, or closure decisions.

## Goal

Deliver BAO parity through a strict `component-as-slice` strategy:

- one slice closes one atlas v3 subcomponent key
- every slice is attached to explicit BAO v1 references
- every slice is attached to an explicit atlas v3 binding
- every slice has proof states, scope guardrails, and fallback rules
- no slice closes on one screen only; parity must be checked on every relevant
  archetype where the same component reappears

## Sources Of Truth

Primary:

- `../../theme_globale_bao/2_Tableau_de_bord`
- `../../bao_odoo_component_atlas_v3_governor/README.md`
- `../../bao_odoo_component_atlas_v3_governor/README_V3_ATLAS.md`
- `../../bao_odoo_component_atlas_v3_governor/GLOBAL_COMPONENT_FOUNDATION_V3.md`
- `../../bao_odoo_component_atlas_v3_governor/screen_index_v3.csv`
- `../../bao_odoo_component_atlas_v3_governor/deep_component_catalog_v3.csv`
- `doc/BAO_COMPONENT_INVENTORY_V1_V3.md`

Fallback structural source:

- `C:\Users\moust\Documents\Work\sf-group\GinuTech\Bao\theme_liquid_glass`

Launcher / App Selector exception:

- classification: `ENTERPRISE_STRUCTURE_KEEP_BAO_STYLE`
- policy: `doc/LAUNCHER_APP_SELECTOR_GOVERNOR_POLICY.md`
- auto-pilot plan: `doc/LAUNCHER_APP_SELECTOR_AUTOPILOT_PLAN.md`
- structural truth: Odoo Enterprise only
- functional truth: Odoo Enterprise only
- visual truth: BAO palette and typography only
- forbidden claims: BAO pixel-perfect launcher, BAO strict launcher, launcher
  structurally BAO, launcher cloned from BAO

## Decision Summary

The previous Governor routing drifted because the slices were too wide:

- family-first slices mixed multiple visual concerns
- proof stayed too diffuse
- closure claims were too weak for BAO-exact delivery

The new strategy fixes that by making the atlas subcomponent key the execution unit.

## Global Handling Rule

Even when a slice is proven on a bounded set of screens, the component must be
implemented with a global mindset, in the same spirit as Liquid Glass:

- the target is the shared component system, not a one-off screen patch
- proof stays screen-bounded, but implementation should land on the global reusable
  component layer whenever BAO shows that the component is shared
- screen-local overrides are acceptable only as a last resort, and only when the
  component is not truly shared in Odoo runtime
- if a component is shared globally but the fix only works on one screen, the slice is
  not considered closed

## Artifact Contract

The active Governor session must use these artifacts:

- repo plan: `doc/BAO_COMPONENT_SLICE_PLAN.md`
- session plan: `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/governor-component-plan.md`
- active slice spec: `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/governor-next-slice.md`
- active scope: `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/current-scope.md`

Historical logs may still mention `D2` or family-first routing. Those entries stay
historical only and must not be treated as the active contract anymore.

## Slice Model

Each slice must define:

- slice id
- surface
- atlas v3 `subcomponent_key`
- BAO v1 primary references
- BAO v1 parity references
- fallback mode against initial Liquid
- proof states
- probable impact zone
- stop conditions
- acceptance rule

## Reference Bundles

The plan below uses stable BAO reference bundles. They must be read literally.

### `V1_GLOBAL_PRIMARY_8`

- `achat__commandes__demande-de-prix`
- `stock__operations__receptions`
- `achat__commandes__demande-de-prix__details`
- `achat__commandes__produits__details__info-generales`
- `achat__commandes__demande-de-prix__kanban`
- `achat__commandes__analyse`
- `stock__vue-densemble`
- `preferences_utilisateur__preferences`

### `V1_LIST_5`

- `achat__commandes__bon-de-commande-fournisseur`
- `achat__commandes__demande-de-prix`
- `achat__commandes__fournisseurs`
- `stock__operations__reassort`
- `stock__operations__receptions`

### `V1_FORM_PURCHASE_7`

- `achat__commandes__demande-de-prix__details`
- `achat__commandes__demande-de-prix__details__autres-infos`
- `achat__commandes__demande-de-prix__nouveau`
- `achat__commandes__demande-de-prix__nouveau__autre-info`
- `stock__operations__receptions-details__info-sup`
- `stock__operations__receptions-details__note`
- `stock__operations__receptions-details__produits`

### `V1_FORM_PRODUCT_7`

- `achat__commandes__fournisseurs__details`
- `achat__commandes__produits__details__achats`
- `achat__commandes__produits__details__attr-variantes`
- `achat__commandes__produits__details__info-generales`
- `achat__commandes__produits__details__inventaire`
- `achat__commandes__produits__details__point-de-vente`
- `achat__commandes__produits__details__ventes`

### `V1_KANBAN_2`

- `achat__commandes__demande-de-prix__kanban`
- `achat__commandes__fournisseurs__kanban`

### `V1_ANALYTICS_3`

- `achat__commandes__analyse`
- `achat__commandes__analyse__camamberg`
- `achat__commandes__analyse__lines`

### `V1_DASHBOARD_1`

- `stock__vue-densemble`

### `V1_SETTINGS_4`

- `preferences_utilisateur__calendrier`
- `preferences_utilisateur__preferences`
- `preferences_utilisateur__prive`
- `preferences_utilisateur__securite`

### `V1_CARD_GRID_1`

- `achat__commandes__produits`

### `V1_ALL_30`

Union of:

- `V1_LIST_5`
- `V1_FORM_PURCHASE_7`
- `V1_FORM_PRODUCT_7`
- `V1_KANBAN_2`
- `V1_ANALYTICS_3`
- `V1_DASHBOARD_1`
- `V1_SETTINGS_4`
- `V1_CARD_GRID_1`

## Atlas Binding Rule

Every slice is bound to atlas v3 through:

- `deep_component_catalog_v3.csv`
- `screen_index_v3.csv`

The minimum atlas binding expression for a slice is:

- `deep_component_catalog_v3.csv :: subcomponent_key=<slice_component_key>`

Where proof has to stay archetype-aware, the slice must also check:

- `screen_index_v3.csv :: screen_id in <bundle>`

## Fallback Rule

Fallback is never a free stylistic choice.

- if BAO is explicit, BAO wins
- if BAO is partial, initial Liquid may inform structure only
- if BAO is silent, initial Liquid becomes the structural fallback
- the already-modified `theme_liquid_glass_v2` state cannot self-justify ambiguous
  surfaces

Fallback modes used in the plan:

- `none`: BAO strong enough; do not consult Liquid except for technical structure
- `light`: consult initial Liquid only if geometry or interaction skeleton is unclear
- `medium`: consult initial Liquid when BAO gives shell truth but not internal
  mechanics

## Acceptance Rule

A slice is closed only when:

- the target component matches BAO on the primary bundle
- the same component does not visibly regress on its parity bundle
- the scope stayed inside the slice guardrail
- the proof set is saved under a dedicated slice folder
- Governor can state that the component is closed without borrowing proof from a
  different component

## Proof Folder Rule

Proofs should be stored under:

- `.ai-dev-system/governor/sessions/bao-backend-liquid-v2/proofs/<slice_id>_after/`

## Global Execution Order

The order below is authoritative. Each bullet is one executable slice.

### Surface `topbar`

Shared references:

- BAO v1 primary: `V1_GLOBAL_PRIMARY_8`
- BAO v1 parity: `V1_ALL_30`
- atlas v3 surface filter: `odoo_surface_probable=topbar`
- fallback mode: `light`

Slices:

- `C01 topbar_shell` | focus=`shell geometry, height, depth, border, left-center-right balance` | atlas=`subcomponent_key=topbar_shell` | states=`default` | guard=`exclude brand, nav items, search shell, systray, profile, dropdown contents`
- `C02 brand_zone` | focus=`brand block width, logo slot, title rhythm` | atlas=`subcomponent_key=brand_zone` | states=`default` | guard=`exclude nav strip and search`
- `C03 nav_strip` | focus=`main nav track spacing and alignment` | atlas=`subcomponent_key=nav_strip` | states=`default` | guard=`exclude item-level active styling`
- `C04 nav_entry` | focus=`single nav item default, hover, active, focus` | atlas=`subcomponent_key=nav_entry` | states=`default|hover|active|focus` | guard=`exclude profile and systray`
- `C05 global_search_shell` | focus=`container geometry and placement` | atlas=`subcomponent_key=global_search_shell` | states=`default|focus-within` | guard=`exclude input text metrics`
- `C06 global_search_input` | focus=`text, placeholder, icon spacing, caret mood` | atlas=`subcomponent_key=global_search_input` | states=`default|focus|filled` | guard=`exclude dropdown results`
- `C07 systray_shell` | focus=`slot spacing and right-cluster rhythm` | atlas=`subcomponent_key=systray_shell` | states=`default` | guard=`exclude individual icons`
- `C08 systray_item` | focus=`icon button default, hover, active, badge placement` | atlas=`subcomponent_key=systray_item` | states=`default|hover|active` | guard=`exclude dropdown panels`
- `C09 profile_button` | focus=`avatar shell, name zone, caret balance` | atlas=`subcomponent_key=profile_button` | states=`default|hover|open` | guard=`exclude account dropdown contents`
- `C10 topbar_dropdown_shell` | focus=`opened menu shell linked to topbar triggers` | atlas=`subcomponent_key=topbar_dropdown_shell` | states=`open` | guard=`exclude menu row semantics outside shell`

### Surface `control_panel`

Shared references:

- BAO v1 primary: `V1_GLOBAL_PRIMARY_8`
- BAO v1 parity: `V1_LIST_5+V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7+V1_KANBAN_2+V1_ANALYTICS_3+V1_DASHBOARD_1+V1_CARD_GRID_1`
- atlas v3 surface filter: `odoo_surface_probable=control_panel`
- fallback mode: `light`

Slices:

- `C11 control_panel_shell` | focus=`bar shell, stacking, spacing, separators` | atlas=`subcomponent_key=control_panel_shell` | states=`default` | guard=`exclude child widgets`
- `C12 breadcrumb_shell` | focus=`breadcrumb baseline, separators, density` | atlas=`subcomponent_key=breadcrumb_shell` | states=`default` | guard=`exclude page title`
- `C13 module_title` | focus=`page title text system and spacing` | atlas=`subcomponent_key=module_title` | states=`default` | guard=`exclude breadcrumbs`
- `C14 search_shell` | focus=`backend search container geometry` | atlas=`subcomponent_key=search_shell` | states=`default|focus-within` | guard=`exclude search text styling`
- `C15 search_input` | focus=`search field text and placeholder system` | atlas=`subcomponent_key=search_input` | states=`default|focus|filled` | guard=`exclude dropdown filters`
- `C16 facet_chip` | focus=`active filter chip styling and closure affordance` | atlas=`subcomponent_key=facet_chip` | states=`default|hover` | guard=`exclude dropdown filters`
- `C17 primary_action_button` | focus=`main CTA in control panel` | atlas=`subcomponent_key=primary_action_button` | states=`default|hover|active|disabled` | guard=`exclude global button system outside control panel`
- `C18 secondary_action_button` | focus=`secondary CTA density and contrast` | atlas=`subcomponent_key=secondary_action_button` | states=`default|hover|active|disabled` | guard=`exclude list inline actions`
- `C19 pager_shell` | focus=`pager structure and count block` | atlas=`subcomponent_key=pager_shell` | states=`default|disabled` | guard=`exclude view switcher`
- `C20 view_switcher` | focus=`kanban/list/graph toggles shell and state` | atlas=`subcomponent_key=view_switcher` | states=`default|active|hover` | guard=`exclude dropdown filters`
- `C21 dropdown_filters` | focus=`opened filter/group/favorite menus in control panel` | atlas=`subcomponent_key=dropdown_filters` | states=`open|hover|selected` | guard=`exclude topbar dropdown shell`

### Surface `list`

Shared references:

- BAO v1 primary: `V1_LIST_5`
- BAO v1 parity: `V1_LIST_5`
- atlas v3 surface filter: `odoo_surface_probable=list`
- fallback mode: `none`

Slices:

- `C22 table_shell` | focus=`outer table frame, corners, inset, row rhythm` | atlas=`subcomponent_key=table_shell` | states=`default` | guard=`exclude header typography`
- `C23 table_header_row` | focus=`header band height and separation` | atlas=`subcomponent_key=table_header_row` | states=`default` | guard=`exclude cell text`
- `C24 table_header_cell` | focus=`header label text, icon alignment, sort affordance` | atlas=`subcomponent_key=table_header_cell` | states=`default|sorted|hover` | guard=`exclude body cells`
- `C25 table_body_row` | focus=`row block density, zebra, hover, selected` | atlas=`subcomponent_key=table_body_row` | states=`default|hover|selected` | guard=`exclude badge content`
- `C26 table_body_cell` | focus=`body text, padding, truncation, vertical centering` | atlas=`subcomponent_key=table_body_cell` | states=`default` | guard=`exclude badges and inline actions`
- `C27 checkbox_cell` | focus=`selection checkbox cell size and centering` | atlas=`subcomponent_key=checkbox_cell` | states=`default|checked|hover` | guard=`exclude row content`
- `C28 row_badge` | focus=`inline status pill within rows` | atlas=`subcomponent_key=row_badge` | states=`default|success|warning|danger|info` | guard=`exclude form badges`
- `C29 inline_action` | focus=`row-level clickable actions and micro-links` | atlas=`subcomponent_key=inline_action` | states=`default|hover|active|disabled` | guard=`exclude control panel buttons`

### Surface `form_header_status`

Shared references:

- BAO v1 primary: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- BAO v1 parity: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- atlas v3 surface filter: `odoo_surface_probable=form_header_status`
- fallback mode: `none`

Slices:

- `C30 form_header_shell` | focus=`header shell geometry and elevation` | atlas=`subcomponent_key=form_header_shell` | states=`default` | guard=`exclude sheet`
- `C31 primary_actions_zone` | focus=`button cluster layout in document header` | atlas=`subcomponent_key=primary_actions_zone` | states=`default|hover|disabled` | guard=`exclude smart buttons`
- `C32 record_title_zone` | focus=`record title spacing and hierarchy` | atlas=`subcomponent_key=record_title_zone` | states=`default` | guard=`exclude statusbar`
- `C33 smart_buttons_strip` | focus=`smart button band size, spacing, emphasis` | atlas=`subcomponent_key=smart_buttons_strip` | states=`default|hover|active` | guard=`exclude header CTA`
- `C34 statusbar_shell` | focus=`state pipeline shell and stage badges` | atlas=`subcomponent_key=statusbar_shell` | states=`default|current|done` | guard=`exclude notebook tabs`

### Surface `form_sheet`

Shared references:

- BAO v1 primary: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- BAO v1 parity: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- atlas v3 surface filter: `odoo_surface_probable=form_sheet`
- fallback mode: `none`

Slices:

- `C35 form_shell` | focus=`full form frame outside the sheet` | atlas=`subcomponent_key=form_shell` | states=`default` | guard=`exclude header`
- `C36 sheet_shell` | focus=`sheet card shell and inner padding rhythm` | atlas=`subcomponent_key=sheet_shell` | states=`default` | guard=`exclude fields`
- `C37 field_shell` | focus=`field container spacing and micro-layout` | atlas=`subcomponent_key=field_shell` | states=`default` | guard=`exclude value-specific visuals`
- `C38 label_shell` | focus=`labels, captions, helper hierarchy` | atlas=`subcomponent_key=label_shell` | states=`default` | guard=`exclude editable inputs`
- `C39 editable_field` | focus=`editable input value rendering` | atlas=`subcomponent_key=editable_field` | states=`default|focus|invalid|disabled` | guard=`exclude readonly blocks`
- `C40 readonly_field` | focus=`readonly value presentation` | atlas=`subcomponent_key=readonly_field` | states=`default` | guard=`exclude editable fields`
- `C41 section_block` | focus=`intra-sheet section framing and spacing` | atlas=`subcomponent_key=section_block` | states=`default` | guard=`exclude notebook tabs`

### Surface `notebook`

Shared references:

- BAO v1 primary: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7+V1_SETTINGS_4`
- BAO v1 parity: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7+V1_SETTINGS_4`
- atlas v3 surface filter: `odoo_surface_probable=notebook`
- fallback mode: `light`

Slices:

- `C42 notebook_shell` | focus=`full tab container shell` | atlas=`subcomponent_key=notebook_shell` | states=`default` | guard=`exclude tab content`
- `C43 tab_strip` | focus=`tab rail spacing and separators` | atlas=`subcomponent_key=tab_strip` | states=`default` | guard=`exclude active state details`
- `C44 tab_item` | focus=`single tab item default and hover` | atlas=`subcomponent_key=tab_item` | states=`default|hover` | guard=`exclude active tab signal`
- `C45 active_tab_state` | focus=`selected tab state and underline/pill logic` | atlas=`subcomponent_key=active_tab_state` | states=`active` | guard=`exclude inner panel`
- `C46 tab_panel` | focus=`content panel boundary after the tabs` | atlas=`subcomponent_key=tab_panel` | states=`default` | guard=`exclude x2many and chatter`

### Surface `x2many`

Shared references:

- BAO v1 primary: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- BAO v1 parity: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- atlas v3 surface filter: `odoo_surface_probable=x2many`
- fallback mode: `medium`

Slices:

- `C47 x2many_shell` | focus=`embedded subview outer shell` | atlas=`subcomponent_key=x2many_shell` | states=`default` | guard=`exclude chatter`
- `C48 embedded_toolbar` | focus=`embedded action row above subtable` | atlas=`subcomponent_key=embedded_toolbar` | states=`default|hover` | guard=`exclude row cells`
- `C49 embedded_table_shell` | focus=`embedded table container` | atlas=`subcomponent_key=embedded_table_shell` | states=`default` | guard=`exclude header and row details`
- `C50 embedded_header` | focus=`embedded header band` | atlas=`subcomponent_key=embedded_header` | states=`default` | guard=`exclude row states`
- `C51 embedded_row` | focus=`embedded line visual rhythm and selection` | atlas=`subcomponent_key=embedded_row` | states=`default|hover|selected` | guard=`exclude add line CTA`
- `C52 add_line_action` | focus=`embedded create/add line CTA` | atlas=`subcomponent_key=add_line_action` | states=`default|hover|active|disabled` | guard=`exclude global buttons`

### Surface `chatter`

Shared references:

- BAO v1 primary: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- BAO v1 parity: `V1_FORM_PURCHASE_7+V1_FORM_PRODUCT_7`
- atlas v3 surface filter: `odoo_surface_probable=chatter`
- fallback mode: `medium`

Slices:

- `C53 chatter_shell` | focus=`whole chatter panel shell and split with form` | atlas=`subcomponent_key=chatter_shell` | states=`default` | guard=`exclude message internals`
- `C54 followers_block` | focus=`followers and recipients block` | atlas=`subcomponent_key=followers_block` | states=`default|hover` | guard=`exclude composer`
- `C55 activity_block` | focus=`scheduled activities block` | atlas=`subcomponent_key=activity_block` | states=`default|hover` | guard=`exclude message history`
- `C56 message_row` | focus=`single message bubble row structure` | atlas=`subcomponent_key=message_row` | states=`default|hover` | guard=`exclude composer input`
- `C57 composer_shell` | focus=`message composer shell and toolbar` | atlas=`subcomponent_key=composer_shell` | states=`default|focus|expanded` | guard=`exclude historic rows`

### Surface `kanban`

Shared references:

- BAO v1 primary: `V1_KANBAN_2`
- BAO v1 parity: `V1_KANBAN_2`
- atlas v3 surface filter: `odoo_surface_probable=kanban`
- fallback mode: `light`

Slices:

- `C58 kanban_shell` | focus=`global kanban canvas spacing` | atlas=`subcomponent_key=kanban_shell` | states=`default` | guard=`exclude card internals`
- `C59 kanban_column` | focus=`column shell and spacing` | atlas=`subcomponent_key=kanban_column` | states=`default` | guard=`exclude card styles`
- `C60 kanban_card_shell` | focus=`card outer shell, border, radius, depth` | atlas=`subcomponent_key=kanban_card_shell` | states=`default|hover|selected` | guard=`exclude card header/body/footer`
- `C61 kanban_card_header` | focus=`card top zone hierarchy` | atlas=`subcomponent_key=kanban_card_header` | states=`default` | guard=`exclude body content`
- `C62 kanban_card_body` | focus=`card main content density` | atlas=`subcomponent_key=kanban_card_body` | states=`default` | guard=`exclude footer chips`
- `C63 kanban_card_footer` | focus=`card bottom meta/actions zone` | atlas=`subcomponent_key=kanban_card_footer` | states=`default|hover` | guard=`exclude body`

### Surface `dashboard_inventory`

Shared references:

- BAO v1 primary: `V1_DASHBOARD_1`
- BAO v1 parity: `V1_DASHBOARD_1`
- atlas v3 surface filter: `odoo_surface_probable=dashboard_inventory`
- fallback mode: `none`

Slices:

- `C64 dashboard_shell` | focus=`whole dashboard shell` | atlas=`subcomponent_key=dashboard_shell` | states=`default` | guard=`exclude inventory cards`
- `C65 dashboard_grid` | focus=`main grid rhythm and gutters` | atlas=`subcomponent_key=dashboard_grid` | states=`default` | guard=`exclude card internals`
- `C66 inventory_grid` | focus=`inventory-specific subgrid alignment` | atlas=`subcomponent_key=inventory_grid` | states=`default` | guard=`exclude card internals`
- `C67 inventory_card` | focus=`inventory operation card shell and header` | atlas=`subcomponent_key=inventory_card` | states=`default|hover` | guard=`exclude KPI chips`
- `C68 kpi_card` | focus=`KPI card value hierarchy and label balance` | atlas=`subcomponent_key=kpi_card` | states=`default` | guard=`exclude inventory action cards`

### Surface `analytics`

Shared references:

- BAO v1 primary: `V1_ANALYTICS_3`
- BAO v1 parity: `V1_ANALYTICS_3`
- atlas v3 surface filter: `odoo_surface_probable=analytics`
- fallback mode: `medium`

Slices:

- `C69 analytics_shell` | focus=`global analysis page shell` | atlas=`subcomponent_key=analytics_shell` | states=`default` | guard=`exclude graph internals`
- `C70 graph_container` | focus=`chart card shell and frame` | atlas=`subcomponent_key=graph_container` | states=`default` | guard=`exclude toolbar and legend`
- `C71 graph_toolbar` | focus=`graph controls and display toggles` | atlas=`subcomponent_key=graph_toolbar` | states=`default|hover|active` | guard=`exclude legend`
- `C72 legend_shell` | focus=`legend block and item spacing` | atlas=`subcomponent_key=legend_shell` | states=`default` | guard=`exclude metric cards`
- `C73 metric_card` | focus=`summary cards on analysis screens` | atlas=`subcomponent_key=metric_card` | states=`default|hover` | guard=`exclude chart shell`

### Surface `settings`

Shared references:

- BAO v1 primary: `V1_SETTINGS_4`
- BAO v1 parity: `V1_SETTINGS_4`
- atlas v3 surface filter: `odoo_surface_probable=settings`
- fallback mode: `light`

Slices:

- `C74 settings_shell` | focus=`whole settings page shell` | atlas=`subcomponent_key=settings_shell` | states=`default` | guard=`exclude field rows`
- `C75 preferences_panel` | focus=`left profile/preferences panel` | atlas=`subcomponent_key=preferences_panel` | states=`default|hover` | guard=`exclude main settings blocks`
- `C76 settings_block` | focus=`block container, inset, title, body spacing` | atlas=`subcomponent_key=settings_block` | states=`default` | guard=`exclude row-level field visuals`
- `C77 settings_field_row` | focus=`single preference row alignment and controls` | atlas=`subcomponent_key=settings_field_row` | states=`default|focus|disabled` | guard=`exclude block shell`
- `C78 section_header` | focus=`section heading hierarchy inside settings` | atlas=`subcomponent_key=section_header` | states=`default` | guard=`exclude field rows`

## Recommended Governor Waves

To keep runtime safe, execute slices in these waves:

1. `C01-C10` global topbar
2. `C11-C21` control panel
3. `C22-C29` list system
4. `C30-C41` form frame
5. `C42-C46` notebook
6. `C47-C57` x2many and chatter
7. `C58-C63` kanban
8. `C64-C68` dashboard
9. `C69-C73` analytics
10. `C74-C78` settings

## First Active Slice

The first active slice after this replanning is:

- `C01 topbar_shell`

Reason:

- it is globally visible
- it is visually foundational
- BAO coverage is strong
- it has low ambiguity relative to deeper interactive surfaces
