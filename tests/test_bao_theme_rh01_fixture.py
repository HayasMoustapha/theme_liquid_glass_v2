# -*- coding: utf-8 -*-

from lxml import etree

from odoo.exceptions import AccessError
from odoo.tests import TransactionCase, new_test_user, tagged


@tagged("post_install", "-at_install")
class TestBaoThemeRh01Fixture(TransactionCase):

    def test_rh01_action_targets_default_config(self):
        action = self.env.ref("theme_liquid_glass_v2.action_bao_theme_rh01_fixture")
        default_config = self.env.ref("theme_liquid_glass_v2.bao_theme_config_default")
        action_result = action.run()

        self.assertEqual(action._name, "ir.actions.server")
        self.assertEqual(action.state, "code")
        self.assertEqual(action.model_id.model, "bao.theme.config")
        self.assertIn(self.env.ref("base.group_system"), action.group_ids)
        self.assertEqual(action_result["type"], "ir.actions.act_window")
        self.assertEqual(action_result["res_model"], "bao.theme.config")
        self.assertEqual(action_result["res_id"], default_config.id)
        self.assertEqual(action_result["target"], "current")
        self.assertIn("form", action_result["view_mode"])
        self.assertIn("list", action_result["view_mode"])

    def test_rh01_action_has_explicit_form_and_list_views(self):
        action = self.env.ref("theme_liquid_glass_v2.action_bao_theme_rh01_fixture")
        action_result = action.run()
        view_modes = [view_mode for _view_id, view_mode in action_result["views"]]

        self.assertEqual(view_modes, ["form", "list"])
        self.assertEqual(
            action_result["views"][0][0],
            self.env.ref("theme_liquid_glass_v2.bao_theme_rh01_fixture_view_form").id,
        )
        self.assertEqual(
            action_result["views"][1][0],
            self.env.ref("theme_liquid_glass_v2.bao_theme_rh01_fixture_view_list").id,
        )

    def test_rh01_action_refuses_direct_non_admin_execution(self):
        action = self.env.ref("theme_liquid_glass_v2.action_bao_theme_rh01_fixture")
        internal_user = new_test_user(
            self.env,
            login="bao_rh01_internal_user",
            groups="base.group_user",
        )

        with self.assertRaises(AccessError):
            action.with_user(internal_user).run()

    def test_rh01_form_has_required_stress_surfaces(self):
        view = self.env.ref("theme_liquid_glass_v2.bao_theme_rh01_fixture_view_form")
        arch = etree.fromstring(view.arch_db.encode())

        self.assertGreaterEqual(len(arch.xpath("//notebook/page")), 8)
        self.assertGreaterEqual(
            len(arch.xpath("//button[contains(concat(' ', normalize-space(@class), ' '), ' oe_stat_button ')]")),
            6,
        )
        self.assertFalse(arch.xpath("//button[@type='object']"))
        self.assertTrue(arch.xpath("//field[@name='family_override_ids']"))
        self.assertTrue(arch.xpath("//field[@name='component_override_ids']"))

    def test_rh01_list_has_required_dense_columns(self):
        view = self.env.ref("theme_liquid_glass_v2.bao_theme_rh01_fixture_view_list")
        arch = etree.fromstring(view.arch_db.encode())
        field_names = arch.xpath("//field/@name")

        self.assertGreaterEqual(len(field_names), 10)
        for field_name in (
            "name",
            "color_primary",
            "color_accent",
            "surface_base",
            "surface_raised",
            "text_primary",
            "font_body",
            "shadow_panel",
        ):
            self.assertIn(field_name, field_names)

    def test_rh01_menu_opens_fixture_action(self):
        menu = self.env.ref("theme_liquid_glass_v2.menu_bao_theme_rh01_fixture")
        action = self.env.ref("theme_liquid_glass_v2.action_bao_theme_rh01_fixture")

        self.assertEqual(menu.action, action)
        self.assertIn(self.env.ref("base.group_system"), menu.group_ids)
