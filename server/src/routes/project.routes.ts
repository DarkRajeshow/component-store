// src/routes/project.routes.ts
import express, { Request } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { projectUpload } from '../utils/projectMulter';
import { handlePDFtoSVG } from '../middleware/pdfTosvg.middleware';
import { optimizeSVG } from '../middleware/optimizeSVG.middleware';

interface RequestWithFiles extends Request {
  files: Express.Multer.File[];
}

const router = express.Router();
const projectController = new ProjectController();

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Project CRUD
router.post('/', projectController.createProject);
router.get('/', projectController.getUserProjects);
router.get('/recent', projectController.getRecentProjects);
router.get('/:id', projectController.getProjectById);
router.delete('/:id', projectController.deleteProject);


// Category operations
router.put('/:id/categories', projectController.addCategory);
router.put('/:id/categories/shift', projectController.shiftCategory);
router.put('/:id/categories/:categoryId/rename', projectController.renameCategory);
router.delete('/:id/categories/:categoryId', projectController.deleteCategory);


// base drawing operations
router.put(
  '/:id/categories/:categoryId/base',
  projectUpload.array('files') as express.RequestHandler,
  handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
  optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
  projectController.updateBaseDrawing
);

// Component operations
router.put(
  '/:id/categories/:categoryId/components/add/child',
  projectUpload.array('files') as express.RequestHandler,
  handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
  optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
  projectController.addComponent
);

router.put(
  '/:id/categories/:categoryId/components/add/parent',
  projectController.addComponent
);

router.put('/:id/categories/:categoryId/components/rename',
  projectController.renameComponent
);

router.put(
  '/:id/categories/:categoryId/components/update',
  projectUpload.array('files') as express.RequestHandler,
  handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
  optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
  projectController.updateComponent
);

router.delete('/:id/categories/:categoryId/components',
  projectController.deleteComponent
);


// Page operations 
router.put('/:id/categories/:categoryId/pages',
  projectController.addPage
);

router.put('/:id/categories/:categoryId/pages/:pageId/rename',
  projectController.renamePage
);

router.delete('/:id/categories/:categoryId/pages/:pageId',
  projectController.deletePage
);

export default router;