# -*- coding: utf-8 -*-

from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests import TransactionCase, tagged
from odoo.tools.safe_eval import safe_eval


@tagged("post_install", "-at_install")
class TestBaoThemeConfig(TransactionCase):

    def setUp(self):
        super().setUp()
        self.config = self.env["bao.theme.config"]._get_active_config()

    def _non_system_user(self):
        user = self.env.ref("base.user_demo", raise_if_not_found=False)
        if user:
            return user
        return self.env.ref("base.public_user")

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
        user = self._non_system_user()
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

    def test_settings_defaults_active_theme_config(self):
        values = self.env["res.config.settings"].default_get(["bao_theme_config_id"])
        self.assertEqual(values["bao_theme_config_id"], self.config.id)

    def test_family_runtime_css_uses_family_selector(self):
        self.env["bao.theme.family.override"].create({
            "config_id": self.config.id,
            "family_key": "control_navigation",
            "color_primary": "#224466",
        })
        css = self.config.render_runtime_css()
        self.assertIn(".o_control_panel", css)
        self.assertIn("--bao-color-primary: #224466;", css)

    def test_css_renderer_drops_unsafe_values(self):
        self.config.write({"font_body": "Arial; body { display: none }"})
        css = self.config.render_runtime_css()
        self.assertNotIn("display: none", css)

    def test_component_runtime_css_uses_component_selector(self):
        self.env["bao.theme.component.override"].create({
            "config_id": self.config.id,
            "component_key": "modal_dialog",
            "surface_base": "#eeeeee",
        })
        css = self.config.render_runtime_css()
        self.assertIn(".o_dialog", css)
        self.assertIn("--bao-surface-base: #eeeeee;", css)

    def test_component_inherits_family_before_component_override(self):
        self.env["bao.theme.family.override"].create({
            "config_id": self.config.id,
            "family_key": "floating_surfaces",
            "surface_base": "#dddddd",
        })
        self.env["bao.theme.component.override"].create({
            "config_id": self.config.id,
            "component_key": "modal_dialog",
            "surface_base": "#eeeeee",
        })
        values = self.config.resolve_css_variables(component_key="modal_dialog")
        self.assertEqual(values["--bao-surface-base"], "#eeeeee")

    def test_reset_all_restores_preset_chain(self):
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
        self.config.action_reset_all()
        self.assertFalse(self.config.family_override_ids)
        self.assertFalse(self.config.component_override_ids)
        self.assertEqual(self.config.resolve_css_variables()["--bao-color-primary"], "#1357a0")

    def test_contrast_warning_detects_low_contrast_pair(self):
        self.config.write({
            "text_primary": "#ffffff",
            "surface_base": "#ffffff",
        })
        warnings = self.config.get_contrast_warnings()
        self.assertTrue(any("Primary text on base surface" in warning for warning in warnings))

    def test_contrast_warning_supports_short_hex_and_rgb_colors(self):
        self.config.write({
            "text_primary": "#fff",
            "surface_base": "rgb(255, 255, 255)",
        })
        warnings = self.config.get_contrast_warnings()
        self.assertTrue(any("Primary text on base surface" in warning for warning in warnings))

    def test_settings_preview_recomputes_for_all_exposed_fields(self):
        settings = self.env["res.config.settings"].create({})
        self.assertIn("--bao-surface-raised: #e5e5e5;", settings.bao_preview_css)
        settings.bao_surface_raised = "#abcdef"
        self.assertIn("--bao-surface-raised: #abcdef;", settings.bao_preview_css)

    def test_settings_reset_actions_restore_bao_tokens(self):
        settings = self.env["res.config.settings"].create({})
        settings.bao_color_primary = "#112233"
        self.assertIn("--bao-color-primary: #112233;", settings.bao_preview_css)
        settings.action_reset_bao_theme_global()
        self.assertEqual(self.config.resolve_css_variables()["--bao-color-primary"], "#1357a0")

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
        settings.action_reset_bao_theme_all()
        self.assertFalse(self.config.family_override_ids)
        self.assertFalse(self.config.component_override_ids)

    def test_non_admin_cannot_use_settings_reset_actions(self):
        user = self._non_system_user()
        settings = self.env["res.config.settings"].create({})
        with self.assertRaises(AccessError):
            settings.with_user(user).action_reset_bao_theme_global()
        with self.assertRaises(AccessError):
            settings.with_user(user).action_reset_bao_theme_all()

    def test_apps_action_keeps_backend_theme_visible(self):
        action = self.env.ref("base.open_module_tree")
        domain = safe_eval(action.domain or "[]")
        module = self.env["ir.module.module"].search(
            domain + [("name", "=", "theme_liquid_glass_v2")]
        )
        self.assertEqual(module.name, "theme_liquid_glass_v2")
        self.assertEqual(module.shortdesc, "BAO Backend Theme")

        hidden_theme = self.env["ir.module.module"].search([
            ("name", "=like", "theme_%"),
            ("name", "!=", "theme_liquid_glass_v2"),
        ], limit=1)
        if hidden_theme:
            self.assertFalse(
                self.env["ir.module.module"].search(domain + [("id", "=", hidden_theme.id)])
            )

