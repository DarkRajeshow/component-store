import { Request, Response } from 'express';
import { DesignService } from '../services/design.service';
import Design from '../models/Design';
import User from '../models/User';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
// import jwt from 'jsonwebtoken';

const designService = new DesignService();
// const __dirname = path.resolve();

// POST Requests
export const createEmptyDesign = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const {
            designType,
            selectedCategory,
            designInfo,
            folder,
            structure,
            selectedPage
        } = req.body;

        if (!folder || !designType || !designInfo || !structure || !selectedCategory || !selectedPage) {
            return res.json({ success: false, status: 'Something went wrong.' });
        }

        const design = await designService.createDesign(userId, {
            designType,
            selectedCategory,
            designInfo,
            folder,
            structure,
            selectedPage
        });

        return res.json({
            success: true,
            status: 'New Design initialized successfully.',
            id: design._id
        });
    } catch (error) {
        console.error(error);
        return res.json({
            success: false,
            status: (error instanceof Error ? error.message : 'Problem in file upload.')
        });
    }
};

// PATCH Requests
export const addNewAttribute = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const { structure } = req.body;

        if (!structure) {
            return res.json({ success: false, status: 'Update attributes is missing.' });
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.json({ success: false, status: 'PDF/SVG Customization File is a required field.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'You do not have access to modify the design.' });
        }

        const parsedStructure = JSON.parse(structure);

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        design.structure = parsedStructure;
        await design.save();

        return res.json({
            success: true,
            status: 'Attribute added.',
            id: design._id
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Problem in file upload.' });
    }
};

export const addNewParentAttribute = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const structure = req.body;

        if (!structure) {
            return res.json({ success: false, status: 'Updated structure is missing.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'Design not found.' });
        }

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        design.structure = structure;
        await design.save();

        return res.json({
            success: true,
            status: 'Parent attribute added.',
            id: design._id
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Internal server problem.' });
    }
};

export const uploadBaseDrawing = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const { selectedCategory, folderNames } = req.body;
        const structure = JSON.parse(req.body.structure);

        if (!structure || !selectedCategory) {
            return res.json({ success: false, status: 'Updated attributes or selectedCategory is missing.' });
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.json({ success: false, status: 'Base PDF/SVG File is a required field.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'You do not have access to modify the design.' });
        }

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        const baseDir = path.join(__dirname, '..', 'server', 'public', 'uploads', design.folder);

        if (folderNames && Array.isArray(folderNames) && folderNames.length > 0) {
            for (const folderName of folderNames) {
                const folderPath = path.join(baseDir, folderName);
                if (fsExtra.existsSync(folderPath)) {
                    await fsExtra.remove(folderPath);
                    console.log(`Deleted folder: ${folderName}`);
                } else {
                    console.log(`Folder does not exist: ${folderName}`);
                }
            }
        }

        design.selectedCategory = selectedCategory;
        design.structure = structure;
        await design.save();

        return res.json({
            success: true,
            status: 'Base Drawing is Added.',
            id: design._id
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Problem in file upload.' });
    }
};

export const shiftToSelectedCategory = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const { selectedCategory, structure, folderNames } = req.body;

        if (!selectedCategory) {
            return res.json({ success: false, status: 'Missing Data.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'Design not found.' });
        }

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        const baseDir = path.join(__dirname, '..', 'server', 'public', 'uploads', design.folder);

        if (folderNames && Array.isArray(folderNames) && folderNames.length > 0) {
            for (const folderName of folderNames) {
                const folderPath = path.join(baseDir, folderName);
                if (fsExtra.existsSync(folderPath)) {
                    await fsExtra.remove(folderPath);
                    console.log(`Deleted folder: ${folderName}`);
                } else {
                    console.log(`Folder does not exist: ${folderName}`);
                }
            }
        }

        if (structure) {
            design.structure = structure;
        }

        design.selectedCategory = selectedCategory;
        await design.save();

        return res.json({
            success: true,
            status: `Updated Pages & Shifted to ${selectedCategory}.`,
            id: design._id
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Problem in file upload.' });
    }
};

export const renameAttributes = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const { structure } = req.body;

        if (!structure) {
            return res.json({ success: false, status: 'Sorry, Updated structure is missing.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'Design you are looking for not available unfortunately.' });
        }

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        design.structure = structure;
        await design.save();

        return res.json({
            success: true,
            status: 'Attribute renamed.',
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Internal server problem.' });
    }
};

export const deleteAttributes = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const { structure, filesToDelete } = req.body;

        if (!structure) {
            return res.json({ success: false, status: 'Sorry, Update structure is missing.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'Design not found.' });
        }

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        if (filesToDelete && Array.isArray(filesToDelete) && filesToDelete.length > 0) {
            const folderPath = path.join(__dirname, 'public', 'uploads', design.folder);
            await designService.deleteFilesRecursively(folderPath, filesToDelete);
        }

        design.structure = structure;
        await design.save();

        return res.json({
            success: true,
            status: 'Attribute deleted.',
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Internal server problem.' });
    }
};

export const addNewPage = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const { structure } = req.body;

        if (!structure) {
            return res.json({ success: false, status: 'Sorry, Updated structure is missing.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'unfortunately, Design you are looking for not available.' });
        }

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        design.structure = structure;
        await design.save();

        return res.json({
            success: true,
            status: 'New Page Added.',
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Internal server problem.' });
    }
};

export const updateUnParsedAttributes = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.jwt) {
            return res.json({ success: false, status: 'Login to add new Design.' });
        }

        const userId = await designService.verifyUser(req.cookies.jwt);
        const designId = req.params.id;
        const { structure, deleteFilesOfPages, filesToDelete } = req.body;

        if (!structure || !deleteFilesOfPages || !filesToDelete) {
            return res.json({ success: false, status: 'Sorry, Data is missing.' });
        }

        const design = await Design.findById(designId);
        if (!design) {
            return res.json({ success: false, status: 'Design you are looking for not available unfortunately.' });
        }

        if (design.user.toString() !== userId) {
            return res.json({ success: false, status: 'You are not authorized.' });
        }

        const parsedStructure = JSON.parse(structure);
        const parsedDeleteFilesOfPages = JSON.parse(deleteFilesOfPages);
        const parsedFilesToDelete = JSON.parse(filesToDelete);

        const folderPath = path.join(__dirname, 'public', 'uploads', design.folder);

        // Handle file deletions
        await designService.deleteDesignFiles(folderPath, parsedDeleteFilesOfPages);
        if (parsedFilesToDelete && parsedFilesToDelete.length > 0) {
            await designService.deleteFilesRecursively(folderPath, parsedFilesToDelete);
        }

        design.structure = parsedStructure;
        await design.save();

        return res.json({
            success: true,
            status: 'Attribute updated.',
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Internal server problem.' });
    }
};

// GET Requests
export const getRecentDesigns = async (_req: Request, res: Response) => {
    try {
        const recentDesigns = await Design.find()
            .sort({ createdAt: -1 })
            .limit(20);

        return res.json({
            success: true,
            status: "Designs retrieved successfully.",
            recentDesigns : recentDesigns || []
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: "Internal server error." });
    }
};

export const getUserDesigns = async (req: Request, res: Response) => {
    if (!req.cookies.jwt) {
        return res.json({ success: false, status: "User not logged in." });
    }

    try {
        const userId = await designService.verifyUser(req.cookies.jwt);

        const user = await User.findById(userId)
            .populate({
                path: 'designs',
                options: {
                    sort: { createdAt: -1 },
                    limit: 20
                }
            });

        if (!user) {
            return res.json({ success: false, status: "User not found." });
        }

        return res.json({
            success: true,
            status: "Designs retrieved successfully.",
            designs: user.designs
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: "Internal server error." });
    }
};

export const getDesignById = async (req: Request, res: Response) => {
    try {
        const design = await Design.findById(req.params.id).populate('user').exec();
        if (!design) {
            return res.json({ success: false, message: 'Design not found.' });
        }
        return res.json({
            success: true,
            status: 'Design details retrieved successfully.',
            design
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Internal server error.' });
    }
};

// DELETE Requests
export const deleteDesignById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const design = await Design.findById(id);
        if (!design) {
            return res.json({ success: false, status: "Design not found." });
        }

        const folderPath = path.join(__dirname, 'public', 'uploads', design.folder);

        await Design.findByIdAndDelete(id);

        fs.rmdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`Folder not found: ${folderPath}`);
                } else {
                    console.error(err);
                }
            } else {
                console.log(`Folder deleted: ${folderPath}`);
            }
        });

        return res.json({ success: true, status: "Design deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: "Internal server error." });
    }
};

// Types for Request files
declare global {
    namespace Express {
        interface Request {
            files?: Express.Multer.File[];
        }
    }
}
