# Launcher / App Selector Governor Policy

## Canonical Classification

`ENTERPRISE_STRUCTURE_KEEP_BAO_STYLE`

This classification is mandatory for every future document, report, plan, proof and
claim about the Launcher / App Selector.

Implementation plan:

- `doc/LAUNCHER_APP_SELECTOR_AUTOPILOT_PLAN.md`

## Truth Hierarchy

- Structural truth: Odoo Enterprise only.
- Functional truth: Odoo Enterprise only.
- Visual truth: BAO palette and BAO typography only.

BAO references do not cover the launcher deeply enough to define its structure.
The launcher must never be claimed as BAO pixel-perfect, BAO structural parity, or
BAO cloned.

## Allowed Claims

- Enterprise structural parity.
- Enterprise functional parity.
- BAO palette parity.
- BAO typography parity.
- No Liquid residue.

## Forbidden Claims

- BAO strict launcher.
- BAO pixel-perfect launcher.
- Launcher structurellement BAO.
- Launcher clone depuis BAO.

## Enterprise Structure Breakdown

| Component | Enterprise structure to keep | Sub-components | Behaviors | States |
| --- | --- | --- | --- | --- |
| Topbar trigger | Enterprise app launcher trigger in the topbar relationship | app switcher trigger, icon, active/open affordance | opens/closes launcher, keeps focus and click behavior, respects outside click / escape if Enterprise supports it | closed, hover, focus, open, disabled if native |
| Launcher shell | Enterprise launcher surface and placement | root overlay/panel, internal app area, scroll container | appears and disappears like Enterprise, preserves stacking and focus order | closed, opening, open, closing |
| App grid | Enterprise app topology and layout | grid container, app item, app icon, app label | app click navigates through native menu service, items keep Enterprise hit targets and ordering | default, hover, active/current, keyboard focus |
| App item | Enterprise card/tile semantics | icon holder, image/placeholder, label | no arbitrary geometry, no custom card system beyond Enterprise dimensions | default, hover, selected/current, focus |
| Search/filter, if present | Enterprise native launcher search/filter | search input, clear button, result list | native filtering, native keyboard flow, no custom search logic | empty, typed, focus, no result |
| Company zone | Enterprise company switcher relationship | company label, company icon/avatar, dropdown trigger | company switching remains native and stable | default, hover, open, selected |
| User zone | Enterprise user menu relationship | avatar, name/status if present, dropdown trigger | user menu remains native and stable | default, hover, open, active status |
| Systray zone | Enterprise systray topology | messaging, activity, notification, settings/debug items | native systray order, popovers and dropdowns remain native | default, hover, open, notification, active |
| Overlay/backdrop | Enterprise overlay behavior if present | backdrop, body class, focus trap if native | close on outside click only if Enterprise does; no invented modal semantics | absent, visible, closing |
| Responsive launcher | Enterprise responsive behavior | mobile layout, scroll, topbar relation | follows Enterprise breakpoints and fallback behavior | desktop, tablet, mobile |

## BAO Style Application Map

| Component | BAO colors to apply | BAO typography to apply | BAO states to apply | Structural no-redraw rule |
| --- | --- | --- | --- | --- |
| Topbar trigger | BAO topbar blue, white icon/text, yellow/accent only when active or native state needs emphasis | BAO body font, native size unless Enterprise reference shows another size | hover/active/focus colors only | do not replace trigger with sidebar-only custom control |
| Launcher shell | BAO surface/background colors; no Liquid glass gradient, blur or heavy shadow residue | BAO body font for all text | open shell contrast, focus outline color | do not change Enterprise placement, dimensions, topology or opening model |
| App grid | BAO neutral or brand-tinted background only where Enterprise exposes item surfaces | BAO label font and weight within Enterprise label hierarchy | hover/active/selected color treatment | do not invent card radius, spacing, columns or tile geometry |
| App item | BAO text color, icon holder tint only if Enterprise has a holder | BAO label type scale; no display typography | hover/focus/selected colors | do not add arbitrary card depth, transform, oversized icon shell, or Liquid capsule |
| Search/filter | BAO input border/fill/text palette | BAO input typography | focus border, hover fill, selected result colors | do not replace native search/filter logic or DOM topology |
| Company zone | BAO topbar text/icon colors and dropdown palette | BAO topbar text style | hover/open/selected colors | do not move company controls into launcher unless Enterprise does |
| User zone | BAO topbar text/icon/avatar border colors where applicable | BAO topbar text style | hover/open/status colors | do not hide or restyle required Enterprise user affordances structurally |
| Systray zone | BAO icon, badge, popover and dropdown colors | BAO compact topbar typography | hover/open/notification colors | do not reorder systray items or replace popover mechanics |
| Overlay/backdrop | BAO-compatible neutral overlay if Enterprise uses one | no typography unless Enterprise text exists | visible/closing opacity only | do not introduce blur/glass overlay if Enterprise launcher does not use it |
| Responsive launcher | same BAO palette and typography as desktop | same scale adjusted only by Enterprise responsive structure | mobile hover/focus/touch states | do not create custom mobile sidebar if Enterprise uses a different mobile launcher |

## Validation Matrix

| Validation target | Required proof | Pass condition |
| --- | --- | --- |
| Launcher closed | screenshot + DOM/state check | topbar, company, user and systray read Enterprise; no launcher residue is visible |
| Launcher open | screenshot + DOM/state check against Enterprise reference | shell placement, topology and app grid read Enterprise; BAO only changes color and type |
| Hover cards/items | pointer hover proof on several app items | hover state uses BAO palette without changing Enterprise item geometry |
| Active/open states | trigger open state + current app state if Enterprise exposes one | active/readable state is visible and stable without invented BAO structure |
| Topbar launcher state | before/open/after close proof | trigger relation to launcher remains Enterprise and does not disturb topbar layout |
| Company zone | closed/open proof of company menu near launcher workflow | company switcher remains native and usable with BAO colors/type only |
| User zone | closed/open proof of user menu near launcher workflow | user menu remains native and usable with BAO colors/type only |
| Systray zone | at least messaging/activity or notification dropdown proof | systray order and behavior remain Enterprise; BAO palette/typography only |
| Navigation | click one app from launcher and return/reopen | native navigation works and launcher closes/updates like Enterprise |
| Keyboard/focus | tab/escape proof where Enterprise supports it | focus order and close behavior remain Enterprise |
| Responsive | desktop plus mobile/tablet when relevant | Enterprise responsive topology remains intact; BAO style does not force custom layout |
| Residue scan | visual + CSS/DOM class scan | no visible Liquid glass surface, arbitrary sidebar, glass blur, or native Odoo clash remains |

## Forbidden Drift List

### Drift Away From Enterprise

- Replacing Enterprise launcher topology with a custom sidebar, drawer, panel or free
  layout unless Enterprise itself uses that topology.
- Moving company, user or systray zones out of their Enterprise relationship.
- Changing app ordering, app click behavior, trigger semantics, native close behavior,
  keyboard flow or focus handling.
- Adding a custom search/filter behavior that bypasses Enterprise logic.
- Inventing new launcher wrappers that become the source of layout truth.
- Using BAO screenshots to justify launcher structure.

### Liquid Residue

- Liquid glass gradients, translucent panes, blur/backdrop effects, heavy inset
  shadows or capsule cards.
- Liquid spacing/radius/card geometry when it conflicts with Enterprise structure.
- Liquid custom sidebar launcher behavior or custom close/open choreography.
- Any class, wrapper or style whose only purpose is to preserve the old Liquid
  launcher reading.

### Fake BAO Structure

- Claiming BAO pixel-perfect launcher parity.
- Creating BAO card dimensions, columns, radius, panel stack or icon holders without
  Enterprise structural evidence.
- Forcing launcher geometry to match unrelated BAO screens such as dashboards,
  forms, lists or control panels.
- Mixing Enterprise, Liquid and invented BAO layout decisions in one launcher proof.
- Closing the launcher slice without Enterprise reference comparison.

## Closure Rule

The Launcher / App Selector is closed only when all of these are true:

- structure and behavior read as Odoo Enterprise;
- palette and typography read as BAO;
- no visible Liquid residue remains;
- no arbitrary structural workaround has been introduced;
- launcher navigation remains stable;
- closed/open/hover/active states are coherent;
- topbar, company, user and systray zones remain clean and usable.

Final rule:

`Enterprise structure + Enterprise behavior + BAO colors + BAO typography`.
