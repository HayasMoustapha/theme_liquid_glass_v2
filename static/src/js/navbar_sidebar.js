/** @odoo-module **/

import { NavBar } from "@web/webclient/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { useState } from "@odoo/owl";

let refreshScheduled = false;
let burstRefreshTimerIds = [];
let pivotPrimeTimerIds = [];
function textOf(node) {
    return node ? node.textContent.trim() : "";
}

function ensureElement(parent, selector, tagName, className) {
    let node = parent.querySelector(selector);
    if (!node) {
        node = document.createElement(tagName);
        node.className = className;
        parent.append(node);
    }
    return node;
}

function clearStatusButtonStyles(button) {
    button.style.removeProperty("display");
    button.style.removeProperty("visibility");
    button.style.removeProperty("margin");
    button.style.removeProperty("padding");
    button.style.removeProperty("width");
    button.style.removeProperty("min-width");
    button.style.removeProperty("border");
    button.style.removeProperty("order");
}

function looksLikeDocumentCode(value) {
    return /^[A-Z0-9][A-Z0-9/_-]{2,}$/.test(value || "");
}

function getMenuSectionText() {
    const menuTexts = [...document.querySelectorAll(".o_main_navbar .o_menu_sections a, .o_main_navbar .o_menu_sections button")]
        .map((node) => textOf(node))
        .filter(Boolean);
    const pathname = window.location.pathname;
    const findMenu = (pattern) => menuTexts.find((text) => pattern.test(text));

    if (pathname.includes("/purchase")) {
        return findMenu(/order|commande/i) || menuTexts[0] || "";
    }
    if (pathname.includes("/vendors")) {
        return findMenu(/vendor|supplier|fournisseur/i) || "Vendors";
    }
    if (pathname.includes("/customers")) {
        return findMenu(/customer|contact|client/i) || "Customers";
    }
    if (pathname.includes("product.product") || pathname.includes("/product")) {
        return findMenu(/product|produit/i) || menuTexts[0] || "";
    }
    if (pathname.includes("/inventory") || pathname.includes("/receipts")) {
        return findMenu(/operation|receipt|reception/i) || menuTexts[0] || "";
    }

    const activeMenu =
        document.querySelector(".o_main_navbar .o_menu_sections .active") ||
        document.querySelector(".o_main_navbar .o_menu_sections .show") ||
        document.querySelector(".o_main_navbar .o_menu_sections [aria-current='page']");
    return textOf(activeMenu) || menuTexts[0] || "";
}

function getTitleFamilyText() {
    return textOf(document.querySelector(".o_form_view .oe_title .o_form_label"));
}

function getRecordTitleText() {
    return textOf(document.querySelector(".o_form_view .oe_title h1, .o_form_view .oe_title h2"));
}

function isFormControlPanel(controlPanel) {
    if (controlPanel.closest(".o_base_settings_view") || document.querySelector(".o_base_settings_view")) {
        return false;
    }
    return Boolean(
        controlPanel.querySelector(".o_control_panel_breadcrumbs .o_breadcrumb") &&
        (controlPanel.querySelector(".o_form_status_indicator") || document.querySelector(".o_form_view"))
    );
}

function isSettingsControlPanel(controlPanel) {
    return Boolean(controlPanel.closest(".o_base_settings_view") || document.querySelector(".o_base_settings_view"));
}

function hasVisibleCenteredActionsShell(controlPanel) {
    const actions = controlPanel.querySelector(".o_control_panel_actions");
    const breadcrumbs = controlPanel.querySelector(".o_control_panel_breadcrumbs");
    const navigation = controlPanel.querySelector(".o_control_panel_navigation");
    if (!actions || !breadcrumbs || !navigation) {
        return false;
    }
    const centeredShell = actions.querySelector(".o_cp_searchview, .o_searchview, .o_selection_container");
    if (!centeredShell) {
        return false;
    }
    const centeredStyle = window.getComputedStyle(centeredShell);
    const actionsStyle = window.getComputedStyle(actions);
    return centeredStyle.display !== "none" && actionsStyle.display !== "none";
}

function normalizeSharedControlPanels(root) {
    for (const controlPanel of root.querySelectorAll(".o_control_panel")) {
        const isFormPanel = isFormControlPanel(controlPanel);
        const isSettingsPanel = isSettingsControlPanel(controlPanel);
        const sharedSurface = controlPanel.parentElement;
        const shouldUseSharedSearchLayout =
            isSettingsPanel || (!isFormPanel && hasVisibleCenteredActionsShell(controlPanel));

        controlPanel.classList.toggle("o_bao_form_control_panel", isFormPanel && !isSettingsPanel);
        controlPanel.classList.toggle(
            "o_bao_center_search_panel",
            shouldUseSharedSearchLayout
        );
        if (sharedSurface) {
            sharedSurface.classList.toggle(
                "o_bao_shared_cp_surface",
                shouldUseSharedSearchLayout
            );
        }
        if (!isFormPanel) {
            controlPanel.classList.remove("o_bao_form_control_panel_new_record");
        }
    }
}

function normalizeSaveCancelIcons(root) {
    const saveIcon = root.querySelector(".o_form_status_indicator_buttons .o_form_button_save i");
    if (saveIcon) {
        saveIcon.className = "fa fa-floppy-o fa-fw o_bao_save_icon";
    }
    const cancelIcon = root.querySelector(".o_form_status_indicator_buttons .o_form_button_cancel i");
    if (cancelIcon) {
        cancelIcon.className = "fa fa-times fa-fw o_bao_cancel_icon";
    }
}

function normalizeStatusbar(root) {
    for (const statusRoot of root.querySelectorAll(".o_form_statusbar .o_statusbar_status")) {
        const buttons = [...statusRoot.querySelectorAll(":scope > .btn, :scope > button")];
        statusRoot.classList.remove("o_bao_statusbar_forced_steps");

        for (const button of buttons) {
            clearStatusButtonStyles(button);
            button.classList.remove(
                "o_bao_native_hidden_status",
                "o_bao_statusbar_dropdown_proxy",
                "o_bao_statusbar_step",
                "o_bao_statusbar_current_visible",
                "o_bao_statusbar_first_visible",
                "o_bao_statusbar_last_visible"
            );
        }
        for (const badge of statusRoot.querySelectorAll(".o_bao_statusbar_badge")) {
            badge.remove();
        }
        for (const visual of statusRoot.querySelectorAll(":scope > .o_bao_statusbar_visual")) {
            visual.remove();
        }

        const stepButtons = buttons.filter((button) => button.matches(".o_arrow_button[data-value]"));
        if (!stepButtons.length) {
            continue;
        }

        statusRoot.classList.add("o_bao_statusbar_forced_steps");

        for (const button of stepButtons) {
            button.classList.remove("d-none");
            button.classList.add("o_bao_statusbar_step");
            button.style.setProperty("display", "inline-flex");
            button.style.setProperty("visibility", "visible");
            button.style.setProperty("width", "auto");
            button.style.setProperty("min-width", "0");
            if (button.classList.contains("o_arrow_button_current") || button.getAttribute("aria-current") === "step") {
                button.classList.add("o_bao_statusbar_current_visible");
            }
        }

        const visualOrder = [...stepButtons].reverse();
        if (visualOrder.length) {
            visualOrder[0].classList.add("o_bao_statusbar_first_visible");
            visualOrder[visualOrder.length - 1].classList.add("o_bao_statusbar_last_visible");
        }

        for (const button of buttons) {
            if (stepButtons.includes(button)) {
                continue;
            }
            button.classList.add("o_bao_native_hidden_status");
            button.style.setProperty("display", "none");
            button.style.setProperty("visibility", "hidden");
            button.style.setProperty("width", "0");
            button.style.setProperty("min-width", "0");
            button.style.setProperty("margin", "0");
            button.style.setProperty("padding", "0");
            button.style.setProperty("border", "0");
        }
    }
}

function normalizeSmartButtonRail(controlPanel) {
    const main = controlPanel.querySelector(".o_control_panel_main");
    const breadcrumbs = controlPanel.querySelector(".o_control_panel_breadcrumbs");
    const actions = controlPanel.querySelector(".o_control_panel_actions");
    const smartBox = actions?.querySelector(".o-form-buttonbox, .o_form_button_box");
    const navigation = controlPanel.querySelector(".o_control_panel_navigation");
    const smartButtons = smartBox ? [...smartBox.querySelectorAll(".oe_stat_button")] : [];

    if (!main || !actions) {
        return;
    }

    if (window.innerWidth >= 1200 && smartBox && smartButtons.length) {
        const smartRailWidth = Math.ceil(actions.getBoundingClientRect().width || 0);
        const reserveWidth = Math.min(Math.max(smartRailWidth + 48, 280), 520);
        main.style.position = "relative";
        actions.style.position = "absolute";
        actions.style.left = "50%";
        actions.style.transform = "translateX(-50%)";
        actions.style.zIndex = "1";
        actions.style.width = "max-content";
        actions.style.maxWidth = `${Math.min(window.innerWidth * 0.46, 760)}px`;
        actions.style.margin = "0";
        actions.style.justifyContent = "center";
        actions.style.alignItems = "center";
        if (breadcrumbs) {
            breadcrumbs.style.boxSizing = "border-box";
            breadcrumbs.style.maxWidth = "100%";
            breadcrumbs.style.overflow = "hidden";
            breadcrumbs.style.paddingRight = `${reserveWidth}px`;
        }
        if (navigation) {
            navigation.style.marginLeft = "auto";
        }
    } else {
        main.style.removeProperty("position");
        actions.style.removeProperty("position");
        actions.style.removeProperty("left");
        actions.style.removeProperty("transform");
        actions.style.removeProperty("z-index");
        actions.style.removeProperty("width");
        actions.style.removeProperty("max-width");
        actions.style.removeProperty("margin");
        actions.style.removeProperty("justify-content");
        actions.style.removeProperty("align-items");
        if (breadcrumbs) {
            breadcrumbs.style.removeProperty("box-sizing");
            breadcrumbs.style.removeProperty("max-width");
            breadcrumbs.style.removeProperty("overflow");
            breadcrumbs.style.removeProperty("padding-right");
        }
        if (navigation) {
            navigation.style.removeProperty("margin-left");
        }
    }
}

function ensureSurfaceToolbarHost(container, className) {
    let host = container.querySelector(`:scope > .${className}`);
    if (!host) {
        host = document.createElement("div");
        host.className = `o_bao_surface_toolbar ${className}`;
        container.prepend(host);
    }
    return host;
}

function normalizePivotToolbar(root) {
    for (const controlPanel of root.querySelectorAll(".o_control_panel")) {
        controlPanel.classList.remove("o_bao_cp_pivot_pending");
        for (const orphanHost of controlPanel.querySelectorAll(".o_bao_cp_inline_tools")) {
            orphanHost.remove();
        }
    }

    for (const action of root.querySelectorAll(".o_pivot_view")) {
        const contentShell = action.querySelector(":scope > .o_content > div:first-child");
        const pivotButtons = action.querySelector(".o_pivot_buttons");
        if (!contentShell || !pivotButtons) {
            continue;
        }

        const toolsHost = ensureSurfaceToolbarHost(contentShell, "o_bao_pivot_surface_toolbar");
        pivotButtons.classList.remove("mt-2", "mx-3", "mb-3", "o_bao_cp_inline_tools_row");
        pivotButtons.classList.add("o_bao_surface_toolbar_group", "o_bao_pivot_surface_toolbar_group");
        if (pivotButtons.parentElement !== toolsHost) {
            toolsHost.append(pivotButtons);
        }
    }
}

function normalizeDashboardToolbar(root) {
    for (const action of root.querySelectorAll(".o_spreadsheet_dashboard_action")) {
        const controlPanel = action.querySelector(":scope > .o_control_panel") || action.querySelector(".o_control_panel");
        const navigation = controlPanel?.querySelector(".o_control_panel_navigation");
        const renderer = action.querySelector(":scope > .o_content > .o_renderer");
        const dateFilter = action.querySelector(".o_sp_date_filter_button");
        const favorite = navigation?.querySelector(".o_dashboard_star");
        const share = navigation?.querySelector(":scope > .btn.btn-light.o-dropdown");
        if (!controlPanel || !navigation || !renderer) {
            continue;
        }

        if (dateFilter) {
            const toolsHost = ensureSurfaceToolbarHost(renderer, "o_bao_dashboard_surface_toolbar");
            dateFilter.classList.remove("o_bao_dashboard_date_tools");
            dateFilter.classList.add("o_bao_surface_toolbar_group", "o_bao_dashboard_surface_toolbar_group");
            if (dateFilter.parentElement !== toolsHost) {
                toolsHost.append(dateFilter);
            }
        }

        for (const navTools of navigation.querySelectorAll(".o_bao_dashboard_nav_tools")) {
            if (!navTools.children.length) {
                navTools.remove();
            }
        }

        if (favorite) {
            favorite.remove();
        }

        if (share) {
            share.remove();
        }

        for (const toolsHost of action.querySelectorAll(".o_bao_dashboard_surface_toolbar")) {
            if (!toolsHost.children.length) {
                toolsHost.remove();
            }
        }
    }
}

function normalizeBreadcrumbs(root) {
    for (const controlPanel of root.querySelectorAll(".o_control_panel")) {
        if (!isFormControlPanel(controlPanel)) {
            continue;
        }
        controlPanel.classList.add("o_bao_form_control_panel");

        const breadcrumb = controlPanel.querySelector(".o_control_panel_breadcrumbs .o_breadcrumb");
        if (!breadcrumb) {
            continue;
        }

        const breadcrumbs = controlPanel.querySelector(".o_control_panel_breadcrumbs");
        const trailList = breadcrumb.querySelector(":scope > .breadcrumb");
        const sourceCluster = breadcrumb.querySelector(":scope > .d-flex.gap-1.text-truncate");
        const mainButtons = controlPanel.querySelector(".o_control_panel_main_buttons");
        const statusIndicator = controlPanel.querySelector(".o_form_status_indicator");
        const currentItem = sourceCluster?.querySelector(".o_last_breadcrumb_item span");
        const actions = sourceCluster?.querySelector(".o_control_panel_breadcrumbs_actions");
        const isNewRecord = Boolean(statusIndicator?.classList.contains("o_form_status_indicator_new_record"));
        controlPanel.classList.toggle("o_bao_form_control_panel_new_record", isNewRecord);

        const trailTexts = [...(trailList?.querySelectorAll(".breadcrumb-item") || [])]
            .map((item) => textOf(item.querySelector("a, span, button")) || textOf(item))
            .filter((text) => text && text !== "...");

        const headerLabel = getMenuSectionText() || trailTexts[0] || getTitleFamilyText() || textOf(currentItem);
        const recordTitleText = getRecordTitleText();
        const titleFamilyText = getTitleFamilyText();
        const currentBreadcrumbText = textOf(currentItem);
        const currentLabel = isNewRecord
            ? currentBreadcrumbText || recordTitleText || "New"
            : (!looksLikeDocumentCode(recordTitleText) && recordTitleText !== "New" && recordTitleText) ||
              (!looksLikeDocumentCode(currentBreadcrumbText) && currentBreadcrumbText !== "New" && currentBreadcrumbText) ||
              titleFamilyText ||
              currentBreadcrumbText ||
              trailTexts[trailTexts.length - 1] ||
              headerLabel;

        breadcrumb.classList.add("o_bao_breadcrumb");

        const header = ensureElement(
            breadcrumb,
            ":scope > .o_bao_breadcrumb_header",
            "div",
            "o_bao_breadcrumb_header d-flex align-items-center gap-2 min-w-0"
        );
        const headerTextNode = ensureElement(
            header,
            ":scope > .o_bao_breadcrumb_header_text",
            "span",
            "o_bao_breadcrumb_header_text min-w-0 text-truncate"
        );
        headerTextNode.textContent = headerLabel;
        for (const legacyHeaderIcon of header.querySelectorAll(":scope > .o_bao_breadcrumb_header_icon")) {
            legacyHeaderIcon.remove();
        }

        const interactiveShell = ensureElement(
            header,
            ":scope > .o_bao_breadcrumb_interactive",
            "div",
            "o_bao_breadcrumb_interactive d-inline-flex align-items-center"
        );
        const menuShell = ensureElement(
            interactiveShell,
            ":scope > .o_bao_header_menu_actions",
            "div",
            "o_bao_header_menu_actions d-inline-flex align-items-center"
        );
        const mainButtonsShell = ensureElement(
            interactiveShell,
            ":scope > .o_bao_header_main_buttons",
            "div",
            "o_bao_header_main_buttons d-inline-flex align-items-center"
        );
        const statusShell = ensureElement(
            breadcrumbs,
            ":scope > .o_bao_header_status_actions",
            "div",
            "o_bao_header_status_actions d-inline-flex align-items-center"
        );
        if (mainButtons && mainButtons.parentElement !== mainButtonsShell) {
            mainButtonsShell.append(mainButtons);
        }
        if (actions && actions.parentElement !== menuShell) {
            menuShell.append(actions);
        }
        if (statusIndicator && statusIndicator.parentElement !== statusShell) {
            statusShell.append(statusIndicator);
        }
        if (statusIndicator) {
            statusIndicator.classList.remove("o_bao_status_indicator_inline");
        }
        if (statusIndicator) {
            const hasVisibleStatusButtons = [...statusIndicator.querySelectorAll("button, .btn")].some((button) => {
                const style = window.getComputedStyle(button);
                return style.display !== "none" && style.visibility !== "hidden";
            });
            statusIndicator.classList.toggle("o_bao_status_indicator_inert", !hasVisibleStatusButtons);
        }
        if (menuShell.parentElement === interactiveShell) {
            interactiveShell.append(menuShell);
        }
        if (mainButtonsShell.parentElement === interactiveShell) {
            interactiveShell.append(mainButtonsShell);
        }

        const trailRow = ensureElement(
            breadcrumb,
            ":scope > .o_bao_breadcrumb_trail",
            "div",
            "o_bao_breadcrumb_trail d-flex align-items-center min-w-0"
        );

        if (trailList && trailList.parentElement !== trailRow) {
            trailRow.prepend(trailList);
        }
        if (!trailList) {
            continue;
        }
        trailList.classList.add("o_bao_live_trail", "o_bao_generated_trail", "flex-nowrap", "text-nowrap", "lh-sm");

        for (const orphan of trailRow.querySelectorAll(":scope > .o_bao_current_trail_item_shell")) {
            orphan.remove();
        }

        const renderedTrailTexts = [...trailList.querySelectorAll(":scope > .breadcrumb-item")]
            .map((item) => textOf(item))
            .filter(Boolean);
        if (currentLabel && renderedTrailTexts[renderedTrailTexts.length - 1] !== currentLabel) {
            const currentTrailItem = document.createElement("li");
            currentTrailItem.className = "breadcrumb-item d-inline-flex min-w-0 o_bao_current_item o_bao_current_trail_item_shell";
            const currentTrailText = document.createElement("span");
            currentTrailText.className = "min-w-0 text-truncate";
            currentTrailText.textContent = currentLabel;
            currentTrailItem.append(currentTrailText);
            trailList.append(currentTrailItem);
        }

        if (sourceCluster) {
            sourceCluster.classList.add("o_bao_breadcrumb_source");
            sourceCluster.setAttribute("aria-hidden", "true");
        }

        if (!interactiveShell.children.length) {
            interactiveShell.remove();
        }

        normalizeSmartButtonRail(controlPanel);
    }
}

function refreshControlPanels() {
    normalizeSharedControlPanels(document);
    normalizePivotToolbar(document);
    normalizeDashboardToolbar(document);
    normalizeBreadcrumbs(document);
    normalizeSaveCancelIcons(document);
    normalizeStatusbar(document);
}

function scheduleRefresh() {
    if (refreshScheduled) {
        return;
    }
    refreshScheduled = true;
    window.requestAnimationFrame(() => {
        refreshScheduled = false;
        refreshControlPanels();
    });
}

function queueBurstRefresh(delays = [0, 60, 140, 260, 520]) {
    for (const timerId of burstRefreshTimerIds) {
        window.clearTimeout(timerId);
    }
    burstRefreshTimerIds = delays.map((delay) =>
        window.setTimeout(() => {
            refreshControlPanels();
        }, delay)
    );
}

function primePivotToolbarTransition(target) {
    if (!target?.matches(".o_switch_view.o_pivot, .o_cp_switch_buttons .o_switch_view.o_pivot")) {
        return;
    }

    for (const timerId of pivotPrimeTimerIds) {
        window.clearTimeout(timerId);
    }

    const actionManager = document.querySelector(".o_action_manager");
    const currentAction =
        target.closest(".o_action, .o_view_controller") ||
        document.querySelector(".o_action_manager > .o_action:not(.d-none), .o_action_manager > .o_view_controller:not(.d-none)");

    document.documentElement.classList.add("o_bao_cp_switching_pivot");
    document.body.classList.add("o_bao_cp_switching_pivot");
    actionManager?.classList.add("o_bao_cp_switching_pivot");
    currentAction?.classList.add("o_bao_cp_switching_pivot");

    const candidatePanels = new Set([
        target.closest(".o_control_panel"),
        ...(actionManager ? actionManager.querySelectorAll(".o_control_panel") : []),
    ]);
    for (const controlPanel of candidatePanels) {
        if (!controlPanel) {
            continue;
        }
        controlPanel.classList.add(
            "o_bao_cp_pivot_pending",
            "o_bao_center_search_panel",
            "o_bao_transition_control_panel"
        );
        controlPanel.parentElement?.classList.add("o_bao_shared_cp_surface");
    }

    refreshControlPanels();

    pivotPrimeTimerIds = [240, 520, 920, 1400].map((delay) =>
        window.setTimeout(() => {
            refreshControlPanels();
            const hasPivotView = Boolean(document.querySelector(".o_pivot_view"));
            if (delay >= 920 || hasPivotView) {
                document.documentElement.classList.remove("o_bao_cp_switching_pivot");
                document.body.classList.remove("o_bao_cp_switching_pivot");
                actionManager?.classList.remove("o_bao_cp_switching_pivot");
                currentAction?.classList.remove("o_bao_cp_switching_pivot");
                for (const controlPanel of document.querySelectorAll(".o_bao_transition_control_panel")) {
                    controlPanel.classList.remove("o_bao_transition_control_panel", "o_bao_cp_pivot_pending");
                }
            }
        }, delay)
    );
}

function initControlPanelBao() {
    scheduleRefresh();
    window.setTimeout(() => refreshControlPanels(), 700);
    window.setTimeout(() => refreshControlPanels(), 1800);
    window.addEventListener("resize", scheduleRefresh, { passive: true });
    window.addEventListener("scroll", scheduleRefresh, { passive: true });
    const observer = new MutationObserver(() => scheduleRefresh());
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener(
        "click",
        (event) => {
            const target = event.target.closest(
                ".o_switch_view, .o_app, a[href*='/odoo/dashboards'], [data-menu-xmlid='spreadsheet_dashboard.spreadsheet_dashboard_menu_root']"
            );
            if (target) {
                primePivotToolbarTransition(target);
                queueBurstRefresh([0, 16, 32, 48, 64, 96, 140, 220, 320, 520]);
            }
        },
        true
    );
}

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.sidebarState = useState({ isOpen: false });
        initControlPanelBao();
    },

    toggleSidebar() {
        this.sidebarState.isOpen = !this.sidebarState.isOpen;
    },

    closeSidebar() {
        this.sidebarState.isOpen = false;
    },
});
