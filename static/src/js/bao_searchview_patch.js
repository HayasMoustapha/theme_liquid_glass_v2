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
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
