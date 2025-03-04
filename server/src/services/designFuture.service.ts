// // src/services/design.service.ts

// import { Types } from 'mongoose';
// import fs from 'fs/promises';
// import path from 'path';
// import Design from '../models/Design';
// import User from '../models/User';
// import {
//     IDesign,
//     CreateDesignDTO,
//     UpdateAttributeDTO,
//     DeleteAttributeDTO,
//     UpdateUnParsedAttributesDTO
// } from '../types/design.types';

// export class DesignService {
//     private readonly __dirname = path.resolve();

//     async createEmptyDesign(userId: string, createDesignDTO: CreateDesignDTO): Promise<IDesign> {
//         const user = await User.findById(userId);
//         if (!user) {
//             throw new Error('User not found');
//         }

//         const design = new Design({
//             user: userId,
//             ...createDesignDTO
//         });

//         await design.save();
//         user.designs.push(design._id);
//         await user.save();

//         return design;
//     }

//     async addNewAttribute(designId: string, userId: string, updateDTO: UpdateAttributeDTO): Promise<IDesign> {
//         const design = await this.validateDesignOwnership(designId, userId);
//         design.structure = updateDTO.structure;
//         return await design.save();
//     }

//     async deleteAttributes(designId: string, userId: string, deleteDTO: DeleteAttributeDTO): Promise<IDesign> {
//         const design = await this.validateDesignOwnership(designId, userId);
//         const folderPath = path.join(this.__dirname, 'public', 'uploads', design.folder);

//         await this.deleteFilesRecursively(folderPath, deleteDTO.filesToDelete);

//         design.structure = deleteDTO.structure;
//         return await design.save();
//     }

//     async getRecentDesigns(limit: number = 20): Promise<IDesign[]> {
//         return await Design.find()
//             .sort({ createdAt: -1 })
//             .limit(limit);
//     }

//     async getUserDesigns(userId: string, limit: number = 20): Promise<IDesign[]> {
//         const user = await User.findById(userId)
//             .populate({
//                 path: 'designs',
//                 options: {
//                     sort: { createdAt: -1 },
//                     limit
//                 }
//             });

//         if (!user) {
//             throw new Error('User not found');
//         }

//         return user.designs;
//     }

//     async getDesignById(designId: string): Promise<IDesign> {
//         const design = await Design.findById(designId).populate('user');
//         if (!design) {
//             throw new Error('Design not found');
//         }
//         return design;
//     }

//     async deleteDesignById(designId: string): Promise<void> {
//         const design = await Design.findById(designId);
//         if (!design) {
//             throw new Error('Design not found');
//         }

//         const folderPath = path.join(this.__dirname, 'public', 'uploads', design.folder);
//         await Design.findByIdAndDelete(designId);

//         try {
//             await fs.rm(folderPath, { recursive: true });
//         } catch (error) {
//             console.error(`Error deleting folder: ${folderPath}`, error);
//         }
//     }

//     private async validateDesignOwnership(designId: string, userId: string): Promise<IDesign> {
//         const design = await Design.findById(designId);
//         if (!design) {
//             throw new Error('Design not found');
//         }
//         if (design.user.toString() !== userId) {
//             throw new Error('Unauthorized');
//         }
//         return design;
//     }

//     private async deleteFilesRecursively(dirPath: string, filesToDelete: string[]): Promise<void> {
//         try {
//             const items = await fs.readdir(dirPath, { withFileTypes: true });

//             for (const item of items) {
//                 const itemPath = path.join(dirPath, item.name);

//                 if (item.isDirectory()) {
//                     await this.deleteFilesRecursively(itemPath, filesToDelete);
//                 } else if (item.isFile()) {
//                     for (const fileName of filesToDelete) {
//                         if (item.name === `${fileName}.svg`) {
//                             try {
//                                 await fs.unlink(itemPath);
//                                 console.log(`Deleted: ${itemPath}`);
//                             } catch (err) {
//                                 console.error(`Error deleting file ${itemPath}:`, err);
//                             }
//                         }
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error(`Error accessing directory: ${dirPath}`, error);
//         }
//     }
// }

// export const designService = new DesignService();