// src/types/notification.types.ts

import mongoose from "mongoose";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    recipientType: 'user' | 'admin';
    type: 'registration' | 'dh_approval' | 'admin_approval' | 'rejection' | 'status_update';
    title: string;
    message: string;
    data?: any; // Additional data for the notification
    isRead: boolean;
    isDeleted: boolean;
    priority: 'low' | 'medium' | 'high';
    actionRequired: boolean;
    actionUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    readAt?: Date;
}

export interface NotificationPayload {
    recipient: string;
    recipientType: 'user' | 'admin';
    type: 'registration' | 'dh_approval' | 'admin_approval' | 'rejection' | 'status_update';
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'medium' | 'high';
    actionRequired?: boolean;
    actionUrl?: string;
}

export interface EmailNotificationPayload {
    to: string;
    subject: string;
    html: string;
    priority?: 'low' | 'medium' | 'high';
    retries?: number;
}

export interface SocketNotificationPayload {
    recipient: string;
    notification: INotification;
}