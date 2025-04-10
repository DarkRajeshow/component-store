// design.service.ts
import path from 'path';
import fs from 'fs';
// import fsExtra from 'fs-extra';
import mongoose from 'mongoose';
import Design from '../models/Design';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IDesign } from '../types/design.types';

interface TokenPayload {
    userId: string;
}

export class DesignService {
    private readonly __dirname = path.resolve();

    async verifyUser(jwtToken: string): Promise<string> {
        const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as TokenPayload;
        return decodedToken.userId;
    }

    async createDesign(userId: string, designData: Partial<IDesign>): Promise<IDesign> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        const design = new Design({
            user: userId,
            ...designData
        });
        await design.save();

        user.designs.push(design._id as mongoose.Types.ObjectId);
        await user.save();

        return design;
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

    async deleteDesignFiles(folderPath: string, deleteFilesOfPages: string[]): Promise<void> {
        const deletePromises = deleteFilesOfPages.map((filePath) => {
            const [folderName, fileName] = filePath.split('<<&&>>');
            if (!folderName || !fileName) {
                console.warn(`Invalid file structure: ${filePath}`);
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
}