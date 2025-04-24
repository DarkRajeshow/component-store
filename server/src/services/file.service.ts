import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/AppError';

export class FileService {
    private readonly uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
        this.ensureUploadDirExists();
    }

    async ensureUploadDirExists(): Promise<void> {
        await fs.ensureDir(this.uploadDir);
    }

    getProjectPath(projectFolder: string): string {
        return path.join(this.uploadDir, 'projects', projectFolder);
    }

    getDesignPath(designFolder: string): string {
        return path.join(this.uploadDir, 'designs', designFolder);
    }

    getCategoryPath(projectFolder: string, categoryId: string): string {
        return path.join(this.getProjectPath(projectFolder), categoryId);
    }

    getDesignPageFolderPath(projectFolder: string, pageId: string): string {
        return path.join(this.getDesignPath(projectFolder), pageId);
    }

    getProjectPageFolderPath(projectFolder: string, categoryId: string, pageId: string): string {
        return path.join(this.getCategoryPath(projectFolder, categoryId), pageId);
    }


    async handleFiles(projectFolder: string, files: Express.Multer.File[]): Promise<void> {
        try {
            const projectPath = this.getProjectPath(projectFolder);
            await fs.ensureDir(projectPath);

            for (const file of files) {
                const filePath = path.join(projectPath, file.filename);
                await fs.move(file.path, filePath);
            }
        } catch (error) {
            throw new AppError('Failed to handle files', 500);
        }
    }

    async saveFile(file: Express.Multer.File): Promise<string> {
        try {
            const fileId = uuidv4();
            const fileExt = path.extname(file.originalname);
            const fileName = `${fileId}${fileExt}`;
            await fs.move(file.path, path.join(this.uploadDir, fileName));
            return fileId;
        } catch (error) {
            throw new AppError('Failed to save file', 500);
        }
    }

    async createPageFolder(): Promise<string> {
        const pageId = uuidv4();
        await fs.ensureDir(path.join(this.uploadDir, pageId));
        return pageId;
    }

    async deleteProjectFolder(projectFolder: string): Promise<void> {
        try {
            const projectPath = this.getProjectPath(projectFolder);
            await fs.remove(projectPath);
        } catch (error) {
            throw new AppError('Failed to delete project folder', 500);
        }
    }

    async deleteDesignFolder(projectFolder: string): Promise<void> {
        try {
            const projectPath = this.getProjectPath(projectFolder);
            await fs.remove(projectPath);
        } catch (error) {
            throw new AppError('Failed to delete project folder', 500);
        }
    }

    async deleteCategoryFolder(projectFolder: string, categoryId: string): Promise<void> {
        try {
            const categoryPath = this.getCategoryPath(projectFolder, categoryId);
            await fs.remove(categoryPath);
        } catch (error) {
            throw new AppError('Failed to delete category folder', 500);
        }
    }

    async deleteFile(fileId: string): Promise<void> {
        try {
            const filePath = path.join(this.uploadDir, fileId);
            await fs.remove(filePath);
        } catch (error) {
            throw new AppError('Failed to delete file', 500);
        }
    }

    async deleteProjectPageFolder(projectFolder: string, categoryId: string, pageFolderId: string): Promise<void> {
        try {
            const pagePath = this.getProjectPageFolderPath(projectFolder, categoryId, pageFolderId);
            await fs.remove(pagePath);
        } catch (error) {
            throw new AppError('Failed to delete page folder', 500);
        }
    }

    async deleteDesignPageFolder(designFolder: string, pageFolderId: string): Promise<void> {
        try {
            const pagePath = path.join(
                this.getDesignPath(designFolder),
                pageFolderId
            );
            await fs.remove(pagePath);
        } catch (error) {
            throw new AppError('Failed to delete page folder', 500);
        }
    }

    async deleteFilesRecursively(dirPath: string, filesToDelete: string[]): Promise<void> {
        if (!fs.existsSync(dirPath)) {
            console.warn(`Directory does not exist: ${dirPath}`);
            return;
        }

        const items = await fs.promises.readdir(dirPath, { withFileTypes: true });

        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);

            if (item.isDirectory()) {
                await this.deleteFilesRecursively(itemPath, filesToDelete);
            } else if (item.isFile()) {
                for (const fileName of filesToDelete) {
                    if (item.name === `${fileName}.svg`) {
                        try {
                            await fs.promises.unlink(itemPath);
                            console.log(`Deleted: ${itemPath}`);
                        } catch (err) {
                            console.error(`Error deleting file ${itemPath}:`, err);
                        }
                    }
                }
            }
        }
    }

    async deleteFiles(folderPath: string, deleteFilesOfPages: string[]): Promise<void> {
        const deletePromises = deleteFilesOfPages.map((filePath) => {
            const [folderName, fileName] = filePath.split('<<&&>>');
            if (!folderName || !fileName) {
                console.warn(`Invalid file structure: ${filePath}/`);
                return Promise.resolve();
            }

            const fullFilePath = path.join(folderPath, folderName, `${fileName}.svg`);
            return new Promise<void>((resolve) => {
                fs.unlink(fullFilePath, (err) => {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            console.warn(`File not found: ${fullFilePath}`);
                        } else {
                            console.error(`Error deleting file: ${fullFilePath}`, err);
                        }
                    } else {
                        console.log(`Deleted file: ${fullFilePath}`);
                    }
                    resolve();
                });
            });
        });

        await Promise.all(deletePromises);
    }

    async deleteDesignFiles(folderPath: string): Promise<void> {
        try {
            const exists = await fs.pathExists(folderPath);
            if (!exists) {
                throw new AppError('Folder does not exist', 404);
            }
            await fs.remove(folderPath);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to delete design files', 500);
        }
    }

    // Add this method inside the DesignService class
    async copyFolderContents(
        sourcePath: string,
        destinationPath: string
    ): Promise<boolean> {
        try {
            // Ensure source directory exists
            if (!await fs.pathExists(sourcePath)) {
                throw new AppError('Source category folder does not exist', 404);
            }

            // Ensure destination directory exists, create if not
            await fs.ensureDir(destinationPath);

            // Copy contents using fs-extra (preserves file attributes and handles existing files)
            await fs.copy(sourcePath, destinationPath, {
                overwrite: true,
                errorOnExist: false,
                preserveTimestamps: true
            });

            return true;
        } catch (error) {
            console.error('Error copying folder contents:', error);
            throw new AppError('Failed to copy folder contents', 500);
        }
    }
}

export default new FileService();