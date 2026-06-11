# -*- coding: utf-8 -*-
#############################################################################
from . import models
from . import controllers


def _seed_bao_default_config(env):
    """Seed the default BAO config's token fields from its preset, so the Settings UI
    shows the real BAO palette. The config ships with empty token fields (runtime
    resolution starts from the preset), but the colour widgets render an empty value
    as #000000 (black) — leaving users unable to see/edit the real colours. Runs on
    install/upgrade; runtime resolution is unchanged."""
    config = env.ref("theme_liquid_glass_v2.bao_theme_config_default", raise_if_not_found=False)
    if config and config.preset_id:
        config.write(config.preset_id._read_token_values(skip_empty=False))
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
