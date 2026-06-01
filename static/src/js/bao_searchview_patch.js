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

        // Inner group grid: auto 1fr
        for (const ig of document.querySelectorAll(".o_form_sheet .o_inner_group:not(.oe_subtotal_footer)")) {
            if (ig.dataset.baoGrid) continue;
            ig.style.setProperty("grid-template-columns", "auto 1fr", "important");
            ig.dataset.baoGrid = "1";
        }

        // x2many list tables: full width
        for (const table of document.querySelectorAll(".o_notebook_content .o_list_renderer")) {
            if (table.dataset.baoWidth) continue;
            table.style.setProperty("width", "100%", "important");
            table.dataset.baoWidth = "1";
        }

        // App launcher: Enterprise-style fullscreen
        for (const launcher of document.querySelectorAll(".o_enterprise_app_launcher")) {
            if (launcher.dataset.baoLauncher) continue;
            launcher.style.setProperty("position", "fixed", "important");
            launcher.style.setProperty("inset", "0", "important");
            launcher.style.setProperty("z-index", "10000", "important");
            launcher.style.setProperty("overflow", "auto", "important");
            launcher.style.setProperty("background", "linear-gradient(135deg, #f1f1f1, #e5e5e5, #f1f1f1)", "important");
            launcher.style.setProperty("color", "#303030", "important");
            launcher.style.setProperty("padding", "40px", "important");

            // Hide navbar
            const navbar = document.querySelector(".o_main_navbar");
            if (navbar) {
                navbar.style.setProperty("opacity", "0", "important");
                navbar.style.setProperty("pointer-events", "none", "important");
            }

            // Style the grid
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

            // Style each app item
            for (const item of launcher.querySelectorAll(".o_enterprise_app_launcher_item")) {
                item.style.setProperty("color", "#303030", "important");
                item.style.setProperty("font-size", "0.78rem", "important");
                item.style.setProperty("text-align", "center", "important");
            }

            // Style icons
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
});
