// src/utils/notification-templates.ts
export const getNotificationTemplate = (type: string, data: any) => {
    const templates = {
        registration: {
            dh: {
                title: 'New User Registration',
                message: `${data.userName} from ${data.department} has registered and requires your approval.`,
                actionRequired: true,
                actionUrl: '/pending-approvals',
                priority: 'high' as const
            },
            user: {
                title: 'Registration Successful',
                message: 'Your registration has been completed successfully. Awaiting department head (if exists) & admin approval.',
                actionRequired: false,
                priority: 'medium' as const
            }
        },
        dh_approval: {
            admin: {
                title: 'Department Head Approval',
                message: `${data.userName} from ${data.department} has been approved by department head and requires your final approval.`,
                actionRequired: true,
                actionUrl: '/admin/pending-approvals',
                priority: 'high' as const
            },
            user: {
                title: 'Department Head Approved',
                message: 'Your application has been approved by your department head. Awaiting admin approval.',
                actionRequired: false,
                priority: 'medium' as const
            }
        },
        admin_approval: {
            user: {
                title: 'Account Approved',
                message: 'Congratulations! Your account has been fully approved and activated.',
                actionRequired: false,
                priority: 'high' as const
            }
        },
        rejection: {
            user: {
                title: 'Application Rejected',
                message: `Your application has been rejected. ${data.remarks || 'Please contact your administrator for more details.'}`,
                actionRequired: false,
                priority: 'high' as const
            }
        }
    };

    return templates[type as keyof typeof templates] || null;
};