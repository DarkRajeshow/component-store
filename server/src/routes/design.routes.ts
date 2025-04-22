// src/routes/design.routes.ts
import express, { Request } from 'express';
import { designUpload } from '../utils/designMulter';
import designController from '../controllers/design.controller';
import { handlePDFtoSVG } from '../middleware/pdfTosvg.middleware';
import { optimizeSVG } from '../middleware/optimizeSVG.middleware';

interface RequestWithFiles extends Request {
  files: Express.Multer.File[];
}

const router = express.Router();

// Apply auth middleware to all routes
// router.use(authMiddleware);

// design CRUD
router.post('/', designController.createDesign);
router.get('/', designController.getUserDesigns);
router.get('/recent', designController.getRecentDesigns);
router.get('/:id', designController.getDesignById);
router.delete('/:id', designController.deleteDesign);

// // Category operations
// router.put('/:id/categories', designController.addCategory);
// router.put('/:id/rename', designController.renameCategory);
// router.delete('/:id', designController.deleteCategory);

// base drawing operations
router.put(
    '/:id/base',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.updateBaseDrawing
);

// Component operations
router.put(
    '/:id/components/add/child',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.addComponent
);

router.put(
    '/:id/components/add/parent',
    designController.addComponent
);

router.put(
    '/:id/components/update',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.updateComponent
);

router.put('/:id/components/rename',
    designController.renameComponent
);


// need to change the component file.
router.put(
    '/:id/components/update',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.updateComponent
);

router.delete('/:id/components',
    designController.deleteComponent
);


// Page operations 
router.put('/:id/pages',
    designController.addPage
);

router.put('/:id/reorder',
    designController.reorderPages
  );
  

router.put('/:id/pages/:pageId/rename',
    designController.renamePage
);

router.delete('/:id/pages/:pageId',
    designController.deletePage
);

export default router;