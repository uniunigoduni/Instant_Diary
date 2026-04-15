# Instant Diary for Obsidian

[日本語版 (Japanese Version)](README-ja.md)

Instant Diary is a plugin for Obsidian that allows you to easily create and manage your diary with zero clicks.
It provides an environment where you can focus on writing by offering automatic folder/file creation, automatic handling of day-rollovers, and a convenient management view.

## Key Features

- **Automatic Diary Creation & Display**: Automatically creates and displays the diary for the current day. With the default settings, it automatically opens when Obsidian starts, allowing you to start writing with zero clicks!
- **Management View**: Provides a dedicated view to browse past diaries. Easily accessible from the ribbon icon. When opened in the sidebar, the display is optimized for the sidebar!
- **Automatic File & Folder Organization**: Automatically organizes files within a specified folder in a "Year/Month/Day" structure (see "File Management Specifications" for details).
- **Template Support**: Can automatically apply a specified template file when creating a diary.
- **Multilingual Support**: The management and settings UI supports both English and Japanese.

## File Management Specifications

This plugin manages and organizes files based on the **Root Folder** specified by the user (default: `diary`) according to the following rules:

1. **File Name and Creation Location**
   - Diary files are created in the format `YYYY-MM-DD.md` within the corresponding month's folder `YYYY-MM`.
   - Example: `diary/2026-04/2026-04-15.md` (You can freely add a title after the date.)
2. **Support for Multiple Files on the Same Day**
   - If you manually create a new diary on the same day, a sequential number is automatically added.
   - Example: `2026-04-15 (2).md`
3. **Automatic Archiving of Past Years**
   - When the year changes, the previous year's `YYYY-MM` folders are automatically moved and organized under a `YYYY` (Year) folder.
   - Example: `diary/2025-12/` → automatically moved to `diary/2025/2025-12/`.
   - This prevents the root folder from being cluttered with several years' worth of month folders.

## Commands

The following commands are available from the Command Palette:

- **`Open Diary Management`**: Opens a dedicated view where you can check the diary calendar and list.
- **`Create Today's Diary`**: Creates today's diary (if it already exists, it opens it).

## Settings

- **Language**: Display language for the plugin (English/Japanese).
- **Auto Create Diary**: Automatically creates and opens today's diary when Obsidian starts (and when the day rolls over).
- **Auto Open Today's Diary**: Automatically opens today's diary file on startup.
- **Auto Open Management View**: Automatically opens the diary management view on startup.
- **Open Style**: Select the style for opening the diary (Current tab, New tab, Split right, Split down, New window).
- **Root Folder**: Specify the path to the parent folder where diary files will be saved.
- **Template File**: Path to the template file to use when creating a new diary (e.g., `templates/diary-template.md`).
- **Font Size**: Adjusts the display font size of the management view.

## License

[MIT License](LICENSE)
