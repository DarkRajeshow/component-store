import { Request, Response } from 'express';
import userService from '../services/user.service';
import { User } from '../models/user.model';

class UserController {
    async getReportingTo(req: Request, res: Response) {
        try {
            const { designation, department } = req.query;
            if (!designation || !department) {
                return res.status(400).json({ message: 'Designation and department are required' });
            }
            const users = await userService.getReportingTo(designation as string, department as string);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async searchUsers(req: Request, res: Response) {
        try {
            const { search, limit = 10 } = req.query;
            
            let query = {};
            if (search && typeof search === 'string') {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            const users = await User.find(query)
                .select('_id name email')
                .limit(Number(limit))
                .sort({ name: 1 });

            res.status(200).json({ users });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }
}

export default new UserController();
