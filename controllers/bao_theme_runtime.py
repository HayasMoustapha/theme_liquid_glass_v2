# -*- coding: utf-8 -*-

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
