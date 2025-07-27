# Notification Feature Module

This folder contains a modular, robust notification system for React apps using Socket.IO and shadcn/ui components.

## Structure

- `hooks/useNotification.ts`: Custom hook for managing notification state, socket connection, and events.
- `components/NotificationBell.tsx`: Bell icon with unread count, sound, and popup trigger.
- `components/NotificationList.tsx`: List of notifications, mark as read, shadcn UI.
- `services/notificationService.ts`: API calls for notifications.
- `index.ts`: Entry point for easy import.

## Features
- Real-time notifications via Socket.IO
- Unread count badge
- Notification sound and popup
- Mark as read (single/all)
- Modular, reusable, SOLID principles
- Easy to integrate into any project

## Usage
1. Import and use `NotificationBell` and `NotificationList` in your Navbar or layout.
2. Use the `useNotification` hook for notification state and actions.
3. Ensure your backend emits events as per the contract (see backend docs).

## Best Practices
- Uses shadcn/ui for consistent design
- All logic is encapsulated in the feature folder
- No global state pollution
- Easy to copy/move to other projects

---

For questions, see the code comments or contact the author. 