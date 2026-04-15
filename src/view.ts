import { ItemView, WorkspaceLeaf, Notice, TFile, moment, TFolder } from "obsidian";
import type InstantDiaryPlugin from "./main";
import { t } from "./i18n";
import { createNewDiaryManually } from "./diary";

export const INSTANT_DIARY_VIEW_TYPE = "instant-diary-view";

export class InstantDiaryView extends ItemView {
    plugin: InstantDiaryPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: InstantDiaryPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return INSTANT_DIARY_VIEW_TYPE;
    }

    getDisplayText(): string {
        return t("management_title", this.plugin.settings.language);
    }

    getIcon(): string {
        return "calendar-days";
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();

        const lang = this.plugin.settings.language;

        // Button to create today's diary
        const btnContainer = container.createEl("div", { cls: "instant-diary-btn-container" });
        const btn = btnContainer.createEl("button", { text: `${t("create_today", lang)} (${moment().format("YYYY-MM-DD")})` });
        btn.style.margin = "0.5em 0 1.5em 0";
        btn.style.padding = "6px 12px";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = "var(--interactive-accent)";
        btn.style.color = "var(--text-on-accent)";
        btn.style.border = "none";

        btn.onclick = async () => {
            await createNewDiaryManually(this.app, this.plugin);
            this.renderListsAndStats(contentArea); // Refresh
        };

        // Placeholder for stats and lists
        const contentArea = container.createEl("div");
        this.renderListsAndStats(contentArea);
    }

    async renderListsAndStats(container: HTMLElement) {
        container.empty();
        const lang = this.plugin.settings.language;

        const rootFolder = this.plugin.settings.rootFolder || "diary";
        const rootAbstract = this.app.vault.getAbstractFileByPath(rootFolder);

        const allDiaryFiles: TFile[] = [];

        if (rootAbstract && rootAbstract instanceof TFolder) {
            const traverse = (folder: TFolder) => {
                for (const child of folder.children) {
                    if (child instanceof TFile && child.extension === "md" && /^\d{4}-\d{2}-\d{2}/.test(child.name)) {
                        allDiaryFiles.push(child);
                    } else if (child instanceof TFolder) {
                        traverse(child);
                    }
                }
            };
            traverse(rootAbstract);
        }

        // Sort desc
        allDiaryFiles.sort((a, b) => b.name.localeCompare(a.name));

        // ---- STATS ----
        const detailsEl = container.createEl("details");
        detailsEl.style.marginBottom = "2em";

        const summaryEl = detailsEl.createEl("summary");
        summaryEl.style.cursor = "pointer";
        const clickText = lang === "ja" ? "（クリックして表示）" : " (Click to show)";
        const h1 = summaryEl.createEl("h1", { text: t("diary_stats", lang) + clickText });
        h1.style.display = "inline";
        h1.style.marginLeft = "0.2em";

        const table = detailsEl.createEl("table", { cls: "instant-diary-month-table" });
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";

        const trHeader = table.createEl("tr");
        trHeader.createEl("th", { text: t("stats_month", lang) }).style.textAlign = "left";
        trHeader.createEl("th", { text: t("stats_count", lang) }).style.textAlign = "left";
        trHeader.createEl("th", { text: t("stats_chars", lang) }).style.textAlign = "left";
        trHeader.createEl("th", { text: t("stats_avg", lang) }).style.textAlign = "left";

        const monthly: Record<string, { count: number; chars: number }> = {};

        for (const f of allDiaryFiles) {
            const match = f.name.match(/^(\d{4}-\d{2})/);
            if (match && match[1]) {
                const ym: string = match[1];
                if (!monthly[ym]) monthly[ym] = { count: 0, chars: 0 };
                monthly[ym].count++;
                const content = await this.app.vault.read(f);
                monthly[ym].chars += content.length;
            }
        }

        const rows = Object.entries(monthly).sort((a, b) => b[0].localeCompare(a[0]));
        for (const [ym, data] of rows) {
            const avg = data.count === 0 ? 0 : Math.round(data.chars / data.count);
            const tr = table.createEl("tr");
            tr.createEl("td", { text: ym }).style.borderBottom = "1px solid var(--background-modifier-border)";
            tr.createEl("td", { text: data.count.toString() }).style.borderBottom = "1px solid var(--background-modifier-border)";
            tr.createEl("td", { text: data.chars.toLocaleString() }).style.borderBottom = "1px solid var(--background-modifier-border)";
            tr.createEl("td", { text: avg.toLocaleString() }).style.borderBottom = "1px solid var(--background-modifier-border)";
        }

        // ---- LIST ----
        container.createEl("h1", { text: t("diary_list", lang) });
        const ul = container.createEl("ul");
        ul.style.listStyleType = "none";
        ul.style.paddingLeft = "0";

        for (const f of allDiaryFiles) {
            const li = ul.createEl("li");
            li.style.marginBottom = "0.5em";
            const a = li.createEl("a", { text: f.basename });
            a.style.cursor = "pointer";
            a.onclick = async () => {
                await this.app.workspace.getLeaf(false).openFile(f);
            };

            // Check tags
            const cache = this.app.metadataCache.getFileCache(f);
            if (cache && cache.tags) {
                const tags = cache.tags.map(t => t.tag).join(" ");
                li.createSpan({ text: ` ${tags}` }).style.color = "var(--text-muted)";
            }
        }
    }

    async onClose() {
        // Nothing to clean up
    }
}
