import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticateToken, authorize } from '../utils/auth';

const router = Router();

router.get('/reporting-to', userController.getReportingTo);
router.get('/search', userController.searchUsers);
router.get('/', userController.getAllUsers);
router.get('/me', authenticateToken, userController.getCurrentUserProfile);
router.put('/me', authenticateToken, userController.updateCurrentUserProfile);
router.put('/me/password', authenticateToken, userController.changePassword);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', authenticateToken, authorize('admin'), userController.deleteUser);


export default router;
