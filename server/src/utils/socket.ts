// src/utils/socket.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Admin } from '../models/admin.model';

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Authentication middleware for Socket.IO
    io.use(async (socket: Socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

            // Verify user exists
            let user;
            if (decoded.userType === 'admin') {
                user = await Admin.findById(decoded.id);
            } else {
                user = await User.findById(decoded.id);
            }

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.data.user = {
                id: user._id.toString(),
                email: user.email,
                userType: decoded.userType
            };

            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user?.id;
        const userType = socket.data.user?.userType;

        console.log(`User connected: ${userId} (${userType})`);

        // Join user to their personal room
        socket.join(`user_${userId}`);

        // Handle notification events
        socket.on('mark-notification-read', async (notificationId: string) => {
            try {
                await import('../services/notification.service').then(({ NotificationService }) => {
                    return NotificationService.markAsRead(notificationId, userId);
                });
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        });

        socket.on('mark-all-notifications-read', async () => {
            try {
                await import('../services/notification.service').then(({ NotificationService }) => {
                    return NotificationService.markAllAsRead(userId);
                });
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        });

        socket.on('get-unread-count', async (callback) => {
            try {
                const { NotificationService } = await import('../services/notification.service');
                const count = await NotificationService.getUnreadCount(userId);
                callback({ success: true, count });
            } catch (error) {
                console.error('Error getting unread count:', error);
                callback({ success: false, count: 0 });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
        });
    });

    console.log('Socket.IO server initialized');
    return io;
};

export const getSocketInstance = (): SocketIOServer | null => {
    return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

export const emitToAll = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};

// src/package.json additions (add these to your existing package.json)
/*
Add these dependencies to your backend package.json:

"bull": "^4.12.9",
"@types/bull": "^4.10.0",
"nodemailer": "^6.9.8",
"@types/nodemailer": "^6.4.14",
"socket.io": "^4.7.4",
"redis": "^4.6.12"
*/