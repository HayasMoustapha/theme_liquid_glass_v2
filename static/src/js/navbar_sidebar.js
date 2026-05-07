/** @odoo-module **/

import { NavBar } from "@web/webclient/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { useEffect, useState } from "@odoo/owl";

const GENERIC_HEADLINES = new Set(["Overview", "General Settings"]);

let isControlPanelSyncStarted = false;

function findMenuContext(childrenTree, actionPath, title) {
    for (const section of childrenTree || []) {
        if (section.actionPath && section.actionPath === actionPath) {
            return {
                sectionName: section.name || title,
                currentName: title || section.name || "",
            };
        }
        for (const leaf of section.childrenTree || []) {
            if ((leaf.actionPath && leaf.actionPath === actionPath) || leaf.name === title) {
                return {
                    sectionName: section.name || title,
                    currentName: leaf.name || title || "",
                };
            }
        }
        if (section.name === title) {
            return {
                sectionName: section.name || title,
                currentName: title || section.name || "",
            };
        }
    }
    return {
        sectionName: "",
        currentName: title || "",
    };
}

function computeControlPanelContext() {
    const root = window.odoo?.__WOWL_DEBUG__?.root;
    const menu = root?.env?.services?.menu;
    const actionService = root?.actionService || root?.env?.services?.action;
    const app = menu?.getCurrentApp?.();
    const controller = actionService?.currentController;
    const title = controller?.displayName || controller?.action?.name || document.title || "";
    const actionPath = controller?.action?.path || app?.actionPath || "";
    const { sectionName, currentName } = findMenuContext(app?.childrenTree || [], actionPath, title);
    const breadcrumbParent = sectionName || app?.name || title;
    const headline = GENERIC_HEADLINES.has(sectionName) || !sectionName ? title : sectionName;
    return {
        breadcrumbParent,
        currentName: currentName || title,
        headline: headline || title,
    };
}

function renderControlPanelContext(controlPanel) {
    const breadcrumb = controlPanel.querySelector(".o_breadcrumb");
    const titleNode = breadcrumb?.querySelector(".o_last_breadcrumb_item");
    if (!breadcrumb || !titleNode) {
        return;
    }

    const { breadcrumbParent, currentName, headline } = computeControlPanelContext();
    const stateKey = `${headline}|${breadcrumbParent}|${currentName}`;
    if (breadcrumb.dataset.baoCpStateKey === stateKey) {
        return;
    }

    let heading = breadcrumb.querySelector(".o_bao_cp_heading");
    if (!heading) {
        heading = document.createElement("div");
        heading.className = "o_bao_cp_heading";
        breadcrumb.prepend(heading);
    }

    heading.innerHTML = `
        <div class="o_bao_cp_section">
            <span class="o_bao_cp_section_text">${headline}</span>
            <i class="fa fa-clone o_bao_cp_section_icon" aria-hidden="true"></i>
        </div>
        <div class="o_bao_cp_trail" aria-hidden="true">
            <span class="o_bao_cp_trail_parent">${breadcrumbParent}</span>
            <span class="o_bao_cp_trail_sep">></span>
            <span class="o_bao_cp_trail_current">${currentName}</span>
        </div>
    `;

    breadcrumb.classList.add("o_bao_cp_upgraded");
    breadcrumb.dataset.baoCpStateKey = stateKey;
}

function syncControlPanels() {
    document.querySelectorAll(".o_control_panel").forEach(renderControlPanelContext);
}

function ensureControlPanelSync() {
    if (isControlPanelSyncStarted) {
        syncControlPanels();
        return;
    }
    const start = () => {
        if (!document.body) {
            return;
        }
        const observer = new MutationObserver(() => {
            syncControlPanels();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        window.addEventListener("load", syncControlPanels);
        document.addEventListener("visibilitychange", syncControlPanels);
        requestAnimationFrame(() => syncControlPanels());
        window.setTimeout(syncControlPanels, 250);
        isControlPanelSyncStarted = true;
    };
    if (document.body) {
        start();
        return;
    }
    document.addEventListener("DOMContentLoaded", start, { once: true });
}

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.sidebarState = useState({ isOpen: false });
        ensureControlPanelSync();
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
