// src/controllers/project.controller.ts
import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { catchAsync } from '../utils/catchAsync';

export class ProjectController {
    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    createProject = catchAsync(async (req: Request, res: Response) => {
        const project = await this.projectService.createProject(req.user.id, req.body);
        res.json({
            success: true,
            status: 'Project created successfully',
            data: project
        });
    });

    getUserProjects = catchAsync(async (req: Request, res: Response) => {
        const projects = await this.projectService.getUserProjects(req.user.id);
        res.json({
            success: true,
            status: 'Projects retrieved successfully',
            data: projects
        });
    });

    updateHierarchy = catchAsync(async (req: Request, res: Response) => {
        const project = await this.projectService.updateProjectHierarchy(
            req.params.projectId,
            req.body.hierarchy,
            req.files as Express.Multer.File[]
        );
        res.json({
            success: true,
            status: 'Project hierarchy updated successfully',
            data: project
        });
    });

    deleteProject = catchAsync(async (req: Request, res: Response) => {
        await this.projectService.deleteProject(req.params.projectId, req.user.id);
        res.json({
            success: true,
            status: 'Project deleted successfully'
        });
    });
}