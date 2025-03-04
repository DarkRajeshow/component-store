// src/services/project.service.ts
import { Types } from 'mongoose';
import Project from '../models/Project';
import { IProject, IProjectAttributes } from '../interfaces/project.';
import { FileService } from './file.service';
import { AppError } from '../utils/AppError';

export class ProjectService {
    private fileService: FileService;

    constructor() {
        this.fileService = new FileService();
    }

    async createProject(userId: Types.ObjectId, projectData: Partial<IProject>): Promise<IProject> {
        try {
            const project = new Project({
                ...projectData,
                user: userId
            });
            await project.save();
            return project;
        } catch (error) {
            throw new AppError('Failed to create project', 500);
        }
    }

    async getUserProjects(userId: Types.ObjectId): Promise<IProject[]> {
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
        hierarchy: IProjectAttributes,
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
}
