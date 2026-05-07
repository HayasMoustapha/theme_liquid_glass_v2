/** @odoo-module **/

import { NavBar } from "@web/webclient/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { useEffect, useState } from "@odoo/owl";

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.sidebarState = useState({ isOpen: false });
        useEffect(
            (isOpen) => {
                document.body.classList.toggle("o_sidebar_lock", isOpen);
                return () => {
                    document.body.classList.remove("o_sidebar_lock");
                };
            },
            () => [this.sidebarState.isOpen]
        );
    },

    toggleSidebar() {
        this.sidebarState.isOpen = !this.sidebarState.isOpen;
    },

    closeSidebar() {
        this.sidebarState.isOpen = false;
    },

    onNavBarAppClick(app) {
        this.closeSidebar();
        this.menuService.selectMenu(app);
    },
});
