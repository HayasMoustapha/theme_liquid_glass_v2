# -*- coding: utf-8 -*-

import re

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError


TOKEN_FIELDS = (
    "color_primary",
    "color_primary_dark",
    "color_primary_soft",
    "color_accent",
    "color_accent_hover",
    "bg_app",
    "surface_base",
    "surface_muted",
    "surface_subtle",
    "surface_raised",
    "border_subtle",
    "border_default",
    "border_selected",
    "border_soft",
    "border_strong",
    "text_primary",
    "text_heading",
    "text_secondary",
    "text_muted",
    "text_soft",
    "text_disabled",
    "font_body",
    "font_display",
    "radius_sm",
    "radius_md",
    "radius_lg",
    "radius_xl",
    "radius_pill",
    "shadow_soft",
    "shadow_panel",
    "shadow_popover",
    "shadow_medium",
    "shadow_heavy",
)

COLOR_TOKEN_FIELDS = (
    "color_primary",
    "color_primary_dark",
    "color_primary_soft",
    "color_accent",
    "color_accent_hover",
    "bg_app",
    "surface_base",
    "surface_muted",
    "surface_subtle",
    "surface_raised",
    "border_subtle",
    "border_default",
    "border_selected",
    "border_soft",
    "border_strong",
    "text_primary",
    "text_heading",
    "text_secondary",
    "text_muted",
    "text_soft",
    "text_disabled",
)

CSS_VAR_BY_FIELD = {
    "color_primary": "--bao-color-primary",
    "color_primary_dark": "--bao-color-primary-dark",
    "color_primary_soft": "--bao-color-primary-soft",
    "color_accent": "--bao-color-accent",
    "color_accent_hover": "--bao-color-accent-hover",
    "bg_app": "--bao-bg-app",
    "surface_base": "--bao-surface-base",
    "surface_muted": "--bao-surface-muted",
    "surface_subtle": "--bao-surface-subtle",
    "surface_raised": "--bao-surface-raised",
    "border_subtle": "--bao-border-subtle",
    "border_default": "--bao-border-default",
    "border_selected": "--bao-border-selected",
    "border_soft": "--bao-border-soft",
    "border_strong": "--bao-border-strong",
    "text_primary": "--bao-text-primary",
    "text_heading": "--bao-text-heading",
    "text_secondary": "--bao-text-secondary",
    "text_muted": "--bao-text-muted",
    "text_soft": "--bao-text-soft",
    "text_disabled": "--bao-text-disabled",
    "font_body": "--bao-font-body",
    "font_display": "--bao-font-display",
    "radius_sm": "--bao-radius-sm",
    "radius_md": "--bao-radius-md",
    "radius_lg": "--bao-radius-lg",
    "radius_xl": "--bao-radius-xl",
    "radius_pill": "--bao-radius-pill",
    "shadow_soft": "--bao-shadow-soft",
    "shadow_panel": "--bao-shadow-panel",
    "shadow_popover": "--bao-shadow-popover",
    "shadow_medium": "--bao-shadow-medium",
    "shadow_heavy": "--bao-shadow-heavy",
}

FAMILY_SELECTION = [
    ("shell_global", "Shell Global"),
    ("launcher_apps", "Launcher Apps"),
    ("control_navigation", "Control / Navigation"),
    ("data_display", "Data Display"),
    ("form_system", "Form System"),
    ("analytics_dashboard_settings", "Analytics / Dashboard / Settings"),
    ("floating_surfaces", "Floating Surfaces"),
]

COMPONENT_SELECTION = [
    ("navbar", "Navbar"),
    ("app_launcher", "App Launcher"),
    ("control_panel", "Control Panel"),
    ("search_bar", "Search Bar"),
    ("smart_buttons", "Smart Buttons"),
    ("form_sheet", "Form Sheet"),
    ("list_renderer", "List Renderer"),
    ("kanban_card", "Kanban Card"),
    ("dropdown_menu", "Dropdown Menu"),
    ("modal_dialog", "Modal Dialog"),
]

COMPONENT_FAMILY = {
    "navbar": "shell_global",
    "app_launcher": "launcher_apps",
    "control_panel": "control_navigation",
    "search_bar": "control_navigation",
    "smart_buttons": "form_system",
    "form_sheet": "form_system",
    "list_renderer": "data_display",
    "kanban_card": "data_display",
    "dropdown_menu": "floating_surfaces",
    "modal_dialog": "floating_surfaces",
}

FAMILY_SELECTORS = {
    "shell_global": ":root, .o_web_client",
    "launcher_apps": ".o_app_menu, .o_home_menu, .o_bao_apps_sidebar, .o_app",
    "control_navigation": ".o_control_panel, .o_searchview, .o_main_navbar",
    "data_display": ".o_list_renderer, .o_kanban_renderer, .o_kanban_view",
    "form_system": ".o_form_view, .o_form_sheet_bg, .o_form_sheet",
    "analytics_dashboard_settings": ".o_spreadsheet_dashboard_action, .o_graph_view, .o_pivot_view, .o_base_settings_view",
    "floating_surfaces": ".modal, .o_dialog, .dropdown-menu, .o-dropdown--menu, .o_popover",
}

COMPONENT_SELECTORS = {
    "navbar": ".o_main_navbar, .o_navbar",
    "app_launcher": ".o_app_menu, .o_home_menu, .o_bao_apps_sidebar",
    "control_panel": ".o_control_panel",
    "search_bar": ".o_searchview, .o_cp_searchview",
    "smart_buttons": ".o_form_view .oe_button_box, .o_form_view .oe_stat_button",
    "form_sheet": ".o_form_view .o_form_sheet, .o_form_view .o_form_sheet_bg",
    "list_renderer": ".o_list_renderer, .o_list_table",
    "kanban_card": ".o_kanban_record, .o_kanban_renderer .o_kanban_record",
    "dropdown_menu": ".dropdown-menu, .o-dropdown--menu",
    "modal_dialog": ".modal, .o_dialog",
}


class BaoThemeTokenMixin(models.AbstractModel):
    _name = "bao.theme.token.mixin"
    _description = "BAO Theme Token Mixin"

    color_primary = fields.Char(string="Primary Color")
    color_primary_dark = fields.Char(string="Primary Dark Color")
    color_primary_soft = fields.Char(string="Primary Soft Color")
    color_accent = fields.Char(string="Accent Color")
    color_accent_hover = fields.Char(string="Accent Hover Color")
    bg_app = fields.Char(string="App Background")
    surface_base = fields.Char(string="Base Surface")
    surface_muted = fields.Char(string="Muted Surface")
    surface_subtle = fields.Char(string="Subtle Surface")
    surface_raised = fields.Char(string="Raised Surface")
    border_subtle = fields.Char(string="Subtle Border")
    border_default = fields.Char(string="Default Border")
    border_selected = fields.Char(string="Selected Border")
    border_soft = fields.Char(string="Soft Border")
    border_strong = fields.Char(string="Strong Border")
    text_primary = fields.Char(string="Primary Text")
    text_heading = fields.Char(string="Heading Text")
    text_secondary = fields.Char(string="Secondary Text")
    text_muted = fields.Char(string="Muted Text")
    text_soft = fields.Char(string="Soft Text")
    text_disabled = fields.Char(string="Disabled Text")
    font_body = fields.Char(string="Body Font")
    font_display = fields.Char(string="Display Font")
    radius_sm = fields.Char(string="Small Radius")
    radius_md = fields.Char(string="Medium Radius")
    radius_lg = fields.Char(string="Large Radius")
    radius_xl = fields.Char(string="Extra Large Radius")
    radius_pill = fields.Char(string="Pill Radius")
    shadow_soft = fields.Char(string="Soft Shadow")
    shadow_panel = fields.Char(string="Panel Shadow")
    shadow_popover = fields.Char(string="Popover Shadow")
    shadow_medium = fields.Char(string="Medium Shadow")
    shadow_heavy = fields.Char(string="Heavy Shadow")

    @api.model
    def _bao_token_fields(self):
        return TOKEN_FIELDS

    @api.model
    def _bao_css_var_by_field(self):
        return CSS_VAR_BY_FIELD

    @api.constrains(*COLOR_TOKEN_FIELDS)
    def _check_color_token_syntax(self):
        for record in self:
            for field_name in COLOR_TOKEN_FIELDS:
                value = (record[field_name] or "").strip()
                if value and not self._is_valid_color_value(value):
                    label = record._fields[field_name].string
                    raise ValidationError(_("%s is not a valid CSS color value.") % label)

    @api.model
    def _is_valid_color_value(self, value):
        value = (value or "").strip()
        if re.match(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$", value):
            return True
        if re.match(r"^(?:rgb|rgba|hsl|hsla)\([^)]+\)$", value):
            return True
        return False

    def _read_token_values(self, skip_empty=True):
        self.ensure_one()
        values = {}
        for field_name in TOKEN_FIELDS:
            value = self[field_name]
            if value or not skip_empty:
                values[field_name] = value or ""
        return values


class BaoThemePreset(models.Model):
    _name = "bao.theme.preset"
    _inherit = "bao.theme.token.mixin"
    _description = "BAO Theme Preset"
    _order = "sequence, name"

    name = fields.Char(required=True)
    code = fields.Char(required=True, index=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)
    readonly_preset = fields.Boolean(default=False)

    _code_unique = models.Constraint(
        "unique(code)",
        "The BAO theme preset code must be unique.",
    )

    def write(self, vals):
        if any(preset.readonly_preset for preset in self):
            raise UserError(_("The default BAO preset is protected. Duplicate it before editing."))
        return super().write(vals)

    def unlink(self):
        if any(preset.readonly_preset for preset in self):
            raise UserError(_("The default BAO preset cannot be deleted."))
        return super().unlink()


class BaoThemeConfig(models.Model):
    _name = "bao.theme.config"
    _inherit = "bao.theme.token.mixin"
    _description = "BAO Theme Configuration"

    name = fields.Char(required=True, default="BAO Backend Theme")
    active = fields.Boolean(default=True)
    preset_id = fields.Many2one("bao.theme.preset", required=True, ondelete="restrict")
    family_override_ids = fields.One2many("bao.theme.family.override", "config_id")
    component_override_ids = fields.One2many("bao.theme.component.override", "config_id")

    @api.model
    def _get_active_config(self):
        config = self.env.ref("theme_liquid_glass_v2.bao_theme_config_default", raise_if_not_found=False)
        if config and config.exists():
            return config
        config = self.search([("active", "=", True)], limit=1)
        if config:
            return config
        preset = self.env.ref("theme_liquid_glass_v2.bao_theme_preset_default", raise_if_not_found=False)
        if not preset:
            preset = self.env["bao.theme.preset"].search([("code", "=", "bao_default")], limit=1)
        if not preset:
            raise UserError(_("The default BAO preset is missing. Update the theme module."))
        return self.create({"name": "BAO Backend Theme", "preset_id": preset.id, "active": True})

    @api.model
    def _component_family(self, component_key):
        return COMPONENT_FAMILY.get(component_key)

    def _overlay_tokens(self, resolved, source):
        for field_name, value in source._read_token_values(skip_empty=True).items():
            resolved[field_name] = value
        return resolved

    def _find_family_override(self, family_key):
        self.ensure_one()
        return self.family_override_ids.filtered(lambda item: item.family_key == family_key)[:1]

    def _find_component_override(self, component_key):
        self.ensure_one()
        return self.component_override_ids.filtered(lambda item: item.component_key == component_key)[:1]

    def resolve_token_fields(self, family_key=False, component_key=False):
        self.ensure_one()
        if component_key and component_key not in COMPONENT_FAMILY:
            raise UserError(_("Unknown BAO component key: %s") % component_key)
        if family_key and family_key not in dict(FAMILY_SELECTION):
            raise UserError(_("Unknown BAO family key: %s") % family_key)
        effective_family = family_key or (component_key and self._component_family(component_key))
        resolved = self.preset_id._read_token_values(skip_empty=False)
        self._overlay_tokens(resolved, self)
        if effective_family:
            family_override = self._find_family_override(effective_family)
            if family_override:
                self._overlay_tokens(resolved, family_override)
        if component_key:
            component_override = self._find_component_override(component_key)
            if component_override:
                self._overlay_tokens(resolved, component_override)
        return resolved

    def resolve_css_variables(self, family_key=False, component_key=False):
        self.ensure_one()
        resolved_fields = self.resolve_token_fields(family_key=family_key, component_key=component_key)
        mapping = self._bao_css_var_by_field()
        return {
            mapping[field_name]: value
            for field_name, value in resolved_fields.items()
            if field_name in mapping and value
        }

    @api.model
    def _sanitize_css_value(self, value):
        value = (value or "").strip()
        if not value or any(marker in value for marker in (";", "{", "}", "<", ">")):
            return ""
        return value

    @api.model
    def _render_css_rule(self, selector, variables):
        lines = []
        for name, value in sorted(variables.items()):
            safe_value = self._sanitize_css_value(value)
            if safe_value:
                lines.append(f"    {name}: {safe_value};")
        if not lines:
            return ""
        return "\n".join([f"{selector} {{", *lines, "}"])

    def render_runtime_css(self):
        self.ensure_one()
        rules = [
            "/* Generated by theme_liquid_glass_v2. Empty or invalid values inherit BAO SCSS fallbacks. */",
            self._render_css_rule(":root, .o_web_client", self.resolve_css_variables()),
        ]
        for family_key, selector in FAMILY_SELECTORS.items():
            override = self._find_family_override(family_key)
            if override:
                rules.append(self._render_css_rule(selector, self.resolve_css_variables(family_key=family_key)))
        for component_key, selector in COMPONENT_SELECTORS.items():
            override = self._find_component_override(component_key)
            if override:
                rules.append(self._render_css_rule(selector, self.resolve_css_variables(component_key=component_key)))
        return "\n\n".join(rule for rule in rules if rule) + "\n"

    def action_reset_global(self):
        self.write({field_name: False for field_name in TOKEN_FIELDS})
        return True

    def action_reset_all(self):
        self.action_reset_global()
        self.family_override_ids.unlink()
        self.component_override_ids.unlink()
        return True


class BaoThemeFamilyOverride(models.Model):
    _name = "bao.theme.family.override"
    _inherit = "bao.theme.token.mixin"
    _description = "BAO Theme Family Override"
    _order = "family_key"

    config_id = fields.Many2one("bao.theme.config", required=True, ondelete="cascade")
    family_key = fields.Selection(FAMILY_SELECTION, required=True)
    name = fields.Char(compute="_compute_name", store=True)

    _config_family_unique = models.Constraint(
        "unique(config_id, family_key)",
        "Only one override is allowed per BAO family.",
    )

    @api.depends("family_key")
    def _compute_name(self):
        labels = dict(FAMILY_SELECTION)
        for record in self:
            record.name = labels.get(record.family_key, record.family_key or "")

    def action_reset_family(self):
        self.write({field_name: False for field_name in TOKEN_FIELDS})
        return True


class BaoThemeComponentOverride(models.Model):
    _name = "bao.theme.component.override"
    _inherit = "bao.theme.token.mixin"
    _description = "BAO Theme Component Override"
    _order = "component_key"

    config_id = fields.Many2one("bao.theme.config", required=True, ondelete="cascade")
    component_key = fields.Selection(COMPONENT_SELECTION, required=True)
    family_key = fields.Selection(FAMILY_SELECTION, compute="_compute_family_key", store=True, readonly=True)
    name = fields.Char(compute="_compute_name", store=True)

    _config_component_unique = models.Constraint(
        "unique(config_id, component_key)",
        "Only one override is allowed per BAO component.",
    )

    @api.depends("component_key")
    def _compute_family_key(self):
        for record in self:
            record.family_key = COMPONENT_FAMILY.get(record.component_key)

    @api.depends("component_key")
    def _compute_name(self):
        labels = dict(COMPONENT_SELECTION)
        for record in self:
            record.name = labels.get(record.component_key, record.component_key or "")

    def action_reset_component(self):
        self.write({field_name: False for field_name in TOKEN_FIELDS})
        return True
