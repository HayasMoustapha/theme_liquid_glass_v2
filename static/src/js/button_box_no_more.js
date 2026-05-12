import { patch } from "@web/core/utils/patch";
import { ButtonBox } from "@web/views/form/button_box/button_box";
import { onWillRender } from "@odoo/owl";

patch(ButtonBox.prototype, {
    setup() {
        super.setup();
        onWillRender(() => {
            const allVisibleButtons = Object.entries(this.props.slots)
                .filter(([_, slot]) => this.isSlotVisible(slot))
                .map(([slotName]) => slotName);

            this.visibleButtons = allVisibleButtons;
            this.additionalButtons = [];
            this.isFull = false;
        });
    },
});
