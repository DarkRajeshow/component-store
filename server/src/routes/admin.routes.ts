import express from 'express';
import { getAllUsers, getAllAdmins } from '../controllers/admin.controller';
import { adminApprovalForAdmin, adminApprovalForUser } from '../controllers/auth.controller';
import { isLoggedIn } from '../middleware/isLoggedIn.middleware';

const router = express.Router();

// All routes require admin to be logged in
router.get('/all-users', getAllUsers);
router.get('/all-admins', getAllAdmins);
router.post('/approve-user/:id', isLoggedIn, adminApprovalForUser);
router.post('/approve-admin/:id', isLoggedIn, adminApprovalForAdmin);
// router.post('/admin-final-approval/:id', isLoggedIn, adminFinalApproval);

export default router;
