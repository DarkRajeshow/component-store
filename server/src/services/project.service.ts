// src/services/project.service.ts
import mongoose, { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import Project from '../models/Project';
import { IProject, IHierarchy, ICategories, ICategoryData } from '../types/project.types';
import { FileService } from './file.service';
import { AppError } from '../utils/AppError';
import userService from './user.service';
import parseIfUnparsed from '../utils/parseIfUnparsed';
import { v4 as uuidv4 } from 'uuid';

interface TokenPayload {
    userId: string;
}

interface SaveResponse {
    success: boolean;
    status: string;
    project?: IProject;
}

export class ProjectService {
    public fileService: FileService;

    constructor() {
        this.fileService = new FileService();
    }

    async verifyUser(jwtToken: string): Promise<string> {
        const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as TokenPayload;
        return decodedToken.userId;
    }

    async findProjectAndVerifyUser(projectId: string, userId: string): Promise<IProject | null> {
        const project = await Project.findById(projectId);
        if (!project) return null;
        if (project.user.toString() !== userId) {
            throw new AppError('Unauthorized access', 403);
        }
        return project;
    }

    async createProject(userId: string, projectData: Partial<IProject>): Promise<IProject> {
        try {
            const project = new Project({
                ...projectData,
                user: userId
            });
            await project.save();
            userService.addProjectToUser(userId, project._id as unknown as Types.ObjectId);
            return project;
        } catch (error) {
            throw new AppError('Failed to create project', 500);
        }
    }

    async getUserProjects(userId: string): Promise<IProject[]> {
        try {
            return await Project.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(20);
        } catch (error) {
            throw new AppError('Failed to fetch user projects', 500);
        }
    }

    async updateProjectHierarchy(
        projectId: string,
        hierarchy: IHierarchy,
        files?: Express.Multer.File[]
    ): Promise<IProject> {
        try {
            const project = await Project.findById(projectId);
            if (!project) {
                throw new AppError('Project not found', 404);
            }

            if (files) {
                await this.fileService.handleFiles(project.folder, files);
            }

            project.hierarchy = hierarchy;
            await project.save();
            return project;
        } catch (error) {
            throw new AppError('Failed to update project hierarchy', 500);
        }
    }

    async deleteProject(projectId: string, userId: Types.ObjectId): Promise<void> {
        try {
            const project = await Project.findOne({ _id: projectId, user: userId });
            if (!project) {
                throw new AppError('Project not found', 404);
            }

            await this.fileService.deleteProjectFolder(project.folder);
            await Project.deleteOne({ _id: projectId });
        } catch (error) {
            throw new AppError('Failed to delete project', 500);
        }
    }

    async addCategory(
        hierarchy: IHierarchy,
        categoryName: string,
        categoryId: string
    ): Promise<IHierarchy> {
        const defaultPageId = uuidv4()
        const defaultBaseDrawingId = uuidv4();

        hierarchy.categoryMapping[categoryName] = categoryId;
        hierarchy.categories[categoryId] = {
            pages: {
                "gad": defaultPageId
            },
            baseDrawing: {
                fileId: defaultBaseDrawingId
            },
            components: {}
        };

        console.log(hierarchy.categories[categoryId]);

        return hierarchy;
    }

    async updateCategoryStructure(
        hierarchy: IHierarchy,
        categoryStructure: ICategoryData,
        categoryId: string,
    ): Promise<IHierarchy> {
        // const fileId = await this.fileService.saveFile(file);
        // const component = isNested
        //     ? { selected: '', options: {} }
        //     : { fileId };

        hierarchy.categories[categoryId] = categoryStructure;
        return hierarchy;
    }

    // async renameComponent (
    //     hierarchy: IHierarchy,
    //     categoryStructure: ICategoryData,
    //     categoryId: string,
    // ): Promise<IHierarchy> {
    //     // const fileId = await this.fileService.saveFile(file);
    //     // const component = isNested
    //     //     ? { selected: '', options: {} }
    //     //     : { fileId };

    //     hierarchy.categories[categoryId] = categoryStructure;
    //     return hierarchy;
    // }

    async addPage(
        hierarchy: IHierarchy,
        categoryId: string,
        pageName: string
    ): Promise<IHierarchy> {
        // const pageId = await this.fileService.createPageFolder();
        const pageId = uuidv4(); // Generate a unique ID for the page
        hierarchy.categories[categoryId].pages[pageName] = pageId;
        return hierarchy;
    }

    async updateBaseDrawing(
        hierarchy: IHierarchy,
        categoryId: string,
        file: Express.Multer.File
    ): Promise<IHierarchy> {
        const fileId = await this.fileService.saveFile(file);
        hierarchy.categories[categoryId].baseDrawing.fileId = fileId;
        return hierarchy;
    }

    async renameCategory(
        hierarchy: IHierarchy,
        categoryId: string,
        oldName: string,
        newName: string
    ): Promise<IHierarchy> {
        // Find the old category name by categoryId
        // const oldName = Object.entries(hierarchy.categoryMapping)
        //     .find(([_, id]) => id === categoryId)?.[0];

        if (oldName) {
            // Remove old mapping
            delete hierarchy.categoryMapping[oldName];
            // Add new mapping
            hierarchy.categoryMapping[newName] = categoryId;
        }
        console.log(hierarchy.categoryMapping);




        return hierarchy;
    }

    async deleteCategory(projectFolder: string, categoryId: string): Promise<void> {
        await this.fileService.deleteCategoryFolder(projectFolder, categoryId);
    }

    async handleHierarchyUpdate(
        id: string,
        userId: string,
        categoryId: string,
        categoryStructure: ICategoryData,
        errorMessage: string = 'Updated Category Structure is missing'
    ) {
        const project = await this.findProjectAndVerifyUser(id, userId);
        if (!project) {
            return { success: false, message: 'Project not found or unauthorized' };
        }

        console.log(categoryStructure);

        if (!categoryStructure) {
            return { success: false, message: errorMessage };
        }

        const parsedStructure = parseIfUnparsed(categoryStructure) as ICategoryData;
        project.hierarchy.categories[categoryId] = parsedStructure;

        project.markModified("hierarchy")
        await project.save();
        return { success: true, project };
    }

    async addDesignToProject(projectId: string, designId: mongoose.Types.ObjectId): Promise<SaveResponse> {
        try {
            const project = await Project.findByIdAndUpdate(
                projectId,
                { $addToSet: { derivedDesigns: designId } },
                { new: true }
            );

            if (!project) {
                return { success: false, status: 'Project not found' };
            }

            return {
                success: true,
                status: 'Project added to user successfully',
                project
            };
        } catch (error) {
            console.error('Error adding project to user:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }
}


export default new ProjectService();