import express from 'express';
import { getAllUsers, getAllAdmins, toggleUserDisabled, toggleAdminDisabled } from '../controllers/admin.controller';
import { adminApprovalForAdmin, adminApprovalForUser, getDepartmentUsers } from '../controllers/auth.controller';
import { authenticateToken, authorize, requireDepartmentHead } from '../utils/auth';

const router = express.Router();

// All routes require admin to be logged in
router.get('/all-users', authenticateToken, authorize('admin',), getAllUsers);
router.get('/all-admins', authenticateToken, authorize('admin'), getAllAdmins);
router.post('/approve-user/:id', authenticateToken, authorize('admin'), adminApprovalForUser);
router.post('/approve-admin/:id', authenticateToken, authorize('admin'), adminApprovalForAdmin);
router.post('/toggle-user-disabled/:id', authenticateToken, authorize('admin', 'user'), toggleUserDisabled);
router.post('/toggle-admin-disabled/:id', authenticateToken, authorize('admin'), toggleAdminDisabled);

// Department Head routes
router.get('/department-users', authenticateToken, requireDepartmentHead, getDepartmentUsers);

// router.post('/admin-final-approval/:id', isLoggedIn, adminFinalApproval);

export default router;