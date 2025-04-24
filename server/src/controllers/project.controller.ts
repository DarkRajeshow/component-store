// src/controllers/project.controller.ts
import { Request, Response } from 'express';
import projectService from '../services/project.service';
import Project from '../models/project.model';
import { ICategoryData, IHierarchy, IProject } from '../types/project.types';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import path from 'path';
import fsExtra from 'fs-extra';
import parseIfUnparsed from '../utils/parseIfUnparsed';

// Helper function for standard response format
const sendResponse = (res: Response, success: boolean, status: string, data?: any) => {
    return res.json({ success, status, ...data });
};

interface IUpdateDesignStructure {
    success: boolean;
    message?: string;
    project?: IProject;
}

export class ProjectController {
    // Project CRUD Operations
    async createProject(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { name, type, description } = req.body;

            if (!type) {
                return sendResponse(res, false, 'Missing required fields');
            }

            // Create initial hierarchy with UUID for first category

            const defaultCategoryName = 'main';
            const defaultPageName = 'gad';
            const defaultCategoryId = uuidv4();
            const defaultPageId = uuidv4();

            const projectFolder = uuidv4();

            const initialHierarchy: IHierarchy = {
                categoryMapping: { [defaultCategoryName]: defaultCategoryId },
                categories: {
                    [defaultCategoryId]: {
                        pages: {
                            [defaultPageName]: defaultPageId
                        },
                        baseDrawing: { fileId: '' },
                        components: {}
                    }
                }
            };

            const project = await projectService.createProject(userId, {
                name,
                folder: projectFolder,
                hierarchy: initialHierarchy,
                selectedCategory: defaultCategoryName,
                selectedPage: defaultPageName,
                type,
                description,
            });

            return sendResponse(res, true, 'Project created successfully', { project });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error creating project');
        }
    }

    // Component Operations
    async addComponent(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;
            const { structure } = req.body;

            // if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            //     return sendResponse(res, false, 'Component file required');
            // }

            const result = await projectService.handleHierarchyUpdate(id, userId, categoryId, structure as ICategoryData);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            // return sendResponse(res, true, 'Component added successfully', { project: result.project });
            return sendResponse(res, true, 'Component added successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error adding component');
        }
    }

    async renameComponent(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;
            const { structure } = req.body;

            const result = await projectService.handleHierarchyUpdate(id, userId, categoryId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            return sendResponse(res, true, 'Component renamed successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error renaming component');
        }
    }

    async deleteComponent(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;
            const { structure, filesToDelete } = req.body;

            if (!structure || !filesToDelete) {
                return sendResponse(res, false, 'Data is missing.');
            }

            const result = await projectService.handleHierarchyUpdate(id, userId, categoryId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            if (!result.project?.folder) {
                return sendResponse(res, false, 'Project folder not found');
            }

            const folderPath = path.join(__dirname, 'public', 'uploads', 'projects', result.project.folder, categoryId);


            // Handle file deletions
            if (filesToDelete && filesToDelete.length > 0) {
                await projectService.fileService.deleteFilesRecursively(folderPath, filesToDelete);
            }

            return sendResponse(res, true, 'Component deleted successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error deleting component');
        }
    }

    async updateComponent(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;
            const { structure, deleteFilesOfPages, filesToDelete } = req.body;

            if (!structure || !deleteFilesOfPages || !filesToDelete) {
                return sendResponse(res, false, 'Data is missing.');
            }

            const result: IUpdateDesignStructure = await projectService.handleHierarchyUpdate(id, userId, categoryId, structure,);

            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            if (!result.project) {
                return sendResponse(res, false, 'Some error occurred while retriving the design.');
            }

            const folderPath = path.join(__dirname, 'public', 'uploads', 'projects', result.project.folder, categoryId);

            const parsedDeleteFilesOfPages = JSON.parse(deleteFilesOfPages);
            const parsedFilesToDelete = JSON.parse(filesToDelete);

            // Handle file deletions
            await projectService.fileService.deleteFiles(folderPath, parsedDeleteFilesOfPages);
            if (parsedFilesToDelete && parsedFilesToDelete.length > 0) {
                await projectService.fileService.deleteFilesRecursively(folderPath, parsedFilesToDelete);
            }
            return sendResponse(res, true, 'Component updated successfully');

        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error renaming component');
        }
    }

    // Page Operations
    async addPage(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;
            const { pageName } = req.body;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            const updatedHierarchy = await projectService.addPage(
                project.hierarchy,
                categoryId,
                pageName
            );

            project.hierarchy = updatedHierarchy;
            // Mark the hierarchy field as modified
            project.markModified('hierarchy');
            await project.save();

            return sendResponse(res, true, 'Page added successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error adding page');
        }
    }

    async renamePage(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId, pageId } = req.params;
            const { newName } = req.body;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            // Store the page ID and update the mapping
            // const pageIdValue = project.hierarchy.categories[categoryId].pages[pageId];
            // Get the entries in their original order
            const pageEntries = Object.entries(project.hierarchy.categories[categoryId].pages);
            
            // Create new ordered pages object
            const orderedPages: { [key: string]: string } = {};
            
            // Rebuild the pages object with the new name while maintaining order
            pageEntries.forEach(([key, value]) => {
                if (value === pageId) {
                    orderedPages[newName] = value;
                } else {
                    orderedPages[key] = value;
                }
            });

            // Update the pages object with the ordered version
            project.hierarchy.categories[categoryId].pages = orderedPages;

            // Update selected page if it was the renamed one
            if (project.selectedPage === pageId) {
                project.selectedPage = newName;
            }

            project.markModified('hierarchy');
            await project.save();
            return sendResponse(res, true, 'Page renamed successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error renaming page');
        }
    }

    async reorderPages(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;
            const { pages } = req.body;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            // Update the pages object with the ordered version
            project.hierarchy.categories[categoryId].pages = pages;
            project.markModified('hierarchy');
            await project.save();
            return sendResponse(res, true, 'Pages reordered successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error renaming page');
        }
    }

    async deletePage(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId, pageId } = req.params;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            // Get the page folder ID before deletion
            const pageFolderId = project.hierarchy.categories[categoryId].pages[pageId];
            await projectService.fileService.deleteProjectPageFolder(project.folder, categoryId, pageFolderId);

            delete project.hierarchy.categories[categoryId].pages[pageId];

            // Reset selected page if it was the deleted one
            if (project.selectedPage === pageId) {
                const remainingPages = Object.keys(project.hierarchy.categories[categoryId].pages);
                project.selectedPage = remainingPages[0] || '';
            }

            project.markModified('hierarchy');
            await project.save();
            return sendResponse(res, true, 'Page deleted successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error deleting page');
        }
    }

    // Base Drawing Operations
    async updateBaseDrawing(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id } = req.params;

            const {
                selectedCategory,
                folderNames,
                hierarchy
            } = req.body


            if (!hierarchy || !selectedCategory) {
                return sendResponse(res, false, 'Updated hierarchy or selectedCategory is missing.');
            }

            const paresedHierarchy = parseIfUnparsed(hierarchy);

            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                return sendResponse(res, false, 'Base drawing file required');
            }

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            const baseDir = path.join(__dirname, '..', 'server', 'public', 'uploads', project.folder);


            const categoryId = project.hierarchy.categoryMapping[selectedCategory]

            if (folderNames && Array.isArray(folderNames) && folderNames.length > 0) {
                for (const pageFolderName of folderNames) {
                    projectService.fileService.deleteProjectPageFolder(project.folder, categoryId, pageFolderName)
                }
            }


            if (hierarchy) {
                project.markModified('hierarchy');
                project.hierarchy = paresedHierarchy as IHierarchy;
            }

            project.selectedCategory = selectedCategory;
            await project.save();

            // const project = await projectService.findProjectAndVerifyUser(id, userId);
            // if (!project) {
            //     return sendResponse(res, false, 'Project not found');
            // }

            // const updatedHierarchy = await projectService.updateBaseDrawing(
            //     project.hierarchy,
            //     categoryId,
            //     req.files[0]
            // );

            // project.hierarchy = updatedHierarchy;
            // await project.save();

            return sendResponse(res, true, 'Base drawing updated successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error updating base drawing');
        }
    }

    // Category Operations
    async shiftCategory(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id } = req.params;
            const { selectedCategory, hierarchy, folderNames } = req.body;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            const categoryId = project.hierarchy.categoryMapping[selectedCategory]

            if (folderNames && Array.isArray(folderNames) && folderNames.length > 0) {
                for (const pageFolderName of folderNames) {
                    projectService.fileService.deleteProjectPageFolder(project.folder, categoryId, pageFolderName)
                }
            }

            let successMessage = "Shifted to the selected category."
            if (hierarchy) {
                if (project.selectedCategory == selectedCategory) {
                    successMessage = "Pages updated successfully."
                }
                else {
                    successMessage = "Shited to selected category and updated pages."
                }
                project.markModified('hierarchy');
                project.hierarchy = hierarchy;
            }

            project.selectedCategory = selectedCategory;
            await project.save();

            return sendResponse(res, true, successMessage);
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error while shifting category');
        }
    }

    // Category Operations
    async addCategory(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id } = req.params;
            const { categoryName } = req.body;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            const categoryId = uuidv4()

            const updatedHierarchy = await projectService.addCategory(
                project.hierarchy,
                categoryName,
                categoryId
            );

            project.hierarchy = updatedHierarchy;
            project.markModified('hierarchy')
            await project.save();

            return sendResponse(res, true, 'Category added successfully', { categoryId });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error adding category');
        }
    }

    async renameCategory(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;
            const { oldName, newName } = req.body;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            const updatedHierarchy = await projectService.renameCategory(
                project.hierarchy,
                categoryId,
                oldName,
                newName
            );


            if (project.selectedCategory === oldName) {
                project.selectedCategory = newName
            }

            project.hierarchy = updatedHierarchy;
            project.markModified("hierarchy")
            await project.save();
            return sendResponse(res, true, 'Category renamed successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error renaming category');
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id, categoryId } = req.params;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            await projectService.deleteCategory(project.folder, categoryId);

            const { [categoryId]: removedCategory, ...remainingCategories } = project.hierarchy.categories;
            // Remove category from categoryMapping by finding the key with matching value
            const categoryName = Object.entries(project.hierarchy.categoryMapping)
                .find(([_, value]) => value === categoryId)?.[0];

            if (categoryName) {
                delete project.hierarchy.categoryMapping[categoryName];
            }

            project.hierarchy.categories = remainingCategories;

            if (project.selectedCategory === categoryName) {
                project.selectedCategory = Object.keys(remainingCategories)[0] || '';
            }

            project.markModified("hierarchy")
            await project.save();
            return sendResponse(res, true, 'Category deleted successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error deleting category');
        }
    }


    // delete project
    async deleteProject(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const { id } = req.params;

            const project = await projectService.findProjectAndVerifyUser(id, userId);
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }

            await projectService.deleteProject(id, new Types.ObjectId(userId));
            return sendResponse(res, true, 'Project deleted successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error deleting project');
        }
    }

    // Query Operations
    async getProjectById(req: Request, res: Response) {
        try {
            const project = await Project.findById(req.params.id).populate('user');
            if (!project) {
                return sendResponse(res, false, 'Project not found');
            }
            return sendResponse(res, true, 'Project retrieved successfully', { project });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error retrieving project');
        }
    }

    async getUserProjects(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await projectService.verifyUser(req.cookies.jwt);
            const projects = await projectService.getUserProjects(userId);

            return sendResponse(res, true, 'Projects retrieved successfully', { projects });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error retrieving projects');
        }
    }

    async getRecentProjects(_req: Request, res: Response) {
        try {
            const projects = await Project.find()
                .sort({ createdAt: -1 })
                .limit(20);

            return sendResponse(res, true, 'Recent projects retrieved successfully', { projects });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error retrieving recent projects');
        }
    }
}

export default new ProjectController();