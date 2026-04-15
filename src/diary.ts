import { App, Notice, TFile, TFolder, moment } from "obsidian";
import type InstantDiaryPlugin from "./main";

export async function manageOldYearFolders(app: App, plugin: InstantDiaryPlugin) {
    const rootFolder = plugin.settings.rootFolder;
    const rootAbstract = app.vault.getAbstractFileByPath(rootFolder);

    if (!rootAbstract || !(rootAbstract instanceof TFolder)) {
        return;
    }

    const currentYear = moment().format("YYYY");

    for (const child of rootAbstract.children) {
        // Look for YYYY-MM folders
        if (child instanceof TFolder && /^\d{4}-\d{2}$/.test(child.name)) {
            const folderYear = child.name.substring(0, 4);
            // If folder year is older than current year
            if (folderYear < currentYear) {
                const yearFolderPath = `${rootFolder}/${folderYear}`;
                // Create YYYY folder if it doesn't exist
                const yearFolderAbstract = app.vault.getAbstractFileByPath(yearFolderPath);
                if (!yearFolderAbstract) {
                    await app.vault.createFolder(yearFolderPath);
                }

                // Move YYYY-MM folder inside YYYY folder
                const newPath = `${yearFolderPath}/${child.name}`;
                if (!app.vault.getAbstractFileByPath(newPath)) {
                    await app.fileManager.renameFile(child, newPath);
                }
            }
        }
    }
}

export async function createTodayDiary(app: App, plugin: InstantDiaryPlugin, openAfterCreate: boolean = true) {
    const today = moment().format("YYYY-MM-DD");
    const monthFolder = moment().format("YYYY-MM");
    const rootFolder = plugin.settings.rootFolder || "diary";
    const folderPath = `${rootFolder}/${monthFolder}`;
    const dailyFilePath = `${folderPath}/${today}.md`;

    // Ensure root folder exists
    if (!app.vault.getAbstractFileByPath(rootFolder)) {
        await app.vault.createFolder(rootFolder);
    }

    // Ensure month folder exists
    if (!app.vault.getAbstractFileByPath(folderPath)) {
        await app.vault.createFolder(folderPath);
    }

    // Check if today's file exists
    let file = app.vault.getAbstractFileByPath(dailyFilePath) as TFile | null;

    if (!file) {
        // Check for template
        let content = "";
        const templatePath = plugin.settings.templateFile;
        if (templatePath) {
            const templateFile = app.vault.getAbstractFileByPath(templatePath);
            if (templateFile && templateFile instanceof TFile) {
                content = await app.vault.read(templateFile);
            }
        }

        try {
            file = await app.vault.create(dailyFilePath, content);
            new Notice(`Created today's diary: ${today}.md`);
        } catch (e) {
            console.error("Instant Diary: Failed to create diary file", e);
            return;
        }
    }

    if (openAfterCreate && file) {
        await openFile(app, plugin, file);
    }
}

export async function createNewDiaryManually(app: App, plugin: InstantDiaryPlugin) {
    const today = moment().format("YYYY-MM-DD");
    const monthFolder = moment().format("YYYY-MM");
    const rootFolder = plugin.settings.rootFolder || "diary";
    const folderPath = `${rootFolder}/${monthFolder}`;

    if (!app.vault.getAbstractFileByPath(rootFolder)) {
        await app.vault.createFolder(rootFolder);
    }
    if (!app.vault.getAbstractFileByPath(folderPath)) {
        await app.vault.createFolder(folderPath);
    }

    // Find existing files for today to append suffix if necessary
    const existingFiles = [];
    const folder = app.vault.getAbstractFileByPath(folderPath);
    if (folder instanceof TFolder) {
        for (const child of folder.children) {
            if (child instanceof TFile && child.name.startsWith(today) && child.extension === "md") {
                existingFiles.push(child);
            }
        }
    }

    let newFileName = `${today}.md`;
    if (existingFiles.length > 0) {
        // If exactly 1 file named today.md exists, we append (2)
        // Or we just find the max suffix
        let maxSuffix = 0;
        for (const f of existingFiles) {
            if (f.name === `${today}.md`) {
                maxSuffix = Math.max(maxSuffix, 1);
            } else {
                const match = f.name.match(new RegExp(`${today} \\((\\d+)\\)\\.md`));
                if (match && match[1]) {
                    maxSuffix = Math.max(maxSuffix, parseInt(match[1]));
                }
            }
        }
        if (maxSuffix > 0) {
            newFileName = `${today} (${maxSuffix + 1}).md`;
        }
    }

    const dailyFilePath = `${folderPath}/${newFileName}`;

    let content = "";
    const templatePath = plugin.settings.templateFile;
    if (templatePath) {
        const templateFile = app.vault.getAbstractFileByPath(templatePath);
        if (templateFile && templateFile instanceof TFile) {
            content = await app.vault.read(templateFile);
        }
    }

    try {
        const file = await app.vault.create(dailyFilePath, content);
        new Notice(`Created new diary: ${newFileName}`);
        await openFile(app, plugin, file);
    } catch (e) {
        console.error("Instant Diary: Failed to create manual diary file", e);
    }
}

export async function openFile(app: App, plugin: InstantDiaryPlugin, file: TFile) {
    const openStyle = plugin.settings.openStyle;
    const workspace = app.workspace;

    if (openStyle === "current") {
        await workspace.getLeaf(false).openFile(file);
    } else if (openStyle === "new-tab") {
        await workspace.getLeaf("tab").openFile(file);
    } else if (openStyle === "split-right") {
        await workspace.getLeaf("split", "vertical").openFile(file);
    } else if (openStyle === "split-down") {
        await workspace.getLeaf("split", "horizontal").openFile(file);
    } else if (openStyle === "new-window") {
        await workspace.getLeaf("window").openFile(file);
    } else {
        // Fallback
        await workspace.getLeaf("tab").openFile(file);
    }
}
