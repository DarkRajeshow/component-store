// src/routes/project.routes.ts
import express from 'express';
import { ProjectController } from '../controllers/project.controller';
import { upload, optimizeSVG, handlePDFConversion } from '../middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const projectController = new ProjectController();

// Project routes with authentication
router.use(authMiddleware);

// Project CRUD operations
router.post('/', projectController.createProject);
router.get('/', projectController.getUserProjects);
router.get('/recent', projectController.getRecentProjects);
router.get('/:projectId', projectController.getProjectById);
router.delete('/:projectId', projectController.deleteProject);

// Hierarchy operations
router.patch(
    '/:projectId/hierarchy/attributes',
    upload.array('files'),
    handlePDFConversion,
    optimizeSVG,
    projectController.addAttribute
);

router.patch(
    '/:projectId/hierarchy/base',
    upload.array('files'),
    handlePDFConversion,
    optimizeSVG,
    projectController.uploadBaseDrawing
);

router.patch('/:projectId/hierarchy/category', projectController.changeCategory);
router.patch('/:projectId/hierarchy/parent', projectController.updateParentAttribute);
router.patch('/:projectId/hierarchy/rename', projectController.renameAttribute);
router.patch('/:projectId/hierarchy/delete', projectController.deleteAttribute);

// Page operations
router.patch('/:projectId/pages', projectController.addPage);

export default router;