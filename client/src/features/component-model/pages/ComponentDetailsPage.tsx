import { useEffect, useState } from 'react';
import { getComponentDetails, deleteComponent } from '../services/api';
import { Component, Revision } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RevisionUploadModal } from '../components/RevisionUploadModal';
import { PdfViewerModal } from '../components/PdfViewerModal';
import {
  FileUp,
  User,
  Clock,
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  FileText,
  Users,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks';

interface ComponentDetailsPageProps {
  // componentId: string;
  onBack?: () => void;
}

export function ComponentDetailsPage({ onBack }: ComponentDetailsPageProps) {

  const { id: componentId } = useParams();
  const [component, setComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  const isDesigner = user?.role === 'designer' || user?.role === 'admin';

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComponentDetails(componentId || '');
      setComponent(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load component details';
      setError(errorMessage);
      toast.error('Failed to load component details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line
  }, [componentId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Loading component details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Failed to load component</h3>
            <p className="text-muted-foreground mb-4">{error || 'Component not found'}</p>
            <div className="flex gap-2 justify-center">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft size={16} className="mr-2" />
                  Go Back
                </Button>
              )}
              <Button onClick={fetchDetails}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedRevisions = [...component.revisions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleViewPdf = (revision: Revision) => {
    setSelectedRevision(revision);
    setShowPdfViewer(true);
  };

  const handleDownloadPdf = async (revision: Revision) => {
    setDownloadingFileId(revision.fileId);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/components/revisions/${revision.fileId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = revision.originalFileName || `${revision.fileId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDeleteComponent = async () => {
    if (!component) return;
    
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!component) return;

    setIsDeleting(true);
    try {
      await deleteComponent(component._id);
      toast.success('Component deleted successfully');
      // Navigate back to the components list
      if (onBack) {
        onBack();
      } else {
        window.history.back();
      }
    } catch (error) {
      console.error('Failed to delete component:', error);
      toast.error('Failed to delete component');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft size={16} />
              Back to List
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-medium text-foreground">{component.name}</h1>
            <p className="text-muted-foreground mt-1">Component Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDesigner && (
            <>
              <Button onClick={() => setShowUpload(true)} className="gap-2">
                <FileUp size={16} />
                Upload Revision
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteComponent}
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 size={16} />
                Delete Component
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Component Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Component Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Component Code</label>
                  <Badge variant="secondary" className="text-base font-medium block">
                    {component.componentCode}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Latest Issue</label>
                  <Badge variant="secondary" className="text-base font-medium block">
                    {component.issueNumber || 'Not set'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Latest Revision</label>
                  <Badge variant="secondary" className="text-base font-medium block">
                    {component.latestRevisionNumber}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Revisions</label>
                  <Badge variant="secondary" className="text-base font-medium block">
                    {component.revisions.length}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-foreground mt-1">{component.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Revisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp size={20} />
                Revision History
                <Badge variant="outline">{component.revisions.length} revisions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {component.revisions.length === 0 ? (
                <div className="text-center py-8">
                  <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No revisions yet</h3>
                  <p className="text-muted-foreground mb-4">Upload the first revision to get started</p>
                  <Button onClick={() => setShowUpload(true)}>
                    Upload First Revision
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isDesigner ? sortedRevisions.map((revision, index) => (
                    <div key={revision._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? "default" : "outline"} className="text-sm">
                            Rev {revision.revisionNumber}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(revision.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <User size={14} />
                            {revision.createdBy?.name}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-foreground">{revision.remark}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleViewPdf(revision)}
                        >
                          <Eye size={14} />
                          View PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDownloadPdf(revision)}
                          disabled={downloadingFileId === revision.fileId}
                        >
                          {downloadingFileId === revision.fileId ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              Download
                            </>
                          )}
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {revision.originalFileName}
                        </span>
                      </div>
                    </div>
                  )) : sortedRevisions.slice(0, 1).map((revision, index) => (
                    <div key={revision._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? "default" : "outline"} className="text-sm">
                            Rev {revision.revisionNumber}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(revision.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <User size={14} />
                            {revision.createdBy?.name}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-foreground">{revision.remark}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleViewPdf(revision)}
                        >
                          <Eye size={14} />
                          View PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDownloadPdf(revision)}
                          disabled={downloadingFileId === revision.fileId}
                        >
                          {downloadingFileId === revision.fileId ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              Download
                            </>
                          )}
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {revision.originalFileName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <div className="flex items-center gap-2 mt-1">
                  <User size={16} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{component.createdBy?.name}</p>
                    <p className="text-sm text-muted-foreground">{component.createdBy?.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={16} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{new Date(component.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{new Date(component.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated By</label>
                <div className="flex items-center gap-2 mt-1">
                  <User size={16} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{component.lastUpdatedBy?.name}</p>
                    <p className="text-sm text-muted-foreground">{component.lastUpdatedBy?.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={16} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{new Date(component.lastUpdatedAt).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{new Date(component.lastUpdatedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Notify To
              </CardTitle>
            </CardHeader>
            <CardContent>
              {component.notifyTo.length === 0 ? (
                <p className="text-muted-foreground text-sm">No users to notify</p>
              ) : (
                <div className="space-y-2">
                  {component.notifyTo.map(user => (
                    <div key={user._id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <User size={16} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <RevisionUploadModal
          componentId={component._id}
          component={component}
          onSuccess={() => {
            fetchDetails();
            setShowUpload(false);
            toast.success('Revision uploaded successfully!');
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* PDF Viewer Modal */}
      {selectedRevision && (
        <PdfViewerModal
          revision={selectedRevision}
          open={showPdfViewer}
          onClose={() => {
            setShowPdfViewer(false);
            setSelectedRevision(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className='bg-background dark:bg-zinc-900'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Component</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete component "{component?.name}"? 
              This action cannot be undone and will delete all associated revisions and files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Component'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 