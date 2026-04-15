import { App, Plugin, WorkspaceLeaf, Notice, moment, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, InstantDiarySettings, InstantDiarySettingTab } from "./settings";
import { InstantDiaryView, INSTANT_DIARY_VIEW_TYPE } from "./view";
import { createTodayDiary, manageOldYearFolders, openFile } from "./diary";
import { t } from "./i18n";

export default class InstantDiaryPlugin extends Plugin {
	settings: InstantDiarySettings;
	lastCheckedDate: string;

	async onload() {
		await this.loadSettings();
		this.lastCheckedDate = moment().format("YYYY-MM-DD");

		// Move old year folders
		this.app.workspace.onLayoutReady(async () => {
			await manageOldYearFolders(this.app, this);

			// Auto open management page first
			if (this.settings.autoOpenManagement) {
				await this.activateView();
			}

			// Auto create and open diary after, so it remains active
			await this.checkAndProcessTodayDiary();
		});

		// Check for date change every minute
		this.registerInterval(window.setInterval(async () => {
			const currentDate = moment().format("YYYY-MM-DD");
			if (currentDate !== this.lastCheckedDate) {
				this.lastCheckedDate = currentDate;
				await this.checkAndProcessTodayDiary();
			}
		}, 60 * 1000));

		// Register View
		this.registerView(
			INSTANT_DIARY_VIEW_TYPE,
			(leaf) => new InstantDiaryView(leaf, this)
		);

		// Ribbon Icon
		this.addRibbonIcon('calendar-days', t("ribbon_icon_name", this.settings.language), (evt: MouseEvent) => {
			this.activateView();
		});

		// Command Palette
		this.addCommand({
			id: 'open-instant-diary-view',
			name: 'Open Diary Management',
			callback: () => {
				this.activateView();
			}
		});

		this.addCommand({
			id: 'create-today-diary',
			name: 'Create Today\'s Diary',
			callback: async () => {
				await createTodayDiary(this.app, this, true);
			}
		});

		// Settings Tab
		this.addSettingTab(new InstantDiarySettingTab(this.app, this));
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(INSTANT_DIARY_VIEW_TYPE);

		if (leaves.length > 0) {
			leaf = leaves[0] as WorkspaceLeaf;
		} else {
			leaf = workspace.getLeaf(true) as WorkspaceLeaf; // new tab
			await leaf.setViewState({ type: INSTANT_DIARY_VIEW_TYPE, active: true });
		}

		if (leaf) workspace.revealLeaf(leaf);
	}

	async checkAndProcessTodayDiary() {
		if (this.settings.autoCreateDiary) {
			await createTodayDiary(this.app, this, true);
		} else if (this.settings.autoOpenTodayDiary) {
			// If not auto-creating but auto-opening is enabled, check if today's diary exists
			const today = moment().format("YYYY-MM-DD");
			const monthFolder = moment().format("YYYY-MM");
			const rootFolder = this.settings.rootFolder || "diary";
			const dailyFilePath = `${rootFolder}/${monthFolder}/${today}.md`;

			const file = this.app.vault.getAbstractFileByPath(dailyFilePath);
			if (file && file instanceof TFile) {
				await openFile(this.app, this, file);
			}
		}
	}

	onunload() {
		// Cleanup
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
