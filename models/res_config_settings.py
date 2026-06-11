# -*- coding: utf-8 -*-

from odoo import api, fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    bao_theme_config_id = fields.Many2one(
        "bao.theme.config",
        string="BAO Theme Configuration",
        groups="base.group_system",
    )
    bao_color_primary = fields.Char(
        related="bao_theme_config_id.color_primary",
        readonly=False,
        groups="base.group_system",
    )
    bao_color_primary_dark = fields.Char(
        related="bao_theme_config_id.color_primary_dark",
        readonly=False,
        groups="base.group_system",
    )
    bao_color_accent = fields.Char(
        related="bao_theme_config_id.color_accent",
        readonly=False,
        groups="base.group_system",
    )
    bao_bg_app = fields.Char(
        related="bao_theme_config_id.bg_app",
        readonly=False,
        groups="base.group_system",
    )
    bao_surface_base = fields.Char(
        related="bao_theme_config_id.surface_base",
        readonly=False,
        groups="base.group_system",
    )
    bao_surface_raised = fields.Char(
        related="bao_theme_config_id.surface_raised",
        readonly=False,
        groups="base.group_system",
    )
    bao_border_default = fields.Char(
        related="bao_theme_config_id.border_default",
        readonly=False,
        groups="base.group_system",
    )
    bao_text_primary = fields.Char(
        related="bao_theme_config_id.text_primary",
        readonly=False,
        groups="base.group_system",
    )
    bao_text_secondary = fields.Char(
        related="bao_theme_config_id.text_secondary",
        readonly=False,
        groups="base.group_system",
    )
    bao_text_muted = fields.Char(
        related="bao_theme_config_id.text_muted",
        readonly=False,
        groups="base.group_system",
    )
    bao_font_body = fields.Char(
        related="bao_theme_config_id.font_body",
        readonly=False,
        groups="base.group_system",
    )
    bao_font_display = fields.Char(
        related="bao_theme_config_id.font_display",
        readonly=False,
        groups="base.group_system",
    )
    bao_radius_md = fields.Char(
        related="bao_theme_config_id.radius_md",
        readonly=False,
        groups="base.group_system",
    )
    bao_shadow_panel = fields.Char(
        related="bao_theme_config_id.shadow_panel",
        readonly=False,
        groups="base.group_system",
    )
    # Semantic / BAO-specific tokens (P18) — configurable status colours, tiles, font.
    bao_success_solid = fields.Char(related="bao_theme_config_id.success_solid", readonly=False, groups="base.group_system")
    bao_success_bg = fields.Char(related="bao_theme_config_id.success_bg", readonly=False, groups="base.group_system")
    bao_success_text = fields.Char(related="bao_theme_config_id.success_text", readonly=False, groups="base.group_system")
    bao_danger_600 = fields.Char(related="bao_theme_config_id.danger_600", readonly=False, groups="base.group_system")
    bao_warning_tile = fields.Char(related="bao_theme_config_id.warning_tile", readonly=False, groups="base.group_system")
    bao_danger_tile = fields.Char(related="bao_theme_config_id.danger_tile", readonly=False, groups="base.group_system")
    bao_success_tile = fields.Char(related="bao_theme_config_id.success_tile", readonly=False, groups="base.group_system")
    bao_neutral_chip = fields.Char(related="bao_theme_config_id.neutral_chip", readonly=False, groups="base.group_system")
    bao_neutral_soft = fields.Char(related="bao_theme_config_id.neutral_soft", readonly=False, groups="base.group_system")
    bao_text_muted_strong = fields.Char(related="bao_theme_config_id.text_muted_strong", readonly=False, groups="base.group_system")
    bao_help_badge_bg = fields.Char(related="bao_theme_config_id.help_badge_bg", readonly=False, groups="base.group_system")
    bao_notebook_chip_bg = fields.Char(related="bao_theme_config_id.notebook_chip_bg", readonly=False, groups="base.group_system")
    bao_font_title = fields.Char(related="bao_theme_config_id.font_title", readonly=False, groups="base.group_system")
    bao_module_override_ids = fields.One2many(
        related="bao_theme_config_id.module_override_ids",
        readonly=False,
        groups="base.group_system",
    )
    bao_preview_css = fields.Text(
        string="Computed Token Preview",
        compute="_compute_bao_preview",
        groups="base.group_system",
    )
    bao_contrast_warnings = fields.Text(
        string="Contrast Warnings",
        compute="_compute_bao_preview",
        groups="base.group_system",
    )

    @api.depends(
        "bao_theme_config_id",
        "bao_color_primary",
        "bao_color_primary_dark",
        "bao_color_accent",
        "bao_bg_app",
        "bao_surface_base",
        "bao_surface_raised",
        "bao_border_default",
        "bao_text_primary",
        "bao_text_secondary",
        "bao_text_muted",
        "bao_font_body",
        "bao_font_display",
        "bao_radius_md",
        "bao_shadow_panel",
    )
    def _compute_bao_preview(self):
        for settings in self:
            config = settings.bao_theme_config_id or self.env["bao.theme.config"]._get_active_config()
            variables = config.resolve_css_variables()
            settings.bao_preview_css = "\n".join(
                f"{name}: {value};"
                for name, value in sorted(variables.items())
            )
            warnings = config.get_contrast_warnings()
            settings.bao_contrast_warnings = "\n".join(warnings) if warnings else "No contrast warning."

    @api.model
    def get_values(self):
        values = super().get_values()
        values["bao_theme_config_id"] = self.env["bao.theme.config"]._get_active_config().id
        return values

    def action_open_bao_family_overrides(self):
        config = self.bao_theme_config_id or self.env["bao.theme.config"]._get_active_config()
        return {
            "type": "ir.actions.act_window",
            "name": "BAO Family Overrides",
            "res_model": "bao.theme.family.override",
            "view_mode": "list,form",
            "domain": [("config_id", "=", config.id)],
            "context": {"default_config_id": config.id},
            "target": "current",
        }

    def action_open_bao_component_overrides(self):
        config = self.bao_theme_config_id or self.env["bao.theme.config"]._get_active_config()
        return {
            "type": "ir.actions.act_window",
            "name": "BAO Component Overrides",
            "res_model": "bao.theme.component.override",
            "view_mode": "list,form",
            "domain": [("config_id", "=", config.id)],
            "context": {"default_config_id": config.id},
            "target": "current",
            "help": "<p class='o_view_nocontent_smiling_face'>Create a component color override</p>"
                    "<p>Override colors for specific UI components. "
                    "Empty fields inherit from the family or global theme.</p>",
        }

    def action_open_bao_module_overrides(self):
        config = self.bao_theme_config_id or self.env["bao.theme.config"]._get_active_config()
        return {
            "type": "ir.actions.act_window",
            "name": "BAO Module Overrides",
            "res_model": "bao.theme.module.override",
            "view_mode": "list,form",
            "domain": [("config_id", "=", config.id)],
            "context": {"default_config_id": config.id},
            "target": "current",
            "help": "<p class='o_view_nocontent_smiling_face'>Create a module color override</p>"
                    "<p>Configure specific colors for individual Odoo modules. "
                    "Empty color fields inherit the global BAO theme values.</p>",
        }

    def action_reset_bao_theme_global(self):
        config = self.bao_theme_config_id or self.env["bao.theme.config"]._get_active_config()
        config.action_reset_global()
        return {"type": "ir.actions.client", "tag": "reload"}

    def action_reset_bao_theme_all(self):
        config = self.bao_theme_config_id or self.env["bao.theme.config"]._get_active_config()
        config.action_reset_all()
        return {"type": "ir.actions.client", "tag": "reload"}
