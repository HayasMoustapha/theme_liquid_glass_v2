/** @odoo-module */
import { whenReady } from "@odoo/owl";

whenReady(() => {
    const observer = new MutationObserver(() => {
        // Searchbar: overflow-x auto + max-height 42px
        for (const sv of document.querySelectorAll(".o_searchview")) {
            if (sv.dataset.baoPatched) continue;
            sv.style.setProperty("max-height", "42px", "important");
            sv.style.setProperty("overflow-x", "auto", "important");
            sv.style.setProperty("overflow-y", "hidden", "important");
            sv.dataset.baoPatched = "1";
        }

        // Notebook tfoot buttons: text-align left
        for (const td of document.querySelectorAll("td.o_field_x2many_list_row_add")) {
            if (td.dataset.baoPatched) continue;
            td.style.setProperty("text-align", "left", "important");
            td.dataset.baoPatched = "1";
        }

        // Inner group grid: auto 1fr (desktop), 1fr (mobile)
        const isMobile = window.innerWidth <= 576;
        for (const ig of document.querySelectorAll(".o_form_sheet .o_inner_group:not(.oe_subtotal_footer)")) {
            if (ig.dataset.baoGrid && ig.dataset.baoMobile === String(isMobile)) continue;
            ig.style.setProperty("grid-template-columns", isMobile ? "1fr" : "auto 1fr", "important");
            ig.dataset.baoGrid = "1";
            ig.dataset.baoMobile = String(isMobile);
        }

        // ALL o_cell children must be 100% width
        for (const cell of document.querySelectorAll(".o_form_sheet .o_cell:not(.o_wrap_label), .o_form_sheet .o_cell_custom:not(.o_wrap_label)")) {
            if (cell.dataset.baoCellDone) continue;
            cell.style.setProperty("display", "flex", "important");
            cell.style.setProperty("flex-flow", "column wrap", "important");
            for (const ch of cell.children) {
                ch.style.setProperty("width", "100%", "important");
                ch.style.setProperty("max-width", "100%", "important");
            }
            // Also inputs and buttons inside
            for (const inp of cell.querySelectorAll("input, button, select, .o-autocomplete, .o-autocomplete--input, .o_input, .o_field_widget, .o_field_float")) {
                inp.style.setProperty("width", "100%", "important");
                inp.style.setProperty("max-width", "100%", "important");
            }
            cell.dataset.baoCellDone = "1";
        }

        // x2many list tables: full width
        for (const table of document.querySelectorAll(".o_notebook_content .o_list_renderer, .o_notebook_content .o_field_x2many")) {
            if (table.dataset.baoWidth) continue;
            table.style.setProperty("width", "100%", "important");
            table.dataset.baoWidth = "1";
        }

        // App launcher styling
        for (const launcher of document.querySelectorAll(".o_enterprise_app_launcher")) {
            if (launcher.dataset.baoLauncher) continue;
            launcher.style.setProperty("position", "fixed", "important");
            launcher.style.setProperty("inset", "0", "important");
            launcher.style.setProperty("z-index", "10000", "important");
            launcher.style.setProperty("overflow", "auto", "important");
            launcher.style.setProperty("background", "linear-gradient(135deg, #f1f1f1, #e5e5e5, #f1f1f1)", "important");
            launcher.style.setProperty("color", "#303030", "important");
            launcher.style.setProperty("padding", "40px", "important");

            const navbar = document.querySelector(".o_main_navbar");
            if (navbar) {
                navbar.style.setProperty("opacity", "0", "important");
                navbar.style.setProperty("pointer-events", "none", "important");
            }

            // Close button
            const closeBtn = launcher.querySelector(".o_enterprise_app_launcher_close");
            if (closeBtn) {
                closeBtn.style.setProperty("position", "absolute", "important");
                closeBtn.style.setProperty("top", "16px", "important");
                closeBtn.style.setProperty("left", "16px", "important");
                closeBtn.style.setProperty("width", "40px", "important");
                closeBtn.style.setProperty("height", "40px", "important");
                closeBtn.style.setProperty("display", "flex", "important");
                closeBtn.style.setProperty("align-items", "center", "important");
                closeBtn.style.setProperty("justify-content", "center", "important");
                closeBtn.style.setProperty("border", "none", "important");
                closeBtn.style.setProperty("background", "rgba(0,0,0,0.06)", "important");
                closeBtn.style.setProperty("border-radius", "10px", "important");
                closeBtn.style.setProperty("cursor", "pointer", "important");
                closeBtn.style.setProperty("font-size", "1.2rem", "important");
                closeBtn.style.setProperty("color", "#303030", "important");
            }

            // Grid
            const grid = launcher.querySelector(".o_enterprise_app_launcher_grid");
            if (grid) {
                grid.style.setProperty("display", "grid", "important");
                grid.style.setProperty("grid-template-columns", "repeat(6, 120px)", "important");
                grid.style.setProperty("justify-content", "center", "important");
                grid.style.setProperty("align-content", "start", "important");
                grid.style.setProperty("gap", "24px 16px", "important");
                grid.style.setProperty("max-width", "860px", "important");
                grid.style.setProperty("margin", "0 auto", "important");
                grid.style.setProperty("padding", "60px 24px 48px", "important");
            }

            // Items
            for (const item of launcher.querySelectorAll(".o_enterprise_app_launcher_item")) {
                item.style.setProperty("color", "#303030", "important");
                item.style.setProperty("font-size", "0.78rem", "important");
                item.style.setProperty("text-align", "center", "important");
            }

            // Icons
            for (const icon of launcher.querySelectorAll(".o_enterprise_app_launcher_icon")) {
                icon.style.setProperty("display", "inline-flex", "important");
                icon.style.setProperty("align-items", "center", "important");
                icon.style.setProperty("justify-content", "center", "important");
                icon.style.setProperty("width", "80px", "important");
                icon.style.setProperty("height", "80px", "important");
                icon.style.setProperty("border-radius", "16px", "important");
                icon.style.setProperty("background", "#ffffff", "important");
                icon.style.setProperty("box-shadow", "0 2px 12px rgba(15,23,42,0.08)", "important");
            }

            for (const img of launcher.querySelectorAll(".o_app_icon, .o_enterprise_app_launcher_icon img")) {
                img.style.setProperty("width", "64px", "important");
                img.style.setProperty("height", "64px", "important");
                img.style.setProperty("border-radius", "14px", "important");
            }

            launcher.dataset.baoLauncher = "1";
        }

        // Restore navbar when launcher closes
        if (!document.querySelector(".o_enterprise_app_launcher")) {
            const navbar = document.querySelector(".o_main_navbar");
            if (navbar && navbar.style.opacity === "0") {
                navbar.style.removeProperty("opacity");
                navbar.style.removeProperty("pointer-events");
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Module-specific theme overrides — apply CSS vars based on current URL
    let _moduleOverrides = null;
    let _lastAppliedModule = null;

    async function loadModuleOverrides() {
        try {
            const resp = await fetch("/bao/theme/module-overrides.json");
            _moduleOverrides = await resp.json();
        } catch (e) {
            _moduleOverrides = {};
        }
    }

    function detectCurrentModule() {
        const url = window.location.pathname;
        const moduleMap = {
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
        for (const [path, mod] of Object.entries(moduleMap)) {
            if (url.startsWith(path)) return mod;
        }
        return null;
    }

    function applyModuleOverrides() {
        if (!_moduleOverrides) return;
        const mod = detectCurrentModule();
        if (mod === _lastAppliedModule) return;
        _lastAppliedModule = mod;
        const root = document.documentElement;
        // Reset all module vars
        for (const vars of Object.values(_moduleOverrides)) {
            for (const cssVar of Object.keys(vars)) {
                root.style.removeProperty(cssVar);
            }
        }
        // Apply current module vars
        if (mod && _moduleOverrides[mod]) {
            for (const [cssVar, val] of Object.entries(_moduleOverrides[mod])) {
                root.style.setProperty(cssVar, val);
            }
        }
    }

    loadModuleOverrides();
    const urlObserver = new MutationObserver(applyModuleOverrides);
    urlObserver.observe(document.querySelector("title") || document.head, { childList: true, subtree: true, characterData: true });
    setInterval(applyModuleOverrides, 2000);
});
