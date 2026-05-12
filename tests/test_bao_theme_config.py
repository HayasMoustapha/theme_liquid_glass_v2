# -*- coding: utf-8 -*-

from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestBaoThemeConfig(TransactionCase):

    def setUp(self):
        super().setUp()
        self.config = self.env["bao.theme.config"]._get_active_config()

    def test_resolve_uses_preset_without_overrides(self):
        values = self.config.resolve_css_variables()
        self.assertEqual(values["--bao-color-primary"], "#1357a0")
        self.assertEqual(values["--bao-surface-base"], "#ffffff")

    def test_resolution_order_preset_global_family_component(self):
        self.config.write({"color_primary": "#111111"})
        self.env["bao.theme.family.override"].create({
            "config_id": self.config.id,
            "family_key": "control_navigation",
            "color_primary": "#222222",
        })
        self.env["bao.theme.component.override"].create({
            "config_id": self.config.id,
            "component_key": "control_panel",
            "color_primary": "#333333",
        })
        self.assertEqual(
            self.config.resolve_css_variables(component_key="control_panel")["--bao-color-primary"],
            "#333333",
        )
        self.assertEqual(
            self.config.resolve_css_variables(family_key="control_navigation")["--bao-color-primary"],
            "#222222",
        )
        self.assertEqual(self.config.resolve_css_variables()["--bao-color-primary"], "#111111")

    def test_empty_override_inherits(self):
        self.config.write({"color_primary": "#111111"})
        self.env["bao.theme.family.override"].create({
            "config_id": self.config.id,
            "family_key": "control_navigation",
        })
        values = self.config.resolve_css_variables(family_key="control_navigation")
        self.assertEqual(values["--bao-color-primary"], "#111111")

    def test_invalid_color_is_rejected(self):
        with self.assertRaises(ValidationError):
            self.config.write({"color_primary": "not-a-color"})

    def test_unknown_component_is_rejected(self):
        with self.assertRaises(UserError):
            self.config.resolve_css_variables(component_key="unknown")

    def test_non_admin_cannot_write_configuration(self):
        user = self.env.ref("base.user_demo")
        if not user:
            self.skipTest("Demo user is unavailable.")
        with self.assertRaises(AccessError):
            self.config.with_user(user).write({"color_primary": "#111111"})

    def test_settings_bridge_updates_active_config(self):
        settings = self.env["res.config.settings"].create({
            "bao_color_primary": "#445566",
            "bao_surface_base": "#ffffff",
        })
        settings.execute()
        self.assertEqual(self.config.color_primary, "#445566")
        self.assertEqual(
            self.config.resolve_css_variables()["--bao-color-primary"],
            "#445566",
        )
