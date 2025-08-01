import { NotificationList } from '@/features/notification/components/NotificationList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
// import NotificationsPage from '@/pages/NotificationsPage';

const NotificationsPage = () => {
    return (
        <div className="w-full flex flex-col items-center py-8">
            <div className="w-full max-w-2xl px-4 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">All Notifications</h1>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/">Home</Link>
                    </Button>
                </div>
                <Card>
                    <NotificationList previewMode={false} />
                </Card>
            </div>
        </div>
    );
};

export default NotificationsPage; 