import express from 'express';
import componentController from '../controllers/component.controller';
import multer from 'multer';
import path from 'path';
import { authenticateToken, authorize } from '../utils/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'temp-uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

router.post('/', authenticateToken, authorize('designer', 'admin'), upload.single('file'), componentController.createComponent);
router.get('/', componentController.getComponents);
router.get('/:id', componentController.getComponentDetails);
router.put('/:id', authenticateToken, authorize('designer', 'admin'), componentController.updateComponent);
router.delete('/:id', authenticateToken, authorize('designer', 'admin'), componentController.deleteComponent);
router.post('/:id/revisions', authenticateToken, authorize('designer', 'admin'), upload.single('file'), componentController.uploadRevision);
router.get('/revisions/:fileId/download', componentController.downloadRevision);

export default router;
