import { EmailNotificationPayload, NotificationPayload, SocketNotificationPayload } from "./notification.types";

export interface NotificationJob {
    type: 'in-app' | 'email' | 'both';
    inAppPayload?: NotificationPayload;
    emailPayload?: EmailNotificationPayload;
    socketPayload?: SocketNotificationPayload;
}
