# BAO Theme Configuration Design

Date: 2026-05-12
Module: `theme_liquid_glass_v2`
Status: technical design ready for validation, no implementation started for this scope

## 1. Module Architecture

`theme_liquid_glass_v2` becomes the single installable backend BAO theme module and the single configuration entry point for that theme.

The module owns:

- the backend asset bundles that apply BAO visual tokens;
- the default BAO preset values;
- the persistent configuration models;
- the Settings UI section under Odoo Settings;
- the runtime resolution logic that converts configuration into CSS custom properties;
- the reset and validation rules that keep the theme coherent.

No second addon is introduced. Configuration is not split into a companion module. Existing theme assets remain the rendering layer, while new Python models and XML views become the configuration layer inside the same addon.

Expected internal structure:

- `static/src/scss/`: BAO base SCSS, component SCSS, and runtime CSS variable consumption.
- `static/src/js/`: only small backend services/controllers if runtime refresh or preview requires it.
- `models/`: theme configuration storage and inheritance resolution.
- `views/`: Settings entry and theme configuration forms.
- `data/`: default preset, family registry, targeted component registry.
- `security/`: access rules for administrators only.

The install contract is:

1. install `theme_liquid_glass_v2`;
2. BAO backend theme is active through backend assets;
3. a dedicated Settings section appears;
4. default BAO preset is used until administrators override allowed tokens.

## 2. Data Model

The data model is intentionally small. It supports global settings, family overrides, and targeted component overrides without becoming an infinite theme builder.

Primary models:

- `bao.theme.config`
  - singleton-like active configuration;
  - stores global palette, typography, surfaces, text, accent, and behavior toggles;
  - owns reset flags and active preset reference.

- `bao.theme.preset`
  - stores immutable BAO preset defaults;
  - seeded by module data;
  - first inheritance layer.

- `bao.theme.family.override`
  - one row per allowed family and config;
  - stores only fields that can differ from global;
  - allowed families are fixed by selection/data, not arbitrary user input.

- `bao.theme.component.override`
  - one row per targeted component and config;
  - stores only approved component-level tokens;
  - component list is fixed and small.

Allowed family keys:

- `shell_global`
- `launcher_apps`
- `control_navigation`
- `data_display`
- `form_system`
- `analytics_dashboard_settings`
- `floating_surfaces`

Initial targeted component keys:

- `navbar`
- `app_launcher`
- `control_panel`
- `search_bar`
- `smart_buttons`
- `form_sheet`
- `list_renderer`
- `kanban_card`
- `dropdown_menu`
- `modal_dialog`

Inheritance contract:

1. BAO preset
2. global override
3. family override
4. targeted component override

Resolution rule:

- component inherits from its family;
- family inherits from global;
- global inherits from BAO preset;
- empty override fields never erase inherited values;
- reset can target global, one family, one component, or all.

## 3. Settings UI

The Settings section appears in Odoo Settings as a dedicated BAO backend theme block for administrators.

Proposed menu placement:

- Settings app
- Technical/Administration area or general settings panel, depending on the existing Odoo 19 pattern used in this repository
- Label: `BAO Backend Theme`

Tabs:

- `Global Theme`
- `Families`
- `Targeted Components`
- `Preview & Reset`

`Global Theme` fields:

- primary color;
- secondary color;
- accent color;
- background color;
- surface color;
- elevated surface color;
- border color;
- primary text color;
- secondary text color;
- muted text color;
- global font family;
- heading font family;
- base font size policy, constrained to approved values.

`Families` fields:

- family selector;
- optional color overrides;
- optional surface overrides;
- optional typography density;
- optional border/radius overrides only where approved;
- inherited value indicators so administrators know what comes from global.

`Targeted Components` fields:

- component selector;
- family shown as read-only context;
- approved token overrides only;
- no arbitrary CSS field;
- no per-screen selector;
- no per-route selector.

`Preview & Reset` fields/actions:

- active preset summary;
- computed token preview;
- reset global;
- reset selected family;
- reset selected component;
- full reset to BAO;
- validation warnings for contrast and coherence.

## 4. Runtime Strategy

The backend theme consumes CSS custom properties. SCSS keeps the BAO fallback values and uses variables where runtime configuration is allowed.

Runtime flow:

1. server resolves the active config;
2. resolver merges `preset -> global -> family -> component`;
3. resolved values are emitted as CSS custom properties;
4. backend assets consume these properties with BAO SCSS fallbacks;
5. if no config exists or a value is invalid, BAO preset remains authoritative.

Injection options to validate during T1/T2:

- preferred: server-generated backend style asset/route scoped to the backend;
- fallback: QWeb-injected `<style>` block in backend layout if Odoo 19 asset mechanics make the route heavier than needed.

The runtime output should produce namespaces such as:

- `--bao-color-primary`
- `--bao-color-primary-dark`
- `--bao-color-primary-soft`
- `--bao-color-accent`
- `--bao-color-accent-hover`
- `--bao-bg-app`
- `--bao-surface-base`
- `--bao-surface-muted`
- `--bao-surface-subtle`
- `--bao-surface-raised`
- `--bao-border-subtle`
- `--bao-border-default`
- `--bao-border-selected`
- `--bao-border-soft`
- `--bao-border-strong`
- `--bao-text-primary`
- `--bao-text-heading`
- `--bao-text-secondary`
- `--bao-text-muted`
- `--bao-text-soft`
- `--bao-text-disabled`
- `--bao-font-body`
- `--bao-font-display`
- `--bao-radius-sm`
- `--bao-radius-md`
- `--bao-radius-lg`
- `--bao-radius-xl`
- `--bao-radius-pill`
- `--bao-shadow-soft`
- `--bao-shadow-panel`
- `--bao-shadow-popover`
- `--bao-shadow-medium`
- `--bao-shadow-heavy`

T1 global token contract:

- every token above is emitted with a static BAO default in `static/src/scss/variables.scss`;
- existing Sass variables remain available as compatibility aliases;
- compatibility aliases use `var(--bao-..., <BAO fallback>)` so the backend stays styled without database configuration;
- component/family overrides in later slices must layer on these names rather than introducing unrelated token namespaces;
- raw component hardcodes may remain only where the component has not yet been migrated to a controlled global, family, or targeted token.

Family and component values should be emitted only where useful, for example:

- `.o_control_panel { --bao-component-surface: ... }`
- `.o_form_view { --bao-family-surface: ... }`
- `.o_button_box { --bao-smartbutton-surface: ... }`

Fallback requirement:

- static BAO SCSS must remain visually correct without database overrides;
- database overrides must layer on top, not replace the whole theme;
- invalid or missing configuration must never produce an unstyled backend.

## 5. Guardrails

Customization limits:

- no arbitrary CSS text field;
- no screen-specific override;
- no route-specific override;
- no unlimited component registry;
- no selector editor;
- no user-level theme forks in this chantier.

Coherence protections:

- family keys and component keys are fixed;
- only approved token groups are editable;
- invalid color values are rejected;
- empty values mean inherit;
- preset BAO cannot be deleted;
- reset to BAO is always available.

Minimum validation:

- color syntax validation;
- basic contrast checks for text/surface pairs;
- warning when primary/accent/surface combinations collapse into low contrast;
- protected typography choices limited to BAO-approved font stack or existing module fonts;
- no destructive migration of existing assets.

Security:

- configuration writable only by Settings/technical administrators;
- backend users consume computed tokens but cannot edit them;
- public website is outside scope unless a later validated slice explicitly adds it.

## 6. Execution Slices

### T1 Fondation Tokens Globaux

Objective: make existing BAO SCSS consume stable CSS custom properties with BAO fallbacks.

Touched areas:

- `static/src/scss/variables.scss`
- shared backend SCSS import order
- documentation of token names

Acceptance:

- backend remains visually BAO with no database config;
- no component behavior changes;
- token names are stable and documented.

Validation:

- asset compile check;
- backend smoke on a clean database;
- visual sanity on main backend shell.

### T2 Stockage Et Heritage

Objective: add configuration models, preset data, and deterministic inheritance resolver.

Touched areas:

- `models/`
- `data/`
- `security/ir.model.access.csv`
- `__manifest__.py`

Acceptance:

- BAO preset exists after install;
- active config resolves `preset -> global -> family -> component`;
- empty values inherit;
- reset operations are model-level and testable.

Validation:

- Odoo module install/update;
- unit-style resolver checks if repo test harness supports it;
- shell/manual checks on computed token payload.

### T3 UI Settings

Objective: expose configuration in Odoo Settings without creating a second module.

Touched areas:

- `views/`
- possible `models/res_config_settings.py` bridge if needed by Odoo 19 settings patterns
- security groups/access

Acceptance:

- Settings contains a BAO Backend Theme section;
- administrators can edit global tokens;
- non-admin users cannot edit theme configuration;
- values persist and affect resolved output.

Validation:

- install/update module;
- navigate Settings;
- edit/save/reload;
- verify no access errors.

### T4 Family Overrides

Objective: add controlled family override support for the approved component families.

Touched areas:

- family override model fields;
- family settings UI;
- resolver;
- family-level CSS variable emission.

Acceptance:

- each approved family can inherit or override global values;
- family reset works;
- no arbitrary family key can be created from the UI.

Validation:

- resolver matrix for each family;
- runtime checks on shell, launcher, control/navigation, data display, form, dashboard/settings, floating surfaces.

### T5 Component Targeted Overrides

Objective: add limited component-level overrides for critical components only.

Touched areas:

- component override model;
- component settings UI;
- resolver;
- component-level CSS variable consumption.

Acceptance:

- only approved component keys are configurable;
- component inherits family by default;
- component reset restores family/global/preset chain;
- no per-screen customization is introduced.

Validation:

- smart buttons, control panel, dropdown, modal, list/form smoke checks;
- inheritance checks for component-specific token values.

### T6 Preview / Reset / Hardening

Objective: finish administrator workflow and reduce risk before broader use.

Touched areas:

- preview panel;
- reset actions;
- validation warnings;
- docs and handoff artifacts.

Acceptance:

- administrators can preview computed tokens;
- reset BAO restores default theme;
- contrast warnings are visible;
- implementation remains contained in `theme_liquid_glass_v2`.

Validation:

- clean install on a fresh database;
- update on an existing database;
- asset purge/rebuild check;
- browser proof of Settings and representative backend screens.
