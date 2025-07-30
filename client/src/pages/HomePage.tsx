import { useEffect, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { NotificationList } from '@/features/notification/components/NotificationList';
import { Card } from '@/components/ui/card';
import { getComponents } from '@/features/component-model/services/api';
import { Component } from '@/features/component-model/types';
import { Loader2, ArrowRight } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [recentComponents, setRecentComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isDh = user?.designation === 'Department Head';

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      try {
        const res = await getComponents({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
        setRecentComponents(res.components || []);
      } catch {
        setRecentComponents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center">
      <div className="w-full max-w-7xl px-6 flex flex-col gap-4 pb-20">
        {/* Welcome & Quick Links */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{isAuthenticated && user ? `Welcome, ${user.name}!` : 'Welcome to ComponentStore'}</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-xl">
              {isAuthenticated
                ? 'Your daily hub for managing engineering components, approvals, and notifications.'
                : 'The all-in-one platform for managing engineering components, approvals, and collaboration. Sign in or register to get started!'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <Link to="/components">All Components</Link>
            </Button>
            {isAuthenticated && user?.role === 'admin' && (
              <Button asChild variant="outline">
                <Link to="/admin-dashboard">Admin Dashboard</Link>
              </Button>
            )}
            {isAuthenticated && user?.designation === 'Department Head' && (
              <Button asChild variant="outline">
                <Link to="/dh-dashboard">DH Dashboard</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications Preview */}
          <Card className="p-0 shadow-sm border border-zinc-200 dark:border-zinc-800 h-[340px] flex flex-col">
            {/* <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-zinc-800">Notifications</span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/notifications">View All</Link>
              </Button>
            </div> */}
            <div className="flex-1 overflow-y-auto">
              <NotificationList previewMode={true} />
            </div>
          </Card>

          {/* Recent Components */}
          <Card className="p-0 gap-2 shadow-sm border border-zinc-200 dark:border-zinc-800 h-[340px] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">Recently Added Components</span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/components">View All</Link>
              </Button>
            </div>
            <div className="flex-1 divide-y overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6" />
                </div>
              ) : recentComponents.length === 0 ? (
                <div className="p-4 text-center">No recent components found.</div>
              ) : recentComponents.map((c) => (
                <Link to={`/components/${c._id}`} key={c._id} className="block hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">Added {new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <DatePicker date={new Date()} onDateChange={() => {}} />

        {/* App Glimpse Section */}
        <div className={`grid grid-cols-1 gap-6 mt-2 ${isAdmin || isDh ? 'md:grid-cols-3 ' : 'md:grid-cols-2'}`}>
          <Card className="p-6 flex flex-col gap-2 items-start border border-zinc-200 dark:border-zinc-800">
            <div className="text-lg font-semibold mb-1">Component Management</div>
            <div className="text-muted-foreground text-sm mb-2">Create, view, and manage all your engineering components in one place. Stay organized and up-to-date with the latest changes.</div>
            <Button asChild size="sm" variant="outline">
              <Link to="/components">Go to Components</Link>
            </Button>
          </Card>
          {isAdmin && (
            <Card className="p-6 flex flex-col gap-2 items-start border border-zinc-200 dark:border-zinc-800">
              <div className="text-lg font-semibold mb-1">Approvals & Admin</div>
              <div className="text-muted-foreground text-sm mb-2">Track pending approvals, manage users, and access admin tools for streamlined workflows.</div>
              <Button asChild size="sm" variant="outline">
                <Link to={'/admin-dashboard'}>Go to Dashboard</Link>
              </Button>
            </Card>
          )}
          {isDh && (
            <Card className="p-6 flex flex-col gap-2 items-start border border-zinc-200 dark:border-zinc-800">
              <div className="text-lg font-semibold mb-1">DH Dashboard</div>
              <div className="text-muted-foreground text-sm mb-2">Track pending approvals, manage users, and access department head tools for streamlined workflows.</div>
              <Button asChild size="sm" variant="outline">
                <Link to={'/dh-dashboard'}>Go to Dashboard</Link>
              </Button>
            </Card>
          )}
          <Card className="p-6 flex flex-col gap-2 items-start border border-zinc-200 dark:border-zinc-800">
            <div className="text-lg font-semibold mb-1">Notifications & Updates</div>
            <div className="text-muted-foreground text-sm mb-2">Stay informed with real-time notifications about new components, revisions, and approvals.</div>
            <Button asChild size="sm" variant="outline">
              <Link to="/notifications">View Notifications</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;