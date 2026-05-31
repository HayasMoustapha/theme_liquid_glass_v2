/** @odoo-module **/

import { FormRenderer } from "@web/views/form/form_renderer";
import { patch } from "@web/core/utils/patch";
import { onMounted, onPatched, useRef } from "@odoo/owl";

/**
 * RR67: Wrap each consecutive label+field pair in .o_inner_group
 * into a <div class="o_bao_field_pair"> sub-grid container.
 * Each pair becomes its own grid [label | value], so label and value
 * are always tight regardless of other pairs in the same column.
 */
patch(FormRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        const rootRef = useRef("compiled_view_root");
        const wrapPairs = () => {
            const root = rootRef.el;
            if (!root) return;
            const groups = root.querySelectorAll('.o_inner_group');
            for (const group of groups) {
                if (group.dataset.baoPaired) continue;
                group.dataset.baoPaired = '1';
                const children = Array.from(group.children);
                let i = 0;
                while (i < children.length) {
                    const child = children[i];
                    if (child.classList.contains('o_wrap_label') && !child.closest('.o_bao_field_pair')) {
                        const next = child.nextElementSibling;
                        if (next && !next.classList.contains('o_wrap_label')) {
                            const pair = document.createElement('div');
                            pair.className = 'o_bao_field_pair';
                            child.before(pair);
                            pair.appendChild(child);
                            pair.appendChild(next);
                        }
                    }
                    i++;
                }
            }
        };
        onMounted(wrapPairs);
        onPatched(wrapPairs);
    },
});
