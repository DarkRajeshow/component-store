// design.routes.ts
import express from 'express';
import {
    addNewAttribute,
    addNewPage,
    addNewParentAttribute,
    createEmptyDesign,
    deleteAttributes,
    deleteDesignById,
    getDesignById,
    getRecentDesigns,
    getUserDesigns,
    renameAttributes,
    shiftToSelectedCategory,
    updateUnParsedAttributes,
    uploadBaseDrawing
} from '../controllers/design.controller';
import upload from '../utils/multer';
import optimizeSVG from '../middleware/optimizeSVG';
import { handlePDFConversion } from '../middleware/handlePDFConversion';

const router = express.Router();

// POST requests
router.post('/', createEmptyDesign);

// PATCH requests
router.patch('/:id/attributes/option', upload.array('files'), handlePDFConversion, optimizeSVG, addNewAttribute);
router.patch('/:id/attributes/base', upload.array('files'), handlePDFConversion, optimizeSVG, uploadBaseDrawing);
router.patch('/:id/attributes/shift', shiftToSelectedCategory);
router.patch('/:id/attributes/parent', addNewParentAttribute);
router.patch('/:id/pages/add', addNewPage);
router.patch('/:id/attributes/rename', renameAttributes);
router.patch('/:id/attributes/update', upload.array('files'), handlePDFConversion, optimizeSVG, updateUnParsedAttributes);
router.patch('/:id/attributes/delete', deleteAttributes);

// GET requests
router.get('/', getUserDesigns);
router.get('/recent', getRecentDesigns);
router.get('/:id', getDesignById);

// DELETE requests
router.delete('/:id', deleteDesignById);

export default router;