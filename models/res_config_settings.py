# -*- coding: utf-8 -*-

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    bao_theme_config_id = fields.Many2one(
        "bao.theme.config",
        string="BAO Theme Configuration",
        default=lambda self: self.env["bao.theme.config"]._get_active_config(),
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
