import { useEffect, useState } from 'react';
import { getComponentDetails } from '../services/api';
import { Component, Revision } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RevisionUploadModal } from './RevisionUploadModal';
import { ComponentCreateModal } from './ComponentCreateModal';
import { FileUp, User, Clock, Edit, Trash2, ArrowLeft, FileText, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ComponentDetailsPageProps {
  componentId: string;
  onBack?: () => void;
}

export function ComponentDetailsPage({ componentId, onBack }: ComponentDetailsPageProps) {
  const [component, setComponent] = useState<Component | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await getComponentDetails(componentId);
      setComponent(data);
    } catch (error) {
      toast.error('Failed to load component details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line
  }, [componentId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/components/${componentId}`);
      toast.success('Component deleted successfully');
      onBack?.();
    } catch (error) {
      toast.error('Failed to delete component');
    }
  };

  const handleEditSuccess = () => {
    fetchDetails();
    setShowEdit(false);
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!component) return <div className="flex justify-center items-center h-64">Component not found</div>;

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft size={20} />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{component.name}</h1>
            <p className="text-muted-foreground">{component.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEdit(true)} className="gap-2">
            <Edit size={18} />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 size={18} />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Component</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{component.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Component Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Component Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Component Code</label>
                <p className="text-lg font-semibold">{component.componentCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Issue Number</label>
                <p className="text-lg font-semibold">{component.issueNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Latest Revision</label>
                <p className="text-lg font-semibold">{component.latestRevisionNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{new Date(component.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={16} />
                <span>Created by: {component.createdBy?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Last updated by: {component.lastUpdatedBy?.name}</span>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notify To:</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {component.notifyTo.map(user => (
                    <Badge key={user._id} variant="secondary">{user.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revisions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileUp size={20} />
              Revisions ({component.revisions.length})
            </CardTitle>
            <Button onClick={() => setShowUpload(true)} className="gap-2">
              <FileUp size={18} />
              Upload New Revision
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {component.revisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No revisions uploaded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {component.revisions.map((rev: Revision) => (
                <Card key={rev._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Rev {rev.revisionNumber}</Badge>
                      <div>
                        <p className="font-medium">{rev.remark}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(rev.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {rev.createdBy?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/design-files/${rev.fileId}.pdf`} target="_blank" rel="noopener noreferrer">
                          View PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showUpload && (
        <RevisionUploadModal
          componentId={component._id}
          component={component}
          onSuccess={fetchDetails}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showEdit && (
        <ComponentCreateModal
          open={showEdit}
          onOpenChange={setShowEdit}
          onSuccess={handleEditSuccess}
          component={component}
        />
      )}
    </div>
  );
} 