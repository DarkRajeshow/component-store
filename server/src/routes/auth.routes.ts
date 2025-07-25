// src/routes/auth.ts
import express from 'express';
import {
    registerUser,
    loginUser,
    departmentHeadApproval,
    // adminFinalApproval,
    getUserStatus,
    getPendingUsersForDH,
    getPendingUsersForAdmin,
    getDepartmentHierarchy,
    logout,
    getCurrentUser,
    createInitialAdmin
} from '../controllers/auth.controller';
import {
    authenticateToken,
    authorize,
    requireApproval,
    requireDepartmentHead
} from '../utils/auth';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/department-hierarchy', getDepartmentHierarchy);

// Admin setup route (use only once)
router.post('/setup-admin', createInitialAdmin);

// Protected routes - require authentication
router.get('/me', authenticateToken, getCurrentUser);
router.get('/status', authenticateToken, getUserStatus);

// Department Head routes
router.get('/pending-users/department',
    authenticateToken,
    authorize('designer', 'other'),
    requireDepartmentHead,
    getPendingUsersForDH
);

router.post('/approve/department',
    authenticateToken,
    authorize('designer', 'other'),
    requireDepartmentHead,
    departmentHeadApproval
);

// Admin routes
router.get('/pending-users/admin',
    authenticateToken,
    authorize('admin'),
    getPendingUsersForAdmin
);

// router.post('/approve/admin',
//     authenticateToken,
//     authorize('admin'),
//     adminFinalApproval
// );

export default router;
