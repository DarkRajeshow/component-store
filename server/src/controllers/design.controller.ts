import { Request, Response } from 'express';
import { Types } from 'mongoose';
import designService from '../services/design.service';
import Design from '../models/Design';
import { IDesign, IStructure } from '../types/design.types';
import { v4 as uuidv4 } from 'uuid';
import parseIfUnparsed from '../utils/parseIfUnparsed';
import path from 'path';
import fileService from '../services/file.service';

// Helper function for standard response format
const sendResponse = (res: Response, success: boolean, status: string, data?: any) => {
    return res.json({ success, status, ...data });
};

interface IUpdateDesignStructure {
    success: boolean;
    message?: string;
    design?: IDesign;
}

class DesignController {

    // Add this helper method inside the DesignController class
    // controllers for design management
    // Design CRUD Operations
    async createDesign(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { project, name, type, description, structure, category, code, hash, sourceDesign } = req.body;

            if (!type || !code || !hash || !project) {
                return sendResponse(res, false, 'Missing required fields');
            }


            // Create initial structure if not provided
            const initialStructure: IStructure = structure || {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: { fileId: '' },
                components: {}
            };

            const defaultPage = initialStructure.pages ? Object.keys(initialStructure.pages)[0] : 'gad';
            const folder = uuidv4();

            const design = await designService.createDesign(userId, {
                project,
                sourceDesign: sourceDesign ? sourceDesign : null,
                folder,
                type,
                description,
                structure: initialStructure,
                category: category || uuidv4(),
                selectedPage: defaultPage,
                code,
                hash,
                revisions: [],
                accessTo: [{ userId, permissions: 'edit' }],
                derivedDesigns: []
            });

            return sendResponse(res, true, 'Design created successfully', { design });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error creating design');
        }
    }

    // Component Operations
    async addComponent(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id } = req.params;
            const { structure } = req.body;

            // if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            //     return sendResponse(res, false, 'Component file required');
            // }

            const result = await designService.handleStructureUpdate(id, userId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

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

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id } = req.params;
            const { structure } = req.body;

            const result = await designService.handleStructureUpdate(id, userId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            return sendResponse(res, true, 'Component renamed successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error renaming component');
        }
    }

    async updateComponent(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const designId = req.params.id;
            const { structure, deleteFilesOfPages, filesToDelete } = req.body;

            if (!structure || !deleteFilesOfPages || !filesToDelete) {
                return sendResponse(res, false, 'Data is missing.');
            }

            const result: IUpdateDesignStructure = await designService.handleStructureUpdate(designId, userId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            if (!result.design) {
                return sendResponse(res, false, 'Some error occurred while retriving the design.');
            }

            const folderPath = path.join(__dirname, 'public', 'uploads', result.design.folder);

            const parsedDeleteFilesOfPages = JSON.parse(deleteFilesOfPages);
            const parsedFilesToDelete = JSON.parse(filesToDelete);
            // Handle file deletions
            await designService.fileService.deleteFiles(folderPath, parsedDeleteFilesOfPages);
            if (parsedFilesToDelete && parsedFilesToDelete.length > 0) {
                await designService.fileService.deleteFilesRecursively(folderPath, parsedFilesToDelete);
            }
            return sendResponse(res, true, 'Component updated successfully');

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

            const userId = await designService.verifyUser(req.cookies.jwt);
            const designId = req.params.id;
            const { structure, filesToDelete } = req.body;


            const result: IUpdateDesignStructure = await designService.handleStructureUpdate(designId, userId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            if (!result.design) {
                return sendResponse(res, false, 'Some error occurred while retriving the design.');
            }

            if (filesToDelete && Array.isArray(filesToDelete) && filesToDelete.length > 0) {
                const folderPath = path.join(__dirname, 'public', 'uploads', result.design.folder);
                await fileService.deleteFilesRecursively(folderPath, filesToDelete);
            }

            return sendResponse(res, true, 'Component deleted.');

        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error deleting component');
        }
    }

    // Page Operations
    async addPage(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id } = req.params;
            const { pageName } = req.body;

            const design = await designService.findDesignAndVerifyUser(id, userId);
            if (!design) {
                return sendResponse(res, false, 'Design not found');
            }

            const updatedStructure = await designService.addPage(
                design.structure,
                pageName
            );

            design.structure = updatedStructure;
            design.selectedPage = pageName;
            await design.save();

            return sendResponse(res, true, 'Page added successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error adding page');
        }
    }

    // async addPage(req: Request, res: Response) {
    //     try {
    //         if (!req.cookies.jwt) {
    //             return sendResponse(res, false, 'Login required');
    //         }

    //         const userId = await designService.verifyUser(req.cookies.jwt);
    //         const { id } = req.params;
    //         const { pageName } = req.body;

    //         const design = await designService.findDesignAndVerifyUser(id, userId);
    //         if (!design) {
    //             return sendResponse(res, false, 'Design not found');
    //         }

    //         const pageId = uuidv4();
    //         const updatedHierarchy = await designService.addPage(
    //             design.structure,
    //             pageName,
    //             pageId
    //         );

    //         design.structure = updatedHierarchy;
    //         await design.save();

    //         return sendResponse(res, true, 'Page added successfully', { design });
    //     } catch (error) {
    //         console.error(error);
    //         return sendResponse(res, false, 'Error adding category');
    //     }
    // }

    async renamePage(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id, pageId } = req.params;
            const { newName } = req.body;

            const design = await designService.findDesignAndVerifyUser(id, userId);
            if (!design) {
                return sendResponse(res, false, 'Design not found');
            }

            // Store the page ID and update the mapping
            const pageIdValue = design.structure.pages[pageId];
            design.structure.pages[newName] = pageIdValue;
            delete design.structure.pages[pageId];

            // Update selected page if it was the renamed one
            if (design.selectedPage === pageIdValue) {
                design.selectedPage = newName;
            }

            await design.save();

            return sendResponse(res, true, 'Page renamed successfully');
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

            const userId = await designService.verifyUser(req.cookies.jwt);
            const designId = req.params.id;
            const { structure, pageName } = req.body;

            const result: IUpdateDesignStructure = await designService.handleStructureUpdate(designId, userId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            else if (!result.design) {
                return sendResponse(res, false, 'Some error occurred while retriving the design.');
            }

            // Get the page folder ID before deletion
            const pageFolderId = result.design.structure.pages[pageName];

            // Only delete if there's a folder ID and file service exists
            if (pageFolderId && designService.fileService) {
                await designService.fileService.deleteDesignPageFolder(result.design.folder, pageFolderId);
            }

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

            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                return sendResponse(res, false, 'Base drawing file required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const designId = req.params.id;
            const { structure, folderNames } = req.body;

            const result: IUpdateDesignStructure = await designService.handleStructureUpdate(designId, userId, structure);
            if (!result.success && result.message) {
                return sendResponse(res, false, result.message);
            }

            if (!result.design) {
                return sendResponse(res, false, 'Some error occurred while retriving the design.');
            }

            if (folderNames && Array.isArray(folderNames) && folderNames.length > 0) {
                for (const folderName of folderNames) {
                    fileService.deleteDesignPageFolder(result.design.folder, folderName)
                }
            }

            // Upload new file and get file info
            return sendResponse(res, true, 'Base drawing updated successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error updating base drawing');
        }
    }

    // Design Management Operations
    async updateDesign(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id } = req.params;
            const { description, type } = req.body;

            const design = await designService.findDesignAndVerifyUser(id, userId);
            if (!design) {
                return sendResponse(res, false, 'Design not found or unauthorized');
            }

            // Update only allowed fields
            if (description !== undefined) design.description = description;
            if (type !== undefined) design.type = type;

            await design.save();
            return sendResponse(res, true, 'Design updated successfully', { design });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error updating design');
        }
    }

    async deleteDesign(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id } = req.params;

            const design = await designService.findDesignAndVerifyUser(id, userId);
            if (!design) {
                return sendResponse(res, false, 'Design not found or unauthorized');
            }

            // Delete associated files first
            const folderPath = path.join(__dirname, 'public', 'uploads', design.folder);

            await designService.fileService.deleteDesignFiles(folderPath);

            // Then delete the design document
            await Design.findByIdAndDelete(id);

            return sendResponse(res, true, 'Design deleted successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error deleting design');
        }
    }

    // // Access Control Operations
    // async grantAccess(req: Request, res: Response) {
    //     try {
    //         if (!req.cookies.jwt) {
    //             return sendResponse(res, false, 'Login required');
    //         }

    //         const userId = await designService.verifyUser(req.cookies.jwt);
    //         const { id } = req.params;
    //         const { userEmail, permissions } = req.body;

    //         if (!userEmail || !permissions || !['edit', 'view'].includes(permissions)) {
    //             return sendResponse(res, false, 'Invalid input data');
    //         }

    //         const design = await designService.findDesignAndVerifyUser(id, userId);
    //         if (!design) {
    //             return sendResponse(res, false, 'Design not found or unauthorized');
    //         }

    //         // Find user by email
    //         const targetUser = await designService.getUserByEmail(userEmail);
    //         if (!targetUser) {
    //             return sendResponse(res, false, 'User not found');
    //         }

    //         // Check if user already has access
    //         const existingAccess = design.accessTo.find(
    //             access => access.userId.toString() === targetUser._id.toString()
    //         );

    //         if (existingAccess) {
    //             existingAccess.permissions = permissions;
    //         } else {
    //             design.accessTo.push({
    //                 userId: targetUser._id,
    //                 permissions
    //             });
    //         }

    //         await design.save();
    //         return sendResponse(res, true, 'Access granted successfully');
    //     } catch (error) {
    //         console.error(error);
    //         return sendResponse(res, false, 'Error granting access');
    //     }
    // }

    async revokeAccess(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id, targetUserId } = req.params;

            const design = await designService.findDesignAndVerifyUser(id, userId);
            if (!design) {
                return sendResponse(res, false, 'Design not found or unauthorized');
            }

            // Remove the user from accessTo array
            design.accessTo = design.accessTo.filter(
                access => access.userId.toString() !== targetUserId
            );

            await design.save();
            return sendResponse(res, true, 'Access revoked successfully');
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error revoking access');
        }
    }

    // // Revision Operations
    // async createRevision(req: Request, res: Response) {
    //     try {
    //         if (!req.cookies.jwt) {
    //             return sendResponse(res, false, 'Login required');
    //         }

    //         const userId = await designService.verifyUser(req.cookies.jwt);
    //         const { id } = req.params;
    //         const { comment } = req.body;

    //         const design = await designService.findDesignAndVerifyUser(id, userId);
    //         if (!design) {
    //             return sendResponse(res, false, 'Design not found or unauthorized');
    //         }

    //         const revisionId = await designService.createRevision(design, userId, comment);

    //         // Add revision to design
    //         design.revisions.push(revisionId);
    //         await design.save();

    //         return sendResponse(res, true, 'Revision created successfully', { revisionId });
    //     } catch (error) {
    //         console.error(error);
    //         return sendResponse(res, false, 'Error creating revision');
    //     }
    // }

    // Query Operations
    async getDesignById(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { id } = req.params;

            // Check if user has access to this design
            const design = await Design.findById(id)
                .populate('user', 'email name')
                .populate('revisions');

            if (!design) {
                return sendResponse(res, false, 'Design not found');
            }

            // Check if user has access
            const isOwner = (design.user as { _id: Types.ObjectId })._id.toString() === userId;
            const hasAccess = design.accessTo.some(access => access.userId.toString() === userId);

            // if (!isOwner && !hasAccess) {
            //     return sendResponse(res, false, 'You do not have access to this design');
            // }

            return sendResponse(res, true, 'Design retrieved successfully', {
                ...design,
                isOwner,
                hasAccess
            });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error retrieving design');
        }
    }

    async getUserDesigns(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);

            // Find designs where user is owner or has access
            const designs = await Design.find({
                $or: [
                    { user: userId },
                    { 'accessTo.userId': userId }
                ]
            })
                .populate('user', 'email name')
                .sort({ updatedAt: -1 });

            return sendResponse(res, true, 'Designs retrieved successfully', { designs });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error retrieving designs');
        }
    }

    async getRecentDesigns(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);

            // Find recent designs where user is owner or has access
            const designs = await Design.find({
                $or: [
                    { user: userId },
                    { 'accessTo.userId': userId }
                ]
            })
                .populate('user', 'email name')
                .sort({ updatedAt: -1 })
                .limit(20);

            return sendResponse(res, true, 'Recent designs retrieved successfully', { designs });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error retrieving recent designs');
        }
    }

    // Derived Designs
    async createDerivedDesign(req: Request, res: Response) {
        try {
            if (!req.cookies.jwt) {
                return sendResponse(res, false, 'Login required');
            }

            const userId = await designService.verifyUser(req.cookies.jwt);
            const { project, folder, type, description, structure, category, code, hash, sourceDesign } = req.body;

            if (!folder || !type || !code || !hash || !project) {
                return sendResponse(res, false, 'Missing required fields');
            }

            // Create initial structure if not provided
            const initialStructure: IStructure = structure || {
                pages: {},
                baseDrawing: { fileId: '' },
                components: {}
            };

            const design = await designService.createDesign(userId, {
                project,
                sourceDesign,
                folder,
                type,
                description,
                structure: initialStructure,
                category: category || uuidv4(),
                selectedPage: '',
                code,
                hash,
                revisions: [],
                accessTo: [{ userId, permissions: 'edit' }],
                derivedDesigns: []
            });

            return sendResponse(res, true, 'Design created successfully', { design });
        } catch (error) {
            console.error(error);
            return sendResponse(res, false, 'Error creating design');
        }
    }
}

export default new DesignController();