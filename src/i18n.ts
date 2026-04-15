export const en = {
    setting_language_name: "Language",
    setting_language_desc: "Choose the display language for the plugin.",
    setting_autocreate_name: "Auto-create Diary",
    setting_autocreate_desc: "Automatically create today's diary if it doesn't exist when Obsidian starts.",
    setting_autoopen_name: "Auto-open Management Page",
    setting_autoopen_desc: "Automatically open the Diary Management page when Obsidian starts.",
    setting_openstyle_name: "Diary Open Style",
    setting_openstyle_desc: "Choose how to open the automatically created diary.",
    openstyle_current: "Current Tab",
    openstyle_new_tab: "New Tab",
    openstyle_split_right: "Split Right",
    openstyle_split_down: "Split Down",
    openstyle_new_window: "New Window",
    setting_rootfolder_name: "Root Folder",
    setting_rootfolder_desc: "The folder where diaries will be created. Default is 'diary'.",
    setting_template_name: "Template File",
    setting_template_desc: "Path to the template file for new diaries (e.g., templates/diary.md). Leave empty for none.",
    ribbon_icon_name: "Instant Diary Management",
    management_title: "Diary Management",
    create_today: "Create Today's Diary",
    diary_list: "Diary List",
    diary_stats: "Monthly Stats",
    stats_month: "Month",
    stats_count: "Count",
    stats_chars: "Total Chars",
    stats_avg: "Avg Chars",
};

export const ja = {
    setting_language_name: "言語",
    setting_language_desc: "プラグインの表示言語を選択します。",
    setting_autocreate_name: "日記の自動作成",
    setting_autocreate_desc: "Obsidian起動時に今日の日記が存在しない場合、自動で作成します。",
    setting_autoopen_name: "管理ページの自動オープン",
    setting_autoopen_desc: "Obsidian起動時に自動で日記管理ページを開きます。",
    setting_openstyle_name: "自動作成した日記の開き方",
    setting_openstyle_desc: "自動作成した日記をどの形式で開くか選択します。",
    openstyle_current: "現在のタブ",
    openstyle_new_tab: "新しいタブ",
    openstyle_split_right: "左右に分割 (右)",
    openstyle_split_down: "上下に分割 (下)",
    openstyle_new_window: "新しいウィンドウ",
    setting_rootfolder_name: "ルートフォルダ",
    setting_rootfolder_desc: "日記を作成する基準となるフォルダです。デフォルトは 'diary' です。",
    setting_template_name: "テンプレートファイル",
    setting_template_desc: "新規作成する日記のテンプレートファイルパスを指定します（例: templates/diary.md）。空の場合は空のファイルが作成されます。",
    ribbon_icon_name: "Instant Diary 管理ページ",
    management_title: "日記管理",
    create_today: "今日の日記を新規作成",
    diary_list: "日記一覧",
    diary_stats: "月ごとの日記統計",
    stats_month: "月",
    stats_count: "件数",
    stats_chars: "合計文字数",
    stats_avg: "平均文字数",
};

export type Lang = "en" | "ja";

export function t(key: keyof typeof en, lang: Lang): string {
    const strings = lang === "ja" ? ja : en;
    return strings[key] || en[key];
}
