/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { GraphRenderer } from "@web/views/graph/graph_renderer";

const FONT_COLOR = "#1e3c5a";
// BAO data-green for single-measure KPI graphs (matches the BAO "Analyse des
// achats" reference: green line + green gradient area fill).
const BAO_GRAPH_GREEN = "#03a750";

patch(GraphRenderer.prototype, {

    // Single-series line/area charts (the common KPI case, e.g. RFQ analysis)
    // are recolored to the BAO green with a vertical gradient area fill.
    // Multi-series keep Odoo's native palette. Pure config override (no DOM).
    getLineChartData() {
        const data = super.getLineChartData();
        const datasets = data && data.datasets;
        if (datasets && datasets.length === 1) {
            const d = datasets[0];
            d.borderColor = BAO_GRAPH_GREEN;
            d.pointBackgroundColor = BAO_GRAPH_GREEN;
            d.hoverBackgroundColor = BAO_GRAPH_GREEN;
            d.fill = "origin";
            d.backgroundColor = (ctx) => {
                const chart = ctx.chart;
                const area = chart && chart.chartArea;
                if (!area) {
                    return "rgba(3, 167, 80, 0.12)";
                }
                const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
                g.addColorStop(0, "rgba(3, 167, 80, 0.35)");
                g.addColorStop(1, "rgba(3, 167, 80, 0.02)");
                return g;
            };
        }
        return data;
    },

    getScaleOptions() {
        const options = super.getScaleOptions();

        if (options.x?.ticks) {
            options.x.ticks.color = FONT_COLOR;
        }
        if (options.x?.title) {
            options.x.title.color = FONT_COLOR;
        }

        if (options.y?.ticks) {
            options.y.ticks.color = FONT_COLOR;
        }
        if (options.y?.title) {
            options.y.title.color = FONT_COLOR;
        }

        return options;
    },

    getLegendOptions() {
        const options = super.getLegendOptions();

        if (options.labels) {
            options.labels.color = FONT_COLOR;
        }

        if (options.labels?.generateLabels) {
            const originalGenerateLabels = options.labels.generateLabels;

            options.labels.generateLabels = (chart) => {
                return originalGenerateLabels(chart).map(label => ({
                    ...label,
                    fontColor: FONT_COLOR,
                }));
            };
        }

        return options;
    },

});
