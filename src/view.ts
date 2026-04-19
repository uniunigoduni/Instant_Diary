import { ItemView, WorkspaceLeaf, TFile, moment, TFolder, Setting } from "obsidian";
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

    updateFontSize(size: number) {
        this.contentEl.style.setProperty('--instant-diary-font-size', `${size}px`);
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();
        container.addClass("instant-diary-view");

        // Apply font size
        this.updateFontSize(this.plugin.settings.fontSize);

        const lang = this.plugin.settings.language;

        // Button to create today's diary
        const contentArea = container.createEl("div");

        if (!this.plugin.settings.simpleMode) {
            const btnContainer = container.createEl("div", { cls: "instant-diary-btn-container" });
            const btn = btnContainer.createEl("button");
            btn.createSpan({ text: t("create_today", lang) });
            btn.createSpan({ text: ` (${moment().format("YYYY-MM-DD")})`, cls: "instant-diary-btn-date" });

            btn.onclick = () => {
                void (async () => {
                    await createNewDiaryManually(this.app, this.plugin);
                    await this.renderListsAndStats(contentArea); // Refresh
                })();
            };
            container.insertBefore(btnContainer, contentArea);
        }

        // Placeholder for stats and lists
        await this.renderListsAndStats(contentArea);
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

        // ---- STATS & STREAK ----
        if (!this.plugin.settings.simpleMode) {
            const detailsEl = container.createEl("details", { cls: "instant-diary-section" });

            const summaryEl = detailsEl.createEl("summary", { cls: "instant-diary-summary" });

            const h1Stats = summaryEl.createEl("div", { cls: "instant-diary-stats-summary-text" });
            new Setting(h1Stats).setName(t("diary_stats", lang)).setHeading();

            const clickText = lang === "ja" ? "（クリックして表示）" : " (Click to show)";
            h1Stats.createSpan({ text: clickText, cls: "instant-diary-stats-click-text" });

            const statsLayout = detailsEl.createEl("div", { cls: "instant-diary-stats-layout" });

            const table = statsLayout.createEl("table", { cls: "instant-diary-month-table" });

            const trHeader = table.createEl("tr");
            trHeader.createEl("th", { text: t("stats_month", lang) });
            trHeader.createEl("th", { text: t("stats_count", lang) });
            trHeader.createEl("th", { text: t("stats_chars", lang) });
            trHeader.createEl("th", { text: t("stats_avg", lang) });

            const monthly: Record<string, { count: number; chars: number }> = {};
            const validDates = new Set<string>();

            for (const f of allDiaryFiles) {
                const match = f.name.match(/^(\d{4}-\d{2}-\d{2})/);
                if (match && match[1]) {
                    const dateStr = match[1];
                    const content = await this.app.vault.read(f);

                    if (content.trim().length > 0) {
                        validDates.add(dateStr);
                    }

                    const ym = dateStr.substring(0, 7);
                    if (!monthly[ym]) monthly[ym] = { count: 0, chars: 0 };
                    monthly[ym].count++;
                    monthly[ym].chars += content.length;
                }
            }

            const rows = Object.entries(monthly).sort((a, b) => b[0].localeCompare(a[0]));
            for (const [ym, data] of rows) {
                const avg = data.count === 0 ? 0 : Math.round(data.chars / data.count);
                const tr = table.createEl("tr");
                tr.createEl("td", { text: ym });
                tr.createEl("td", { text: data.count.toString() });
                tr.createEl("td", { text: data.chars.toLocaleString() });
                tr.createEl("td", { text: avg.toLocaleString() });
            }

            // Calculate Streak
            let streak = 0;
            let checkDate = moment().subtract(1, 'days');
            while (validDates.has(checkDate.format("YYYY-MM-DD"))) {
                streak++;
                checkDate.subtract(1, 'days');
            }
            if (validDates.has(moment().format("YYYY-MM-DD"))) {
                streak++;
            }

            const streakCard = statsLayout.createEl("div", { cls: "instant-diary-streak-card" });
            streakCard.createEl("div", { cls: "instant-diary-streak-title", text: t("streak_title", lang) });
            const streakValueContainer = streakCard.createEl("div");
            streakValueContainer.createEl("span", { cls: "instant-diary-streak-value", text: streak.toString() });
            streakValueContainer.createEl("span", { cls: "instant-diary-streak-label", text: t("streak_days", lang) });
        }

        // ---- LIST ----
        const listSection = container.createEl("div");
        if (!this.plugin.settings.simpleMode) {
            listSection.addClass("instant-diary-section");
        } else {
            listSection.addClass("instant-diary-simple-section");
        }

        const listSetting = new Setting(listSection).setName(t("diary_list", lang)).setHeading();

        if (this.plugin.settings.simpleMode) {
            listSetting.addButton(cb => {
                cb.setButtonText("+")
                    .setTooltip(t("create_today", lang))
                    .onClick(() => {
                        void (async () => {
                            await createNewDiaryManually(this.app, this.plugin);
                            await this.renderListsAndStats(container); // Refresh
                        })();
                    });
            });
        }

        const ul = listSection.createEl("ul", { cls: "instant-diary-list" });

        for (const f of allDiaryFiles) {
            const li = ul.createEl("li");
            const a = li.createEl("a", { text: f.basename, cls: "instant-diary-link" });

            // Prevent auto-scroll mode on middle click
            a.addEventListener("mousedown", (e: MouseEvent) => {
                if (e.button === 1) {
                    e.preventDefault();
                }
            });

            a.onclick = (e: MouseEvent) => {
                void (async () => {
                    const newLeaf = e.ctrlKey || e.metaKey;
                    await this.app.workspace.getLeaf(newLeaf).openFile(f, { active: !newLeaf });
                })();
            };
            a.onauxclick = (e: MouseEvent) => {
                if (e.button === 1) { // Middle click
                    e.preventDefault();
                    void (async () => {
                        await this.app.workspace.getLeaf(true).openFile(f, { active: false });
                    })();
                }
            };

            // Check tags
            const cache = this.app.metadataCache.getFileCache(f);
            if (cache && cache.tags) {
                const tags = cache.tags.map(t => t.tag).join(" ");
                li.createSpan({ text: tags, cls: "instant-diary-tag-span" });
            }
        }
    }

    async onClose() {
        // Nothing to clean up
        await Promise.resolve();
    }
}
