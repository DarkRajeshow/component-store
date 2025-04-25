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
// router.put('/:id/categories/:categoryId/categories', designController.addCategory);
// router.put('/:id/categories/:categoryId/rename', designController.renameCategory);
// router.delete('/:id/categories/:categoryId', designController.deleteCategory);


// hash related routes
router.get('/hash/:hash',
    designController.getDesignByHash
);



// base drawing operations
router.put(
    '/:id/categories/:categoryId/base',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.updateBaseDrawing
);

// Component operations
router.put(
    '/:id/categories/:categoryId/components/add/child',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.addComponent
);

router.put(
    '/:id/categories/:categoryId/components/add/parent',
    designController.addComponent
);

router.put(
    '/:id/categories/:categoryId/components/update',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.updateComponent
);

router.put('/:id/categories/:categoryId/components/rename',
    designController.renameComponent
);


// need to change the component file.
router.put(
    '/:id/categories/:categoryId/components/update',
    designUpload.array('files') as express.RequestHandler,
    handlePDFtoSVG as express.RequestHandler<any, any, RequestWithFiles>,
    optimizeSVG as express.RequestHandler<any, any, RequestWithFiles>,
    designController.updateComponent
);

router.delete('/:id/categories/:categoryId/components',
    designController.deleteComponent
);


// Page operations 
router.put('/:id/categories/:categoryId/pages',
    designController.addPage
);

router.put('/:id/categories/:categoryId/pages/reorder',
    designController.reorderPages
  );
  

router.put('/:id/categories/:categoryId/pages/:pageId/rename',
    designController.renamePage
);

router.delete('/:id/categories/:categoryId/pages/:pageId',
    designController.deletePage
);




export default router;