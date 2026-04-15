import { App, PluginSettingTab, Setting } from "obsidian";
import InstantDiaryPlugin from "./main";
import { t } from "./i18n";
import { InstantDiaryView, INSTANT_DIARY_VIEW_TYPE } from "./view";

export interface InstantDiarySettings {
	language: "en" | "ja";
	autoCreateDiary: boolean;
	autoOpenTodayDiary: boolean;
	autoOpenManagement: boolean;
	openStyle: "current" | "new-tab" | "split-right" | "split-down" | "new-window";
	rootFolder: string;
	templateFile: string;
	fontSize: number;
}

export const DEFAULT_SETTINGS: InstantDiarySettings = {
	language: "en",
	autoCreateDiary: true,
	autoOpenTodayDiary: true,
	autoOpenManagement: false,
	openStyle: "new-tab",
	rootFolder: "diary",
	templateFile: "",
	fontSize: 16,
};

export class InstantDiarySettingTab extends PluginSettingTab {
	plugin: InstantDiaryPlugin;

	constructor(app: App, plugin: InstantDiaryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(t("setting_language_name", this.plugin.settings.language))
			.setDesc(t("setting_language_desc", this.plugin.settings.language))
			.addDropdown((dropdown) => {
				dropdown
					.addOption("en", "English")
					.addOption("ja", "日本語")
					.setValue(this.plugin.settings.language)
					.onChange(async (value: "en" | "ja") => {
						this.plugin.settings.language = value;
						await this.plugin.saveSettings();
						this.display(); // Refresh to update language
					});
			});

		new Setting(containerEl)
			.setName(t("setting_autocreate_name", this.plugin.settings.language))
			.setDesc(t("setting_autocreate_desc", this.plugin.settings.language))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoCreateDiary)
					.onChange(async (value) => {
						this.plugin.settings.autoCreateDiary = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t("setting_autoopentoday_name", this.plugin.settings.language))
			.setDesc(t("setting_autoopentoday_desc", this.plugin.settings.language))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoOpenTodayDiary)
					.onChange(async (value) => {
						this.plugin.settings.autoOpenTodayDiary = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t("setting_autoopen_name", this.plugin.settings.language))
			.setDesc(t("setting_autoopen_desc", this.plugin.settings.language))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoOpenManagement)
					.onChange(async (value) => {
						this.plugin.settings.autoOpenManagement = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t("setting_openstyle_name", this.plugin.settings.language))
			.setDesc(t("setting_openstyle_desc", this.plugin.settings.language))
			.addDropdown((dropdown) => {
				dropdown
					.addOption("current", t("openstyle_current", this.plugin.settings.language))
					.addOption("new-tab", t("openstyle_new_tab", this.plugin.settings.language))
					.addOption("split-right", t("openstyle_split_right", this.plugin.settings.language))
					.addOption("split-down", t("openstyle_split_down", this.plugin.settings.language))
					.addOption("new-window", t("openstyle_new_window", this.plugin.settings.language))
					.setValue(this.plugin.settings.openStyle)
					.onChange(async (value: "current" | "new-tab" | "split-right" | "split-down" | "new-window") => {
						this.plugin.settings.openStyle = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t("setting_rootfolder_name", this.plugin.settings.language))
			.setDesc(t("setting_rootfolder_desc", this.plugin.settings.language))
			.addText((text) => {
				text
					.setPlaceholder("Myjourney/diary")
					.setValue(this.plugin.settings.rootFolder)
					.onChange(async (value) => {
						this.plugin.settings.rootFolder = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t("setting_template_name", this.plugin.settings.language))
			.setDesc(t("setting_template_desc", this.plugin.settings.language))
			.addText((text) => {
				text
					.setPlaceholder("templates/diary-template.md")
					.setValue(this.plugin.settings.templateFile)
					.onChange(async (value) => {
						this.plugin.settings.templateFile = value;
						await this.plugin.saveSettings();
					});
			});

		// Font Size Setting with Preview
		const fontSizeSetting = new Setting(containerEl)
			.setName(t("setting_fontsize_name", this.plugin.settings.language))
			.setDesc(t("setting_fontsize_desc", this.plugin.settings.language));

		const previewContainer = fontSizeSetting.controlEl.createDiv({ cls: "instant-diary-preview-container" });

		const previewText = previewContainer.createSpan({
			text: t("fontsize_preview", this.plugin.settings.language),
			cls: "instant-diary-preview-text"
		});
		previewText.style.setProperty('--instant-diary-font-size', `${this.plugin.settings.fontSize}px`);

		fontSizeSetting.addSlider((slider) => {
			slider
				.setLimits(10, 40, 1)
				.setValue(this.plugin.settings.fontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.fontSize = value;
					previewText.style.setProperty('--instant-diary-font-size', `${value}px`);
					await this.plugin.saveSettings();

					// Update existing views immediately
					const leaves = this.app.workspace.getLeavesOfType(INSTANT_DIARY_VIEW_TYPE);
					for (const leaf of leaves) {
						if (leaf.view instanceof InstantDiaryView) {
							leaf.view.updateFontSize(value);
						}
					}
				});
		});
	}
}
