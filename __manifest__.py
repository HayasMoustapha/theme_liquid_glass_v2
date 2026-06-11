# -*- coding: utf-8 -*-
#############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2026-TODAY Cybrosys Technologies(<https://www.cybrosys.com>)
#    Author: Cybrosys Techno Solutions(<https://www.cybrosys.com>)
#
#    You can modify it under the terms of the GNU LESSER
#    GENERAL PUBLIC LICENSE (LGPL v3), Version 3.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU LESSER GENERAL PUBLIC LICENSE (LGPL v3) for more details.
#
#    You should have received a copy of the GNU LESSER GENERAL PUBLIC LICENSE
#    (LGPL v3) along with this program.
#    If not, see <http://www.gnu.org/licenses/>.
#
#############################################################################
{
    'name': 'BAO Backend Theme',
    'version': '19.0.1.0.1',
    'category': 'Theme/Backend',
    'summary': 'Configurable BAO backend theme for Odoo',
    'description': """
        BAO Backend Theme
        A configurable Odoo backend theme based on Liquid Glass Backend Theme V2.
    """,
    'author': 'Cybrosys Techno Solutions',
    'website': 'https://www.cybrosys.com',
    'license': 'LGPL-3',
    'depends': ['web', 'base'],
    'data': [
        'security/ir.model.access.csv',
        'data/module_visibility.xml',
        'data/bao_theme_preset.xml',
        'views/bao_theme_config_views.xml',
        'views/res_config_settings_views.xml',
        'views/bao_theme_module_override_views.xml',
        'data/theme_app_menu.xml',
        'views/runtime_templates.xml',
    ],
    'assets': {
        # BAO palette is applied the sanctioned Odoo way: by overriding $o-*
        # design tokens in the variable bundles, so Bootstrap/Odoo derive the
        # look automatically (no per-selector !important warfare).
        'web._assets_primary_variables': [
            'theme_liquid_glass_v2/static/src/scss/primary_variables.scss',
        ],
        'web._assets_secondary_variables': [
            'theme_liquid_glass_v2/static/src/scss/secondary_variables.scss',
        ],
        'web.assets_backend': [
            'theme_liquid_glass_v2/static/src/scss/fonts.scss',
            # Centralised BAO token layer ($bao-*-default constants + $bao-*
            # working vars = var(--bao-*, default)); must precede the cosmetic
            # layer so its SCSS vars are in scope there.
            'theme_liquid_glass_v2/static/src/scss/bao_variables.scss',
            # backend_cosmetic paints the live --bao-* config vars onto native
            # classes (loaded last → wins via .o_web_client specificity).
            'theme_liquid_glass_v2/static/src/scss/backend_cosmetic.scss',
        ],
        'web.assets_backend_lazy': [
            'theme_liquid_glass_v2/static/src/js/canvas_text.js',
        ],
    },
    'images': [
        'static/description/banner.jpg',
        'static/description/theme_screenshot.jpg',
        'static/description/icon.png'
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
