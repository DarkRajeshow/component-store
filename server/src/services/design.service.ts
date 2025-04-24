// src/services/Design.service.ts
import mongoose, { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import Design from '../models/design.model';
import { IDesign, IStructure } from '../types/design.types';
import { FileService } from './file.service';
import { AppError } from '../utils/AppError';
import parseIfUnparsed from '../utils/parseIfUnparsed';
import userService from './user.service';
import projectService from './project.service';
import { v4 as uuidv4 } from 'uuid';

interface TokenPayload {
    userId: string;
}

interface SaveResponse {
    success: boolean;
    status: string;
    design?: IDesign;
}

export class DesignService {
    public fileService: FileService;

    constructor() {
        this.fileService = new FileService();
    }

    async verifyUser(jwtToken: string): Promise<string> {
        const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as TokenPayload;
        return decodedToken.userId;
    }

    async findDesignAndVerifyUser(designId: string, userId: string): Promise<IDesign | null> {
        const design = await Design.findById(designId);
        if (!design) return null;
        if (design.user.toString() !== userId) {
            throw new AppError('Unauthorized access', 403);
        }
        return design;
    }

    async createDesign(userId: string, designData: Partial<IDesign>): Promise<IDesign> {
        try {
            const design = new Design({
                ...designData,
                user: userId
            });
            await design.save();

            userService.addDesignToUser(userId, design._id as unknown as Types.ObjectId);
            projectService.addDesignToProject(designData.project as string, design._id as Types.ObjectId);
            if (designData.sourceDesign) {
                this.addDesignToDesign(designData.sourceDesign as string, design._id as Types.ObjectId);
            }

            return design;
        } catch (error) {
            throw new AppError('Failed to create design', 500);
        }
    }

    async getUserDesigns(userId: string): Promise<IDesign[]> {
        try {
            return await Design.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(20);
        } catch (error) {
            throw new AppError('Failed to fetch user designs', 500);
        }
    }

    async handleStructureUpdate(
        id: string,
        userId: string,
        structure: IStructure | undefined,
        errorMessage: string = 'Updated Structure is missing'
    ) {
        const design = await this.findDesignAndVerifyUser(id, userId);
        if (!design) {
            return { success: false, message: 'Design not found or unauthorized' };
        }

        if (!structure) {
            return { success: false, message: errorMessage };
        }

        const parsedStructure = parseIfUnparsed(structure) as IStructure;
        design.structure = parsedStructure;
        design.markModified("structure")
        await design.save();
        return { success: true, design };
    }

    async deleteDesign(designId: string, userId: Types.ObjectId): Promise<void> {
        try {
            const design = await Design.findOne({ _id: designId, user: userId });
            if (!design) {
                throw new AppError('Design not found', 404);
            }

            // await this.fileService.deleteDesignFolder(design.folder);
            await Design.deleteOne({ _id: designId });
        } catch (error) {
            throw new AppError('Failed to delete design', 500);
        }
    }

    // async addComponent(
    //     structure: IStructure,
    //     categoryId: string,
    //     componentName: string,
    //     isNested: boolean,
    //     file: Express.Multer.File
    // ): Promise<IStructure> {
    //     const fileId = await this.fileService.saveFile(file);
    //     const component = isNested
    //         ? { selected: '', options: {} }
    //         : { fileId };

    //     structure.components[componentName] = component;
    //     return structure;
    // }

    async addPage(
        structure: IStructure,
        pageName: string,
    ): Promise<IStructure> {
        const pageId = uuidv4();
        structure.pages[pageName] = pageId;
        return structure;
    }

    async updateBaseDrawing(
        structure: IStructure,
        categoryId: string,
        file: Express.Multer.File
    ): Promise<IStructure> {
        const fileId = await this.fileService.saveFile(file);
        structure.baseDrawing.fileId = fileId;
        return structure;
    }

    async addDesignToDesign(sourceDesign: string, designId: mongoose.Types.ObjectId): Promise<SaveResponse> {
        try {
            const design = await Design.findByIdAndUpdate(
                sourceDesign,
                { $addToSet: { derivedDesigns: designId } },
                { new: true }
            );

            if (!design) {
                return { success: false, status: 'Design not found' };
            }

            return {
                success: true,
                status: 'Project added to user successfully',
                design
            };
        } catch (error) {
            console.error('Error adding project to user:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }

    // Add this method inside the DesignService class
    async copyProjectFolderContents(
        projectFolder: string,
        categoryFolder: string,
        designFolder: string
    ): Promise<boolean> {
        try {
            // Construct full paths
            const sourcePath = this.fileService.getCategoryPath(projectFolder, categoryFolder);
            const destinationPath = this.fileService.getDesignPath(designFolder);
            const response = this.fileService.copyFolderContents(sourcePath, destinationPath);
            return response;
        } catch (error) {
            console.error('Error copying folder contents:', error);
            throw new AppError('Failed to copy folder contents', 500);
        }
    }

    async copyDesignFolderContents(
        sourceDesignFolder: string,
        designFolder: string
    ): Promise<boolean> {
        try {
            // Construct full paths
            const sourcePath = this.fileService.getDesignPath(sourceDesignFolder);
            const destinationPath = this.fileService.getDesignPath(designFolder);
            const response = this.fileService.copyFolderContents(sourcePath, destinationPath);
            return response;
        } catch (error) {
            console.error('Error copying folder contents:', error);
            throw new AppError('Failed to copy folder contents', 500);
        }
    }

}

export default new DesignService();