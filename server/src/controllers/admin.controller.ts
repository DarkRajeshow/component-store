import { Response } from 'express';
import type { Request } from 'express';
import { User } from '../models/user.model';
import { Admin } from '../models/admin.model';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
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
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.find();
    res.json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admins' });
  }
};

// Approve or disapprove a user
export const approveUser = async (req: Request, res: Response) => {
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
export const approveAdmin = async (req: Request, res: Response) => {
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
