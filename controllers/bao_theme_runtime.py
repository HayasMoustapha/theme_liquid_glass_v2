# -*- coding: utf-8 -*-

import json

from odoo import http
from odoo.http import request, Response


class BaoThemeRuntimeController(http.Controller):

    @http.route("/bao/theme/runtime.css", type="http", auth="user", readonly=True)
    def bao_theme_runtime_css(self, **kwargs):
        config = request.env["bao.theme.config"].sudo()._get_active_config()
        css = config.render_runtime_css()
        return Response(
            css,
            content_type="text/css; charset=utf-8",
            headers=[("Cache-Control", "no-store, max-age=0")],
        )

    @http.route("/bao/theme/module-overrides.json", type="http", auth="user", readonly=True)
    def bao_theme_module_overrides(self, **kwargs):
        overrides = request.env["bao.theme.module.override"].sudo()._get_module_overrides_json()
        return Response(
            json.dumps(overrides),
            content_type="application/json; charset=utf-8",
            headers=[("Cache-Control", "no-store, max-age=0")],
        )
