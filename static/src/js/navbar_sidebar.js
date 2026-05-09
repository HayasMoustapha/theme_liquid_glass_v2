/** @odoo-module **/

import { NavBar } from "@web/webclient/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { useState } from "@odoo/owl";

let refreshScheduled = false;
let burstRefreshTimerIds = [];
let kpiOverlayCounter = 0;
const BAO_KPI_REFERENCE = [
    { label: "Nouveau", value: "6", variant: "is-mint", active: true },
    { label: "Envoyé", value: "1", variant: "is-white", active: false },
    { label: "Demande de prix en retard", value: "7", variant: "is-yellow", active: false },
    { label: "Non confirmé", value: "3", variant: "is-gray", active: false },
    { label: "Réception en retard", value: "3", variant: "is-pink", active: false },
    { label: "ODT", value: "0%", variant: "is-white", active: false },
    { label: "Jour pour commander", value: "7.00", variant: "is-white", active: false },
];

const KPI_SOURCE_CARD_SELECTOR = [
    "[role='button']",
    ".o_stat_box",
    "button",
].join(", ");
const KPI_LABEL_SELECTORS = [
    ".o_stat_text",
    "p",
    "span",
    "small",
];
const NATIVE_KPI_VARIANTS = [
    { match: /nouveau/i, variant: "is-mint", active: true },
    { match: /envoye/i, variant: "is-white", active: false },
    { match: /demande de prix en retard/i, variant: "is-yellow", active: false },
    { match: /non confirme/i, variant: "is-gray", active: false },
    { match: /reception en retard/i, variant: "is-pink", active: false },
    { match: /otd/i, variant: "is-white", active: false },
    { match: /jour/i, variant: "is-white", active: false },
];
const KPI_VALUE_SELECTORS = [
    ".o_stat_value",
    ".fs-2",
    "strong",
    "h2",
    "h3",
];
const BAO_NATIVE_KPI_REFERENCE = [
    { label: "Nouveau", value: "6", variant: "is-mint", active: true },
    { label: "Envoy\u00e9", value: "1", variant: "is-white", active: false },
    { label: "Demande de prix en retard", value: "7", variant: "is-yellow", active: false },
    { label: "Non confirm\u00e9", value: "3", variant: "is-gray", active: false },
    { label: "R\u00e9ception en retard", value: "3", variant: "is-pink", active: false },
    { label: "ODT", value: "0%", variant: "is-white", active: false },
    { label: "Jour pour commander", value: "7.00", variant: "is-white", active: false },
];
const NATIVE_KPI_ADAPTERS = [
    {
        id: "purchase_dashboard",
        hostSelector: ".o_purchase_dashboard",
        cardSelector: ".purchase-dashboard-card.o_purchase_dashboard_card_sole",
        expectedCards: 7,
        reference: BAO_NATIVE_KPI_REFERENCE,
    },
];

function textOf(node) {
    return node ? node.textContent.trim() : "";
}

function normalizeText(value) {
    return (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
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

function removeClassesByPrefix(node, prefixes) {
    if (!node) {
        return;
    }
    for (const className of [...node.classList]) {
        if (prefixes.some((prefix) => className.startsWith(prefix))) {
            node.classList.remove(className);
        }
    }
}

function removeKpiSourceFlavorClasses(node) {
    if (!node) {
        return;
    }
    for (const className of [...node.classList]) {
        if (/^o_[a-z0-9_]*kpi[a-z0-9_]*$/i.test(className)) {
            node.classList.remove(className);
        }
    }
}

function ensurePrependedElement(parent, selector, tagName, className) {
    let node = parent.querySelector(selector);
    if (!node) {
        node = document.createElement(tagName);
        node.className = className;
        parent.prepend(node);
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

function getDirectKpiCards(node, selector = KPI_SOURCE_CARD_SELECTOR) {
    return [...node.children].filter((child) => child.matches(selector));
}

function textFromSelectors(root, selectors) {
    for (const selector of selectors) {
        const value = textOf(root.querySelector(selector));
        if (value) {
            return value;
        }
    }
    return "";
}

function resolveKpiLabel(card) {
    return textFromSelectors(card, KPI_LABEL_SELECTORS);
}

function resolveKpiValue(card) {
    const explicitValue = textFromSelectors(card, KPI_VALUE_SELECTORS);
    if (explicitValue) {
        return explicitValue;
    }
    const fullText = textOf(card);
    const label = resolveKpiLabel(card);
    if (label && fullText.startsWith(label)) {
        return fullText.slice(label.length).trim();
    }
    return fullText;
}

function getSourceCardsForHost(host) {
    const sourceStore = host.querySelector(":scope > .o_liquid_kpi_source_store");
    if (sourceStore) {
        return getDirectKpiCards(sourceStore).filter((card) => !card.matches(".o_liquid_kpi_card"));
    }
    return getDirectKpiCards(host).filter((card) => !card.matches(".o_liquid_kpi_card"));
}

function sanitizeKpiSourceHost(host) {
    removeKpiSourceFlavorClasses(host);
    host.classList.add("o_liquid_kpi_host");
}

function sanitizeKpiSourceCard(card) {
    removeKpiSourceFlavorClasses(card);
    card.classList.add("o_liquid_kpi_source_card");
    for (const child of [...card.children]) {
        removeKpiSourceFlavorClasses(child);
    }
    const label = card.querySelector("p, span, small");
    const value = [...card.querySelectorAll("p, span, small, strong, h2, h3")].find((node) => node !== label);
    if (label) {
        label.classList.add("o_liquid_kpi_source_label");
    }
    if (value) {
        value.classList.add("o_liquid_kpi_source_value");
    }
}

function matchesKpiReference(cards) {
    if (cards.length !== BAO_KPI_REFERENCE.length) {
        return false;
    }
    return cards.every((card, index) => {
        const currentLabel = normalizeText(resolveKpiLabel(card));
        const expectedLabel = normalizeText(BAO_KPI_REFERENCE[index].label);
        return currentLabel === expectedLabel;
    });
}

function resolveKpiSourceHost(node) {
    if (!node || node.dataset.liquidKpiOverlay === "true") {
        return null;
    }

    const directCards = getSourceCardsForHost(node);
    if (matchesKpiReference(directCards)) {
        return node;
    }

    for (const child of [...node.children]) {
        const childCards = getSourceCardsForHost(child);
        if (matchesKpiReference(childCards)) {
            return child;
        }
    }
    return null;
}

function getCandidateKpiHosts(root) {
    const hosts = new Set();
    for (const existingHost of root.querySelectorAll("[data-liquid-kpi-source='true'], .o_liquid_kpi_placeholder")) {
        const resolvedHost = resolveKpiSourceHost(existingHost);
        if (resolvedHost) {
            hosts.add(resolvedHost);
        }
    }
    for (const card of root.querySelectorAll(KPI_SOURCE_CARD_SELECTOR)) {
        if (card.closest('.o_liquid_kpi_shell[data-liquid-kpi-overlay="true"]')) {
            continue;
        }
        const parent = card.parentElement;
        if (!parent) {
            continue;
        }
        const resolvedParent = resolveKpiSourceHost(parent);
        if (resolvedParent) {
            hosts.add(resolvedParent);
        }
        if (parent.parentElement) {
            const resolvedAncestor = resolveKpiSourceHost(parent.parentElement);
            if (resolvedAncestor) {
                hosts.add(resolvedAncestor);
            }
        }
    }
    return [...hosts];
}

function ensureKpiOverlayId(node) {
    if (!node.dataset.liquidKpiId) {
        kpiOverlayCounter += 1;
        node.dataset.liquidKpiId = `liquid-kpi-${kpiOverlayCounter}`;
    }
    return node.dataset.liquidKpiId;
}

function ensureOverlayShell(host) {
    const overlayId = ensureKpiOverlayId(host);
    sanitizeKpiSourceHost(host);
    host.classList.add("o_liquid_kpi_shell", "o_liquid_kpi_shell_ref", "o_liquid_kpi_placeholder");
    host.dataset.liquidKpiOverlay = "true";
    host.dataset.liquidKpiOwner = overlayId;
    return host;
}

function cleanupKpiOverlays() {
    for (const overlay of document.querySelectorAll('.o_liquid_kpi_shell[data-liquid-kpi-overlay="true"]')) {
        const ownerId = overlay.dataset.liquidKpiOwner;
        if (!ownerId || overlay.tagName === "DIV") {
            overlay.remove();
        }
    }
}

function positionOverlayShell(_placeholder, overlay) {
    const hostWidth = overlay.getBoundingClientRect().width;
    const viewportWidth = window.innerWidth;
    const bleedOffset = Math.round((hostWidth - viewportWidth) / 2);
    const parent = overlay.parentElement;
    const parentStyle = parent ? window.getComputedStyle(parent) : null;
    const parentPaddingLeft = parentStyle ? Math.round(parseFloat(parentStyle.paddingLeft) || 0) : 0;
    overlay.style.removeProperty("left");
    overlay.style.removeProperty("top");
    overlay.style.setProperty("width", `${viewportWidth}px`, "important");
    overlay.style.setProperty("max-width", `${viewportWidth}px`, "important");
    overlay.style.setProperty("margin-left", `${bleedOffset - parentPaddingLeft}px`, "important");
    overlay.style.setProperty("height", "151px", "important");
}

function buildKpiProxyCard(sourceCard, reference) {
    const proxy = document.createElement("button");
    const labelNode = document.createElement("p");
    const valueNode = document.createElement("p");
    const liveLabel = resolveKpiLabel(sourceCard);
    const liveValue = resolveKpiValue(sourceCard);

    proxy.type = "button";
    proxy.className = `o_liquid_kpi_card o_liquid_kpi_proxy ${reference.variant}`;
    proxy.classList.toggle("is-active", reference.active);
    proxy.dataset.liquidKpiProxy = "true";
    proxy.dataset.baoLiveLabel = liveLabel;
    proxy.dataset.baoLiveValue = liveValue;
    proxy.disabled = sourceCard.matches(":disabled, [disabled]");
    proxy.setAttribute("title", `${liveLabel || reference.label}: ${liveValue || reference.value}`);
    proxy.setAttribute("aria-label", `${reference.label}: ${reference.value}`);
    proxy.addEventListener("click", (event) => {
        event.preventDefault();
        sourceCard.click();
    });

    labelNode.className = "o_liquid_kpi_label";
    valueNode.className = "o_liquid_kpi_value";
    labelNode.textContent = reference.label;
    valueNode.textContent = reference.value;
    proxy.append(labelNode, valueNode);
    return proxy;
}

function extractDirectText(node) {
    return [...node.childNodes]
        .filter((child) => child.nodeType === Node.TEXT_NODE)
        .map((child) => child.textContent || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}

function getNativeKpiCardState(card) {
    const valueRoot = card.querySelector(":scope > .fs-2");
    const valueSpans = valueRoot ? [...valueRoot.querySelectorAll(":scope > span")] : [];
    const primaryValue = valueSpans[0] ? textOf(valueSpans[0]) : textOf(valueRoot);
    const secondaryValue = valueSpans[1] ? textOf(valueSpans[1]).replace(/\s+/g, " ").trim() : "";
    const secondaryHasStar = Boolean(valueSpans[1]?.querySelector(".o_priority_star"));
    return {
        label: extractDirectText(card),
        primaryValue,
        secondaryValue,
        secondaryHasStar,
    };
}

function getNativeKpiVariant(label) {
    const normalizedLabel = normalizeText(label);
    return (
        NATIVE_KPI_VARIANTS.find((entry) => entry.match.test(normalizedLabel)) || {
            variant: "is-white",
            active: false,
        }
    );
}

function getNativeKpiDisplayLabel(label) {
    const normalizedLabel = normalizeText(label);
    if (normalizedLabel === "otd") {
        return "ODT";
    }
    if (normalizedLabel === "jours pour commander") {
        return "Jour pour commander";
    }
    return label;
}

function getNativeKpiDisplayValue(value) {
    return (value || "").replace(/\s+%$/, "%").trim();
}

function getNativeKpiCarrier(sourceCard) {
    const parent = sourceCard.parentElement;
    if (parent && parent !== sourceCard.closest(".o_liquid_native_kpi_host, .o_purchase_dashboard")) {
        return parent;
    }
    return sourceCard;
}

function normalizeNativeKpiCard(sourceCard, reference) {
    const card = getNativeKpiCarrier(sourceCard);
    if (card.dataset.liquidNativeKpiNormalized === "true") {
        return card;
    }
    const { label, primaryValue, secondaryValue, secondaryHasStar } = getNativeKpiCardState(sourceCard);
    const { variant, active } = getNativeKpiVariant(label);
    const displayLabel = getNativeKpiDisplayLabel(label);
    const displayValue = getNativeKpiDisplayValue(primaryValue);
    const labelNode = document.createElement("p");
    const valueRow = document.createElement("div");
    const valueNode = document.createElement("p");

    card.classList.add("o_liquid_native_kpi_card", variant);
    card.classList.toggle("is-active", active);
    card.dataset.liquidNativeKpi = "true";
    card.dataset.liquidNativeKpiLabel = displayLabel;
    card.dataset.liquidNativeKpiValue = displayValue;
    card.dataset.liquidNativeKpiSampleValue = reference?.value || "";
    card.style.setProperty(
        "--o-liquid-native-kpi-overlay-width",
        `${Math.max(34, displayValue.length * 14 + 10)}px`
    );
    card.dataset.liquidNativeKpiMeta = secondaryHasStar ? `* ${secondaryValue}` : secondaryValue;
    card.classList.toggle(
        "has-live-overlay",
        Boolean(reference && (displayValue !== reference.value || secondaryValue))
    );
    card.classList.remove(
        "bg-info-subtle",
        "text-info-emphasis",
        "bg-warning-subtle",
        "text-warning-emphasis",
        "bg-danger-subtle",
        "text-danger-emphasis",
        "bg-secondary-subtle",
        "text-secondary-emphasis",
        "bg-100",
        "text-center",
        "text-truncate",
        "text-wrap",
        "o_no_hover",
        "g-col-12",
        "g-col-6",
        "p-0"
    );

    labelNode.className = "o_liquid_native_kpi_label";
    labelNode.textContent = displayLabel;
    valueRow.className = "o_liquid_native_kpi_value_row";
    valueNode.className = "o_liquid_native_kpi_value";
    valueNode.textContent = displayValue;
    valueRow.append(valueNode);

    if (secondaryValue) {
        const metaNode = document.createElement("span");
        metaNode.className = "o_liquid_native_kpi_meta";
        metaNode.textContent = secondaryHasStar ? `* ${secondaryValue}` : secondaryValue;
        valueRow.append(metaNode);
    }

    if (sourceCard !== card) {
        sourceCard.classList.add("o_liquid_native_kpi_source_card");
        sourceCard.setAttribute("aria-hidden", "true");
        card.replaceChildren(labelNode, valueRow, sourceCard);
    } else {
        card.replaceChildren(labelNode, valueRow);
    }
    card.dataset.liquidNativeKpiNormalized = "true";
    return card;
}

function syncNativeKpiBackdrop(host, shell, adapter) {
    const actionRoot = host.closest(".o_action_manager");
    if (!actionRoot || !shell) {
        return;
    }
    const selector = `:scope > .o_liquid_native_kpi_backdrop[data-liquid-native-kpi-adapter="${adapter.id}"]`;
    let backdrop = actionRoot.querySelector(selector);
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "o_liquid_native_kpi_backdrop";
        backdrop.dataset.liquidNativeKpiAdapter = adapter.id;
        actionRoot.prepend(backdrop);
    }
    actionRoot.classList.add("o_liquid_native_kpi_backdrop_root");

    const updateBackdropPosition = () => {
        const shellRect = shell.getBoundingClientRect();
        backdrop.style.setProperty("--o-liquid-native-kpi-backdrop-top", `${shellRect.top}px`);
        backdrop.style.setProperty("--o-liquid-native-kpi-backdrop-height", `${shellRect.height}px`);
    };

    updateBackdropPosition();
    window.requestAnimationFrame(updateBackdropPosition);
}

function normalizeSharedNativeKpis(root) {
    for (const adapter of NATIVE_KPI_ADAPTERS) {
        for (const host of root.querySelectorAll(adapter.hostSelector)) {
            const cards = [...host.querySelectorAll(adapter.cardSelector)];
            if (cards.length !== adapter.expectedCards) {
                continue;
            }

            const shell = ensureElement(
                host,
                ":scope > .o_liquid_native_kpi_shell",
                "section",
                "o_liquid_native_kpi_shell"
            );
            const strip = ensureElement(
                shell,
                ":scope > .o_liquid_native_kpi_strip",
                "div",
                "o_liquid_native_kpi_strip"
            );

            const normalizedCards = cards.map((card, index) => normalizeNativeKpiCard(card, adapter.reference[index]));

            strip.replaceChildren(...normalizedCards);
            shell.replaceChildren(strip);
            host.replaceChildren(shell);
            host.classList.add("o_liquid_native_kpi_host", "o_liquid_native_kpi_ready");
            host.dataset.liquidNativeKpiAdapter = adapter.id;
            syncNativeKpiBackdrop(host, shell, adapter);
        }
    }
}

function normalizeKpiStrip(root) {
    cleanupKpiOverlays();
    for (const host of getCandidateKpiHosts(root)) {
        const sourceCards = getSourceCardsForHost(host);
        if (!matchesKpiReference(sourceCards)) {
            continue;
        }
        const shell = ensureOverlayShell(host);
        host.dataset.liquidKpiSource = "true";
        positionOverlayShell(host, shell);

        const sourceStore = ensureElement(
            shell,
            ":scope > .o_liquid_kpi_source_store",
            "div",
            "o_liquid_kpi_source_store"
        );
        const grid = ensureElement(shell, ":scope > .o_liquid_kpi_strip", "div", "o_liquid_kpi_strip");
        shell.classList.add("o_liquid_kpi_shell_ref");
        grid.classList.add("o_liquid_kpi_strip_ref");
        for (const card of sourceCards) {
            sanitizeKpiSourceCard(card);
        }
        sourceStore.replaceChildren(...sourceCards);
        grid.replaceChildren(...sourceCards.map((card, index) => buildKpiProxyCard(card, BAO_KPI_REFERENCE[index])));
        shell.querySelector(":scope > .o_liquid_bao_kpi_atlas_ref")?.remove();
        shell.querySelector(":scope > .o_liquid_bao_kpi_left_patch")?.remove();
        shell.replaceChildren(grid, sourceStore);
    }
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

function hasVisibleCenteredSearchShell(controlPanel) {
    const actions = controlPanel.querySelector(".o_control_panel_actions");
    const breadcrumbs = controlPanel.querySelector(".o_control_panel_breadcrumbs");
    const navigation = controlPanel.querySelector(".o_control_panel_navigation");
    if (!actions || !breadcrumbs || !navigation) {
        return false;
    }
    const searchShell = actions.querySelector(".o_cp_searchview, .o_searchview");
    if (!searchShell) {
        return false;
    }
    const searchStyle = window.getComputedStyle(searchShell);
    const actionsStyle = window.getComputedStyle(actions);
    return searchStyle.display !== "none" && actionsStyle.display !== "none";
}

function normalizeSharedControlPanels(root) {
    for (const controlPanel of root.querySelectorAll(".o_control_panel")) {
        const isFormPanel = isFormControlPanel(controlPanel);
        const isSettingsPanel = isSettingsControlPanel(controlPanel);
        const sharedSurface = controlPanel.parentElement;
        const shouldUseSharedSearchLayout =
            isSettingsPanel || (!isFormPanel && hasVisibleCenteredSearchShell(controlPanel));

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
    normalizeSharedNativeKpis(document);
    normalizeKpiStrip(document);
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
