# -*- coding: utf-8 -*-
from odoo import api, fields, models


class BaoThemeModuleOverride(models.Model):
    _name = "bao.theme.module.override"
    _description = "BAO Theme — Module-Specific Color Override"
    _order = "sequence, id"

    sequence = fields.Integer(default=10)
    config_id = fields.Many2one(
        "bao.theme.config", required=True, ondelete="cascade",
    )
    module_id = fields.Many2one(
        "ir.module.module",
        string="Module",
        domain=[("state", "=", "installed")],
        required=True,
        ondelete="cascade",
    )
    module_name = fields.Char(related="module_id.name", store=True, readonly=True)
    active = fields.Boolean(default=True)

    color_primary = fields.Char(string="Primary Color")
    color_primary_dark = fields.Char(string="Primary Dark")
    color_accent = fields.Char(string="Accent Color")
    bg_app = fields.Char(string="Background")
    surface_base = fields.Char(string="Surface")
    text_primary = fields.Char(string="Text Color")

    def _to_css_vars(self):
        mapping = {
            "color_primary": "--bao-brand-600",
            "color_primary_dark": "--bao-brand-700",
            "color_accent": "--bao-accent-500",
            "bg_app": "--bao-bg-app",
            "surface_base": "--bao-surface-0",
            "text_primary": "--bao-text-primary",
        }
        lines = []
        for field_name, css_var in mapping.items():
            val = getattr(self, field_name)
            if val:
                lines.append(f"  {css_var}: {val};")
        return "\n".join(lines)

    @api.model
    def _generate_module_css(self):
        overrides = self.search([("active", "=", True)])
        blocks = []
        for ov in overrides:
            css_vars = ov._to_css_vars()
            if css_vars:
                blocks.append(
                    f'body.o_web_client[data-bao-module="{ov.module_name}"] {{\n{css_vars}\n}}'
                )
        return "\n\n".join(blocks)

    @api.model
    def _get_module_overrides_json(self):
        overrides = self.search([("active", "=", True)])
        result = {}
        for ov in overrides:
            mapping = {}
            for field_name, css_var in {
                "color_primary": "--bao-brand-600",
                "color_primary_dark": "--bao-brand-700",
                "color_accent": "--bao-accent-500",
                "bg_app": "--bao-bg-app",
                "surface_base": "--bao-surface-0",
                "text_primary": "--bao-text-primary",
            }.items():
                val = getattr(ov, field_name)
                if val:
                    mapping[css_var] = val
            if mapping:
                result[ov.module_name] = mapping
        return result
