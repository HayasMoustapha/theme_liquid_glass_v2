/** @odoo-module */
// BAO module-specific colour overrides (non-invasive).
//
// The `bao.theme.module.override` model lets an admin set per-module colours in
// Settings > BAO Backend Theme. The backend exposes them at
// /bao/theme/module-overrides.json (module technical name -> { --bao-var: value }).
// This tiny service applies the CURRENT module's vars onto :root as the user
// navigates, and clears them when leaving — so a whole module can be recoloured
// without touching any other scope.
//
// It ONLY writes CSS custom properties on document.documentElement (no DOM surgery,
// no per-selector overrides) — it stays a pure cosmetic skin.
//
// RESTORED 2026-06-16: the original consumer lived in bao_searchview_patch.js, which
// was dropped in the RR88 cosmetic-skin refonte. That silently killed module-scoped
// colour config (the backend + runtime.css `body[data-bao-module]` rules remained, but
// nothing applied them). This is the minimal, non-invasive replacement.

import { registry } from "@web/core/registry";

// Fallback URL-slug -> module map for cases where the menu service can't resolve the
// current app (e.g. very early, or a non-app route). The menu service xmlid is the
// primary, robust source and covers any installed module.
const URL_MODULE_MAP = {
    "/odoo/purchase": "purchase",
    "/odoo/sales": "sale",
    "/odoo/inventory": "stock",
    "/odoo/manufacturing": "mrp",
    "/odoo/crm": "crm",
    "/odoo/contacts": "contacts",
    "/odoo/employees": "hr",
    "/odoo/accounting": "account",
    "/odoo/point-of-sale": "point_of_sale",
    "/odoo/calendar": "calendar",
    "/odoo/discuss": "mail",
    "/odoo/surveys": "survey",
    "/odoo/email-marketing": "mass_mailing",
    "/odoo/settings": "base_setup",
};

const baoModuleOverridesService = {
    dependencies: ["menu"],
    async start(env, { menu }) {
        let overrides = {};
        try {
            const resp = await fetch("/bao/theme/module-overrides.json");
            overrides = (await resp.json()) || {};
        } catch (e) {
            overrides = {};
        }

        // runtime.css defines the vars on BOTH ":root" and ".o_web_client". Backend UI
        // (navbar, control panel, …) lives INSIDE .o_web_client, so it resolves each var
        // from the nearest ancestor that defines it = .o_web_client. We must therefore set
        // the per-module override on .o_web_client (and html) so it actually wins, not only
        // on html (which the closer .o_web_client definition would shadow).
        const targets = () => {
            const els = [document.documentElement];
            const wc = document.querySelector(".o_web_client");
            if (wc) {
                els.push(wc);
            }
            return els;
        };
        let lastModule = null;

        const currentModule = () => {
            try {
                const app = menu.getCurrentApp();
                if (app && app.xmlid) {
                    // xmlid like "purchase.menu_purchase_root" -> "purchase"
                    return app.xmlid.split(".")[0];
                }
            } catch (e) {
                // fall through to the URL map
            }
            const path = window.location.pathname;
            for (const [prefix, mod] of Object.entries(URL_MODULE_MAP)) {
                if (path.startsWith(prefix)) {
                    return mod;
                }
            }
            return null;
        };

        const apply = () => {
            const mod = currentModule();
            if (mod === lastModule) {
                return;
            }
            lastModule = mod;
            const els = targets();
            // clear every module's vars, then apply the current module's set
            for (const el of els) {
                for (const vars of Object.values(overrides)) {
                    for (const cssVar of Object.keys(vars)) {
                        el.style.removeProperty(cssVar);
                    }
                }
                if (mod && overrides[mod]) {
                    for (const [cssVar, value] of Object.entries(overrides[mod])) {
                        el.style.setProperty(cssVar, value);
                    }
                }
            }
        };

        apply();
        // The menu service exposes no "current app changed" event, so react to the page
        // <title> changing (Odoo updates it per action) plus a low-frequency safety poll.
        const target = document.querySelector("title") || document.head;
        const observer = new MutationObserver(apply);
        observer.observe(target, { childList: true, subtree: true, characterData: true });
        setInterval(apply, 1500);
    },
};

// force:true so a duplicate registration (e.g. a leftover ir.asset alongside the manifest
// entry during a transition) overwrites instead of throwing and breaking the page.
registry.category("services").add("bao_module_overrides", baoModuleOverridesService, { force: true });
