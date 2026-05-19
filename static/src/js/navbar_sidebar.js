/** @odoo-module **/

import { NavBar } from "@web/webclient/navbar/navbar";
import { ButtonBox } from "@web/views/form/button_box/button_box";
import { StatusBarButtons } from "@web/views/form/status_bar_buttons/status_bar_buttons";
import { patch } from "@web/core/utils/patch";
import { useBus, useService } from "@web/core/utils/hooks";
import { onMounted, onPatched, onWillRender, onWillUnmount, useExternalListener, useRef, useState } from "@odoo/owl";

let refreshScheduled = false;
let burstRefreshTimerIds = [];
let pivotPrimeTimerIds = [];
let deferredRefreshTimerId = null;
let controlPanelInteractionUntil = 0;
let controlPanelBaoInitialized = false;

function getViewportSize() {
    const width = window.innerWidth;
    if (width < 576) {
        return 0;
    }
    if (width < 768) {
        return 1;
    }
    if (width < 992) {
        return 2;
    }
    if (width < 1200) {
        return 3;
    }
    if (width < 1400) {
        return 4;
    }
    return 5;
}

function syncUiSizeNow(ui) {
    if (!ui) {
        return false;
    }
    const size = getViewportSize();
    if (ui.size !== size) {
        ui.size = size;
        ui.isSmall = size <= 1;
        return true;
    }
    return false;
}

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

function markControlPanelInteraction() {
    controlPanelInteractionUntil = performance.now() + 140;
}

function hasOpenNativeOverlay() {
    return Boolean(
        document.querySelector(
            ".dropdown-menu.show, .o-dropdown--menu, .o_popover, .popover.show, .modal.show, .o_bottom_sheet, .ui-autocomplete, .o-autocomplete--dropdown-menu"
        )
    );
}

function shouldDeferControlPanelRefresh() {
    return performance.now() < controlPanelInteractionUntil || hasOpenNativeOverlay();
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
            controlPanel.classList.remove(
                "o_bao_form_control_panel_new_record",
                "o_bao_form_control_panel_actions_wrapped",
                "o_bao_form_control_panel_smart_rail"
            );
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
    }
}

function hasVisibleSaveCancelButtons(controlPanel) {
    const buttons = [
        controlPanel.querySelector(".o_form_button_save"),
        controlPanel.querySelector(".o_form_button_cancel"),
    ].filter(Boolean);
    if (!buttons.length) {
        return false;
    }
    return buttons.every((button) => {
        const style = window.getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rect.width > 0 &&
            rect.height > 0
        );
    });
}

function getBaoSlotNames(slots) {
    if (!slots) {
        return [];
    }
    return Object.entries(slots)
        .filter(([_, slot]) => !("isVisible" in slot) || slot.isVisible)
        .map(([slotName]) => slotName);
}

function getPositiveWidth(element) {
    const width = element?.getBoundingClientRect().width || 0;
    return width > 0 ? width : 0;
}

function getButtonBoxAvailableWidth(root) {
    if (!root) {
        return 0;
    }
    const rootWidth = getPositiveWidth(root);
    const owner =
        root.closest(".o_control_panel_actions") ||
        root.closest(".o_form_sheet") ||
        root.closest(".o_form_view") ||
        root.parentElement;
    return getPositiveWidth(owner) || rootWidth;
}

function getStatusButtonsAvailableWidth(root) {
    if (!root) {
        return 0;
    }
    const rootWidth = getPositiveWidth(root);
    if (rootWidth) {
        return rootWidth;
    }
    const owner =
        root.closest(".o_form_statusbar") ||
        root.closest(".o_control_panel_breadcrumbs") ||
        root.parentElement;
    return getPositiveWidth(owner);
}

function fallbackCapacityFromViewport(kind) {
    const width = window.innerWidth;
    if (kind === "status") {
        if (width < 576) return 1;
        if (width < 768) return 2;
        if (width < 992) return 3;
        if (width < 1200) return 4;
        if (width < 1400) return 5;
        return 7;
    }
    if (width < 576) return 1;
    if (width < 768) return 2;
    if (width < 992) return 4;
    if (width < 1200) return 5;
    if (width < 1400) return 6;
    if (width < 1600) return 7;
    return 9;
}

function capacityFromWidth(width, kind, total) {
    if (!total) {
        return 0;
    }
    if (!width) {
        return Math.min(total, fallbackCapacityFromViewport(kind));
    }
    const gap = kind === "status" ? 6 : 8;
    const itemWidth = kind === "status" ? 136 : 146;
    return Math.max(1, Math.min(total, Math.floor((width + gap) / (itemWidth + gap))));
}

function splitSlotsForOverflow(slotNames, capacity, kind = "generic") {
    if (slotNames.length <= capacity) {
        return { visible: slotNames, additional: [], isFull: slotNames.length === capacity };
    }
    const visibleCount = kind === "buttonbox" ? Math.max(capacity - 1, 0) : Math.max(capacity - 1, 1);
    return {
        visible: slotNames.slice(0, visibleCount),
        additional: slotNames.slice(visibleCount),
        isFull: true,
    };
}

function getOverflowMetrics(kind) {
    return kind === "status"
        ? { gap: 6, estimatedItemWidth: 136, moreWidth: 48 }
        : { gap: 0, estimatedItemWidth: 118, moreWidth: 76 };
}

function sumInlineWidths(widths, gap) {
    return widths.reduce((total, width, index) => total + width + (index ? gap : 0), 0);
}

function isOverflowDropdownChild(child) {
    return Boolean(
        child?.matches?.(".dropdown, .o-dropdown") ||
            child?.querySelector?.(".oi-ellipsis-v, .fa-ellipsis-v, .o_dropdown_more")
    );
}

function getMeasuredChildren(root) {
    if (!root) {
        return [];
    }
    return [...root.children].filter((child) => {
        const style = window.getComputedStyle(child);
        const rect = child.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });
}

function getChildrenWrap(root, children) {
    if (!root || children.length < 2) {
        return false;
    }
    const firstTop = Math.round(children[0].getBoundingClientRect().top);
    return children.some((child) => Math.round(child.getBoundingClientRect().top) > firstTop + 4);
}

function measuredCapacityFromWidths(width, widths, kind, total) {
    if (!total) {
        return 0;
    }
    if (!width || widths.length !== total) {
        return Math.min(total, fallbackCapacityFromViewport(kind));
    }
    const { gap, estimatedItemWidth, moreWidth } = getOverflowMetrics(kind);
    const normalizedWidths = kind === "buttonbox" ? widths.map((itemWidth) => Math.max(itemWidth, estimatedItemWidth)) : widths;
    const allInlineWidth = sumInlineWidths(normalizedWidths, gap);
    if (allInlineWidth <= width + 1) {
        return total;
    }

    const availableForInline = Math.max(0, width - moreWidth - gap);
    let used = 0;
    let inlineCount = 0;
    for (const itemWidth of normalizedWidths) {
        const nextUsed = used + itemWidth + (inlineCount ? gap : 0);
        if (nextUsed > availableForInline + 1) {
            break;
        }
        used = nextUsed;
        inlineCount += 1;
    }
    if (!inlineCount && availableForInline >= estimatedItemWidth * 0.55) {
        inlineCount = 1;
    }
    return Math.max(1, Math.min(total, inlineCount + 1));
}

function dropdownCapacityFromInlineWidths(width, widths, kind, total) {
    if (!total || !width) {
        return Math.max(1, total ? Math.min(total, fallbackCapacityFromViewport(kind)) : 0);
    }
    const { gap, moreWidth } = getOverflowMetrics(kind);
    const availableForInline = Math.max(0, width - moreWidth - gap);
    let used = 0;
    let inlineCount = 0;
    for (const itemWidth of widths) {
        const nextUsed = used + itemWidth + (inlineCount ? gap : 0);
        if (nextUsed > availableForInline + 1) {
            break;
        }
        used = nextUsed;
        inlineCount += 1;
    }
    return Math.max(1, Math.min(total, inlineCount + 1));
}

function getOverflowLayoutState(root, kind, slotCount, previousWidths = []) {
    const width = kind === "status" ? getStatusButtonsAvailableWidth(root) : getButtonBoxAvailableWidth(root);
    if (!slotCount) {
        return { width: Math.round(width), capacity: 0, useDropdown: false, wraps: false, slotWidths: [] };
    }

    const children = getMeasuredChildren(root);
    const inlineChildren = children.filter((child) => !isOverflowDropdownChild(child));
    const canMeasureAllSlots = inlineChildren.length >= slotCount;
    const slotWidths = canMeasureAllSlots
        ? inlineChildren.slice(0, slotCount).map((child) => child.getBoundingClientRect().width)
        : previousWidths.length === slotCount
          ? [...previousWidths]
          : [];

    const earlyScrolls = Boolean(root && root.scrollWidth > root.clientWidth + 1);
    // First paint and unknown-width states stay native unless the DOM already
    // proves an overflow; a later resize/layout pass will refine the widths.
    if (slotWidths.length !== slotCount) {
        if (kind === "buttonbox") {
            return {
                width: Math.round(width),
                capacity: slotCount,
                useDropdown: false,
                wraps: false,
                slotWidths,
            };
        }
        const { estimatedItemWidth } = getOverflowMetrics(kind);
        const estimatedWidths = Array(slotCount).fill(estimatedItemWidth);
        const capacity = measuredCapacityFromWidths(width, estimatedWidths, kind, slotCount);
        return {
            width: Math.round(width),
            capacity,
            useDropdown: slotCount > 1 && (earlyScrolls || slotCount > capacity),
            wraps: false,
            slotWidths,
        };
    }

    const { gap } = getOverflowMetrics(kind);
    const wraps = canMeasureAllSlots ? getChildrenWrap(root, inlineChildren.slice(0, slotCount)) : false;
    const scrolls = Boolean(root && root.scrollWidth > root.clientWidth + 1);
    const hasOverflowDropdown = children.length !== inlineChildren.length;
    let capacity = measuredCapacityFromWidths(width, slotWidths, kind, slotCount);
    if (kind === "buttonbox" && scrolls && hasOverflowDropdown && inlineChildren.length > 1) {
        const renderedWidths = inlineChildren.map((child) => child.getBoundingClientRect().width);
        capacity = Math.min(capacity, dropdownCapacityFromInlineWidths(width, renderedWidths, kind, slotCount));
    }
    if ((wraps || scrolls) && capacity >= slotCount) {
        capacity = Math.max(1, slotCount - 1);
    }
    const allInlineFits = sumInlineWidths(slotWidths, gap) <= width + 1 && !wraps && !scrolls;

    return {
        width: Math.round(width),
        capacity,
        useDropdown: slotCount > 1 && !allInlineFits && slotCount > capacity,
        wraps,
        slotWidths,
    };
}

function slotWidthsChanged(previousWidths = [], nextWidths = []) {
    return (
        previousWidths.length !== nextWidths.length ||
        previousWidths.some((width, index) => Math.round(width) !== Math.round(nextWidths[index] || 0))
    );
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

    const hasSmartButtons = Boolean(smartBox && smartButtons.length);
    const isDesktopSmartRail = window.innerWidth >= 1200 && hasSmartButtons;
    const shouldPrioritizeStatusActions =
        hasSmartButtons && hasVisibleSaveCancelButtons(controlPanel);
    const shouldUseSmartRail = isDesktopSmartRail && !shouldPrioritizeStatusActions;
    controlPanel.classList.toggle(
        "o_bao_form_control_panel_actions_wrapped",
        Boolean(shouldPrioritizeStatusActions)
    );
    controlPanel.classList.toggle("o_bao_form_control_panel_smart_rail", Boolean(shouldUseSmartRail));

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

        const shouldHostToolbar = Boolean(dateFilter || favorite || share);
        const toolsHost = shouldHostToolbar
            ? ensureSurfaceToolbarHost(renderer, "o_bao_dashboard_surface_toolbar")
            : null;
        let navTools = toolsHost?.querySelector(":scope > .o_bao_dashboard_nav_tools");

        if (toolsHost && (favorite || share) && !navTools) {
            navTools = document.createElement("div");
            navTools.className = "o_bao_dashboard_nav_tools o_bao_surface_toolbar_group";
            toolsHost.prepend(navTools);
        }

        if (navTools && favorite && favorite.parentElement !== navTools) {
            navTools.append(favorite);
        }

        if (navTools && share && share.parentElement !== navTools) {
            navTools.append(share);
        }

        if (dateFilter && toolsHost) {
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

        const headerCluster = ensureElement(
            breadcrumbs,
            ":scope > .o_bao_form_header_cluster",
            "div",
            "o_bao_form_header_cluster d-inline-flex align-items-center min-w-0"
        );
        let header =
            headerCluster.querySelector(":scope > .o_bao_breadcrumb_header") ||
            breadcrumb.querySelector(":scope > .o_bao_breadcrumb_header");
        if (!header) {
            header = document.createElement("div");
        }
        header.classList.add("o_bao_breadcrumb_header", "d-flex", "align-items-center", "gap-2", "min-w-0");
        if (header.parentElement !== headerCluster) {
            headerCluster.prepend(header);
        }
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
        let mainButtonsShell =
            headerCluster.querySelector(":scope > .o_bao_header_main_buttons") ||
            breadcrumbs.querySelector(":scope > .o_bao_header_main_buttons");
        if (!mainButtonsShell) {
            mainButtonsShell = document.createElement("div");
            mainButtonsShell.className = "o_bao_header_main_buttons d-inline-flex align-items-center";
        }
        if (mainButtonsShell.parentElement !== headerCluster) {
            headerCluster.append(mainButtonsShell);
        }
        let statusShell =
            headerCluster.querySelector(":scope > .o_bao_header_status_actions") ||
            breadcrumbs.querySelector(":scope > .o_bao_header_status_actions");
        if (!statusShell) {
            statusShell = document.createElement("div");
            statusShell.className = "o_bao_header_status_actions d-inline-flex align-items-center";
        }
        if (statusShell.parentElement !== headerCluster) {
            headerCluster.append(statusShell);
        }
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
            sourceCluster.removeAttribute("aria-hidden");
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

function clearControlPanelTransitionResidue() {
    if (deferredRefreshTimerId) {
        window.clearTimeout(deferredRefreshTimerId);
        deferredRefreshTimerId = null;
    }
    for (const timerId of burstRefreshTimerIds) {
        window.clearTimeout(timerId);
    }
    burstRefreshTimerIds = [];
    for (const timerId of pivotPrimeTimerIds) {
        window.clearTimeout(timerId);
    }
    pivotPrimeTimerIds = [];
    document.documentElement.classList.remove("o_bao_cp_switching_pivot");
    document.body.classList.remove("o_bao_cp_switching_pivot");
    for (const node of document.querySelectorAll(".o_bao_cp_switching_pivot")) {
        node.classList.remove("o_bao_cp_switching_pivot");
    }
    for (const controlPanel of document.querySelectorAll(".o_bao_transition_control_panel, .o_bao_cp_pivot_pending")) {
        controlPanel.classList.remove("o_bao_transition_control_panel", "o_bao_cp_pivot_pending");
    }
}

function refreshControlPanelsNow() {
    if (deferredRefreshTimerId) {
        window.clearTimeout(deferredRefreshTimerId);
        deferredRefreshTimerId = null;
    }
    refreshScheduled = false;
    refreshControlPanels();
    window.requestAnimationFrame(() => refreshControlPanels());
}

function scheduleRefresh() {
    if (shouldDeferControlPanelRefresh()) {
        if (!deferredRefreshTimerId) {
            deferredRefreshTimerId = window.setTimeout(() => {
                deferredRefreshTimerId = null;
                scheduleRefresh();
            }, 80);
        }
        return;
    }
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

function instantResponsiveRefresh() {
    refreshControlPanelsNow();
    queueBurstRefresh([16, 48, 120]);
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
    if (controlPanelBaoInitialized) {
        instantResponsiveRefresh();
        return;
    }
    controlPanelBaoInitialized = true;
    instantResponsiveRefresh();
    window.setTimeout(() => refreshControlPanels(), 700);
    window.setTimeout(() => refreshControlPanels(), 1800);
    window.addEventListener("resize", instantResponsiveRefresh, { passive: true });
    window.addEventListener("orientationchange", instantResponsiveRefresh, { passive: true });
    window.visualViewport?.addEventListener("resize", instantResponsiveRefresh, { passive: true });
    window.addEventListener("scroll", scheduleRefresh, { passive: true });
    window.addEventListener("pagehide", clearControlPanelTransitionResidue, { passive: true });
    const observer = new MutationObserver(() => scheduleRefresh());
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener(
        "pointerdown",
        (event) => {
            if (
                event.target.closest(
                    ".o_control_panel button, .o_control_panel a, .o_control_panel [role='button'], .dropdown-menu, .o-dropdown--menu"
                )
            ) {
                markControlPanelInteraction();
            }
        },
        true
    );
    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.target.closest(
                    ".o_control_panel button, .o_control_panel a, .o_control_panel [role='button'], .dropdown-menu, .o-dropdown--menu"
                )
            ) {
                markControlPanelInteraction();
            }
        },
        true
    );
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

patch(ButtonBox.prototype, {
    setup() {
        // The native viewport-based split is not enough once BAO moves the
        // button box into a centered control-panel rail; use measured width.
        this.baoButtonBoxRef = useRef("baoButtonBox");
        this.baoButtonBoxState = useState({
            capacity: null,
            useDropdown: false,
            width: 0,
            slotCount: 0,
            slotWidths: [],
            slotSignature: "",
        });
        this.baoButtonBoxForcedOverflow = { width: 0, slotSignature: "", capacity: 0 };
        let settledMeasureTimerId = null;
        const scheduleSettledMeasure = () => {
            window.requestAnimationFrame(measureCapacity);
            window.clearTimeout(settledMeasureTimerId);
            settledMeasureTimerId = window.setTimeout(measureCapacity, 80);
        };
        const measureCapacity = () => {
            const slotNames = getBaoSlotNames(this.props.slots);
            const slotCount = slotNames.length;
            const slotSignature = slotNames.join("|");
            const previousWidths =
                this.baoButtonBoxState.slotSignature === slotSignature ? this.baoButtonBoxState.slotWidths : [];
            const layout = getOverflowLayoutState(
                this.baoButtonBoxRef.el,
                "buttonbox",
                slotCount,
                previousWidths
            );
            const root = this.baoButtonBoxRef.el;
            const children = getMeasuredChildren(root);
            const inlineChildren = children.filter((child) => !isOverflowDropdownChild(child));
            const domOverflow = Boolean(root && root.scrollWidth > root.clientWidth + 1);
            const rootWidth = layout.width || root?.clientWidth || 0;
            let nextCapacity = layout.capacity;
            let nextUseDropdown = layout.useDropdown;
            if (domOverflow && slotCount > 1) {
                const renderedWidths = inlineChildren.map((child) => child.getBoundingClientRect().width);
                const overflowCapacity = dropdownCapacityFromInlineWidths(rootWidth, renderedWidths, "buttonbox", slotCount);
                nextUseDropdown = true;
                nextCapacity = Math.min(nextCapacity, overflowCapacity);
                this.baoButtonBoxForcedOverflow = {
                    width: rootWidth,
                    slotSignature,
                    capacity: nextCapacity,
                };
            } else if (
                slotCount > 1 &&
                this.baoButtonBoxForcedOverflow.slotSignature === slotSignature &&
                rootWidth > 0 &&
                rootWidth <= this.baoButtonBoxForcedOverflow.width + 4
            ) {
                nextUseDropdown = true;
                nextCapacity = Math.min(nextCapacity, this.baoButtonBoxForcedOverflow.capacity);
            } else if (
                this.baoButtonBoxForcedOverflow.slotSignature === slotSignature &&
                rootWidth > this.baoButtonBoxForcedOverflow.width + 4
            ) {
                this.baoButtonBoxForcedOverflow = { width: 0, slotSignature: "", capacity: 0 };
            }
            if (!domOverflow && nextUseDropdown && slotCount > 1 && inlineChildren.length < slotCount) {
                const { gap, estimatedItemWidth, moreWidth } = getOverflowMetrics("buttonbox");
                const renderedWidths = inlineChildren.map((child) => child.getBoundingClientRect().width);
                const inlineWidth = sumInlineWidths(renderedWidths, gap);
                const nextProjectedWidth = inlineWidth + (renderedWidths.length ? gap : 0) + estimatedItemWidth + gap + moreWidth;
                if (nextProjectedWidth <= rootWidth + 1) {
                    nextCapacity = Math.min(slotCount, Math.max(nextCapacity, inlineChildren.length + 2));
                    nextUseDropdown = nextCapacity < slotCount;
                    if (this.baoButtonBoxForcedOverflow.slotSignature === slotSignature) {
                        this.baoButtonBoxForcedOverflow.capacity = nextCapacity;
                    }
                }
            }
            if (
                this.baoButtonBoxState.capacity !== nextCapacity ||
                this.baoButtonBoxState.useDropdown !== nextUseDropdown ||
                this.baoButtonBoxState.width !== layout.width ||
                this.baoButtonBoxState.slotCount !== slotCount ||
                this.baoButtonBoxState.slotSignature !== slotSignature ||
                slotWidthsChanged(this.baoButtonBoxState.slotWidths, layout.slotWidths)
            ) {
                this.baoButtonBoxState.capacity = nextCapacity;
                this.baoButtonBoxState.useDropdown = nextUseDropdown;
                this.baoButtonBoxState.width = layout.width;
                this.baoButtonBoxState.slotCount = slotCount;
                this.baoButtonBoxState.slotWidths = layout.slotWidths;
                this.baoButtonBoxState.slotSignature = slotSignature;
                this.render();
                scheduleSettledMeasure();
            }
        };
        onMounted(() => {
            measureCapacity();
            window.requestAnimationFrame(measureCapacity);
            window.setTimeout(measureCapacity, 80);
        });
        onWillUnmount(() => {
            window.clearTimeout(settledMeasureTimerId);
        });
        onPatched(measureCapacity);
        useExternalListener(window, "resize", measureCapacity);
        useExternalListener(window, "orientationchange", measureCapacity);
        if (window.visualViewport) {
            useExternalListener(window.visualViewport, "resize", measureCapacity);
        }
        onWillRender(() => {
            const allVisibleButtons = getBaoSlotNames(this.props.slots);
            const slotSignature = allVisibleButtons.join("|");
            if (!this.baoButtonBoxState.useDropdown || this.baoButtonBoxState.slotSignature !== slotSignature) {
                this.visibleButtons = allVisibleButtons;
                this.additionalButtons = [];
                this.isFull = false;
                return;
            }
            const capacity = this.baoButtonBoxState.capacity ?? allVisibleButtons.length;
            const split = splitSlotsForOverflow(allVisibleButtons, capacity, "buttonbox");
            this.visibleButtons = split.visible;
            this.additionalButtons = split.additional;
            this.isFull = split.isFull;
        });
    },
});

patch(StatusBarButtons.prototype, {
    setup() {
        if (super.setup) {
            super.setup(...arguments);
        }
        this.baoStatusButtonsRef = useRef("baoStatusButtons");
        this.baoStatusButtonsState = useState({
            capacity: null,
            useDropdown: false,
            wraps: false,
            width: 0,
            slotCount: 0,
            slotWidths: [],
        });
        this.baoStatusButtonsForcedOverflow = { width: 0, slotCount: 0 };
        let resizeObserver = null;
        const measureCapacity = () => {
            const root = this.baoStatusButtonsRef.el;
            const slotCount = this.visibleSlotNames.length;
            const layout = getOverflowLayoutState(root, "status", slotCount, this.baoStatusButtonsState.slotWidths);
            const domOverflow = Boolean(root && root.scrollWidth > root.clientWidth + 1);
            const rootWidth = root?.clientWidth || layout.width || 0;
            if (domOverflow && slotCount > 1) {
                this.baoStatusButtonsForcedOverflow = { width: rootWidth, slotCount };
            }
            const keepForcedDropdown =
                slotCount > 1 &&
                this.baoStatusButtonsForcedOverflow.slotCount === slotCount &&
                rootWidth > 0 &&
                rootWidth <= this.baoStatusButtonsForcedOverflow.width + 4;
            const stableSlotWidths =
                layout.slotWidths.length === slotCount || this.baoStatusButtonsState.slotWidths.length !== slotCount
                    ? layout.slotWidths
                    : this.baoStatusButtonsState.slotWidths;
            const hasReliableWidths = stableSlotWidths.length === slotCount;
            let nextCapacity = layout.capacity;
            let nextUseDropdown = layout.useDropdown;
            if (domOverflow && slotCount > 1) {
                nextCapacity = Math.min(nextCapacity, Math.max(1, slotCount - 1));
                nextUseDropdown = true;
            } else if (keepForcedDropdown) {
                nextCapacity = Math.min(nextCapacity, Math.max(1, slotCount - 1));
                nextUseDropdown = true;
            } else if (this.baoStatusButtonsState.useDropdown && !hasReliableWidths) {
                nextCapacity = this.baoStatusButtonsState.capacity ?? Math.max(1, slotCount - 1);
                nextUseDropdown = true;
            }
            if (!nextUseDropdown && rootWidth > this.baoStatusButtonsForcedOverflow.width + 4) {
                this.baoStatusButtonsForcedOverflow = { width: 0, slotCount: 0 };
            }
            if (
                this.baoStatusButtonsState.capacity !== nextCapacity ||
                this.baoStatusButtonsState.useDropdown !== nextUseDropdown ||
                this.baoStatusButtonsState.wraps !== layout.wraps ||
                this.baoStatusButtonsState.width !== layout.width ||
                this.baoStatusButtonsState.slotCount !== slotCount ||
                slotWidthsChanged(this.baoStatusButtonsState.slotWidths, stableSlotWidths)
            ) {
                this.baoStatusButtonsState.capacity = nextCapacity;
                this.baoStatusButtonsState.useDropdown = nextUseDropdown;
                this.baoStatusButtonsState.wraps = layout.wraps;
                this.baoStatusButtonsState.width = layout.width;
                this.baoStatusButtonsState.slotCount = slotCount;
                this.baoStatusButtonsState.slotWidths = stableSlotWidths;
                this.render();
            }
        };
        const scheduleMeasureCapacity = () => {
            measureCapacity();
            window.requestAnimationFrame(() => {
                measureCapacity();
                window.requestAnimationFrame(measureCapacity);
            });
        };
        onMounted(() => {
            scheduleMeasureCapacity();
            window.setTimeout(measureCapacity, 120);
            const root = this.baoStatusButtonsRef.el;
            if (window.ResizeObserver && root) {
                resizeObserver = new window.ResizeObserver(scheduleMeasureCapacity);
                resizeObserver.observe(root);
                const statusbar = root.closest(".o_form_statusbar");
                if (statusbar) {
                    resizeObserver.observe(statusbar);
                }
            }
        });
        onPatched(scheduleMeasureCapacity);
        onWillUnmount(() => resizeObserver?.disconnect());
        useExternalListener(window, "resize", measureCapacity);
        useExternalListener(window, "orientationchange", measureCapacity);
        if (window.visualViewport) {
            useExternalListener(window.visualViewport, "resize", measureCapacity);
        }
    },

    get shouldUseBaoDropdown() {
        return Boolean(this.baoStatusButtonsState.useDropdown && this.visibleSlotNames.length > 1);
    },

    get baoInlineStatusSlotNames() {
        const slots = this.visibleSlotNames;
        if (!this.shouldUseBaoDropdown) {
            return slots;
        }
        return splitSlotsForOverflow(slots, this.baoStatusButtonsState.capacity ?? slots.length, "status").visible;
    },

    get baoOverflowStatusSlotNames() {
        const slots = this.visibleSlotNames;
        if (!this.shouldUseBaoDropdown) {
            return [];
        }
        return splitSlotsForOverflow(slots, this.baoStatusButtonsState.capacity ?? slots.length, "status").additional;
    },
});

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.ui = useService("ui");
        this.baoRenderedViewportSize = getViewportSize();
        this.enterpriseLauncherState = useState({ isOpen: false });
        useExternalListener(window, "resize", () => this.syncBaoResponsiveNavbar());
        useExternalListener(window, "orientationchange", () => this.syncBaoResponsiveNavbar());
        useBus(this.ui.bus, "resize", () => this.syncBaoResponsiveNavbar());
        useExternalListener(document, "keydown", (event) => {
            if (event.key === "Escape") {
                this.closeEnterpriseLauncher();
            }
        });
        useExternalListener(document, "click", (event) => {
            if (
                !event.target.closest(".o_enterprise_app_launcher") &&
                !event.target.closest(".o_enterprise_launcher_toggle")
            ) {
                this.closeEnterpriseLauncher();
            }
        });
        useExternalListener(window, "resize", () => {
            if (this.env.isSmall || this.isScopedApp) {
                this.closeEnterpriseLauncher();
            }
        });
        initControlPanelBao();
    },

    syncBaoResponsiveNavbar() {
        if (!this.root?.el) {
            return;
        }
        const viewportSize = getViewportSize();
        syncUiSizeNow(this.ui);
        if (this.baoRenderedViewportSize === viewportSize) {
            return;
        }
        this.baoRenderedViewportSize = viewportSize;
        this.currentAppSectionsExtra = [];
        this.render();
    },

    toggleEnterpriseLauncher() {
        if (this.env.isSmall || this.isScopedApp) {
            this.closeEnterpriseLauncher();
            return;
        }
        this.enterpriseLauncherState.isOpen = !this.enterpriseLauncherState.isOpen;
    },

    closeEnterpriseLauncher() {
        this.enterpriseLauncherState.isOpen = false;
    },
});
