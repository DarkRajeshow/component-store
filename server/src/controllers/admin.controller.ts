import { Response } from 'express';
import { AuthRequest } from '../utils/auth';
import { User } from '../models/user.model';
import { Admin } from '../models/admin.model';
import { NotificationService } from '../services/notification.service';
import { ApprovalStatus, Designation } from '../types/user.types';

// Get all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().populate({
      path: 'reportingTo',
      select: 'name department designation mobileNo'
    });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Get all admins
export const getAllAdmins = async (req: AuthRequest, res: Response) => {
  try {
    const admins = await Admin.find();
    res.json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admins' });
  }
};

// Approve or disapprove a user
export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const user = await User.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user approval' });
  }
};

// Approve or disapprove an admin as system admin
export const approveAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isSystemAdmin } = req.body;
    const admin = await Admin.findByIdAndUpdate(id, { isSystemAdmin }, { new: true });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update admin status' });
  }
};

// Toggle User Disabled
export const toggleUserDisabled = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userType, user } = req;
    const actingUserId = req.userId;

    console.log(req);


    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only admin or department head (same department) can toggle
    if (userType === 'admin' || (userType === 'user' && user && 'designation' in user && user.designation === Designation.DEPARTMENT_HEAD && 'department' in user && user.department === userToUpdate.department)) {
      userToUpdate.isDisabled = !userToUpdate.isDisabled;
      await userToUpdate.save();

      // Log status
      userToUpdate.statusLogs.push({
        status: userToUpdate.isDisabled ? 'disabled' : 'enabled',
        timestamp: new Date(),
        message: `User ${userToUpdate.isDisabled ? 'disabled' : 'enabled'} by ${userType === 'admin' ? 'Admin' : 'Department Head'}`,
        updatedBy: actingUserId
      });
      await userToUpdate.save();

      // Send notification
      NotificationService.sendUserDisabledNotification(userToUpdate, userToUpdate.isDisabled).catch(() => { });

      return res.json({
        success: true,
        isDisabled: userToUpdate.isDisabled,
        message: `User ${userToUpdate.isDisabled ? 'Disabled' : 'Enabled'} successfully.`
      });
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to toggle user status' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
};

// Toggle Admin Disabled
export const toggleAdminDisabled = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userType } = req;
    const actingUserId = req.userId;

    if (userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can toggle admin status' });
    }

    const adminToUpdate = await Admin.findById(id);
    if (!adminToUpdate) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    adminToUpdate.isDisabled = !adminToUpdate.isDisabled;
    await adminToUpdate.save();

    console.log(adminToUpdate.isDisabled);

    // Log status
    adminToUpdate.statusLogs.push({
      status: adminToUpdate.isDisabled ? 'disabled' : 'enabled',
      timestamp: new Date(),
      message: `Admin ${adminToUpdate.isDisabled ? 'disabled' : 'enabled'} successfully.`,
      updatedBy: actingUserId
    });
    await adminToUpdate.save();

    // Send notification
    NotificationService.sendAdminDisabledNotification(adminToUpdate, adminToUpdate.isDisabled).catch(() => { });

    return res.json({
      success: true,
      isDisabled: adminToUpdate.isDisabled,
      message: `Admin ${adminToUpdate.isDisabled ? 'Disabled' : 'Enabled'} by Admin`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle admin status' });
  }
};
