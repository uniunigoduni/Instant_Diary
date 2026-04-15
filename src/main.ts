import { App, Plugin, WorkspaceLeaf, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, InstantDiarySettings, InstantDiarySettingTab } from "./settings";
import { InstantDiaryView, INSTANT_DIARY_VIEW_TYPE } from "./view";
import { createTodayDiary, manageOldYearFolders } from "./diary";
import { t } from "./i18n";

export default class InstantDiaryPlugin extends Plugin {
	settings: InstantDiarySettings;

	async onload() {
		await this.loadSettings();

		// Move old year folders
		this.app.workspace.onLayoutReady(async () => {
			await manageOldYearFolders(this.app, this);

			// Auto create diary if needed
			if (this.settings.autoCreateDiary) {
				await createTodayDiary(this.app, this, true);
			}

			// Auto open management page
			if (this.settings.autoOpenManagement) {
				this.activateView();
			}
		});

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
