import React, { useState, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createComponent, updateComponent } from '../services/api';
import { Component } from '../types';
import { toast } from 'sonner';
import { 
  Loader2, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Upload,
  File,
  X,
  Download
} from 'lucide-react';
import { MultiSelectCombobox } from '@/components/ui/combobox';
import { useUserSearch } from '../hooks/useUserSearch';

// Dynamic schema based on edit mode
const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  componentCode: z.string().min(1, 'Component code is required'),
  issueNumber: z.string().min(1, 'Issue number is required'),
  latestRevisionNumber: z.string().min(1, 'Revision number is required'),
  remark: z.string().min(2, 'Remark must be at least 2 characters'),
  notifyTo: z.array(z.string()).min(1, 'Select at least one user to notify'),
  file: z.any().refine((files) => files?.length > 0, 'File is required'),
});

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  componentCode: z.string().min(1, 'Component code is required'),
  issueNumber: z.string().min(1, 'Issue number is required'),
  latestRevisionNumber: z.string().min(1, 'Revision number is required'),
  remark: z.string().min(2, 'Remark must be at least 2 characters'),
  notifyTo: z.array(z.string()).min(1, 'Select at least one user to notify'),
  file: z.any().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;
type FormValues = CreateFormValues | EditFormValues;

interface ComponentCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  component?: Component; // For edit mode
}

export function ComponentCreateModal({ open, onOpenChange, onSuccess, component }: ComponentCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const isEditMode = !!component;
  
  // Use the user search hook for dynamic user fetching
  const { users, loading: usersLoading, error: usersError, searchUsers } = useUserSearch();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({ 
    resolver: zodResolver(isEditMode ? editSchema : createSchema),
    mode: 'onChange',
    defaultValues: {
      name: component?.name || '',
      description: component?.description || '',
      componentCode: component?.componentCode || '',
      issueNumber: component?.issueNumber || '',
      latestRevisionNumber: component?.latestRevisionNumber || '',
      remark: '',
      notifyTo: component?.notifyTo?.map(u => u._id) || [],
    }
  });

  const notifyTo = watch('notifyTo') || [];
  const watchedValues = watch();

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        setValue('file', [file]);
        validateFileName();
      } else {
        setFileError('Please upload a PDF file');
      }
    }
  }, [setValue]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        setValue('file', [file]);
        validateFileName();
      } else {
        setFileError('Please upload a PDF file');
      }
    }
  }, [setValue]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setValue('file', undefined);
    setFileError(null);
  }, [setValue]);

  const validateFileName = () => {
    const { componentCode, issueNumber, latestRevisionNumber, file } = watchedValues;
    // Only validate file name in create mode
    if (!isEditMode && componentCode && issueNumber && latestRevisionNumber && file?.[0]) {
      const expectedFileName = `${componentCode}_${issueNumber}_${latestRevisionNumber}.pdf`;
      if (file[0].name !== expectedFileName) {
        setFileError(`File name must be exactly: ${expectedFileName}`);
        return false;
      }
    }
    setFileError(null);
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    // Only validate file name in create mode
    if (!isEditMode && !validateFileName()) {
      toast.error('File name validation failed');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateComponent(component._id, data);
        toast.success('Component updated successfully!');
      } else {
        // Create component with first revision
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('componentCode', data.componentCode);
        formData.append('issueNumber', data.issueNumber);
        formData.append('revisionNumber', data.latestRevisionNumber);
        formData.append('remark', data.remark);
        formData.append('date', new Date().toISOString().split('T')[0]);
        // Append each user ID individually to FormData
        data.notifyTo.forEach((userId: string) => {
          formData.append('notifyTo', userId);
        });
        formData.append('file', uploadedFile!);
        
        await createComponent(formData);
        toast.success('Component created successfully!');
      }
      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} component`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setFileError(null);
      setUploadedFile(null);
      setDragActive(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isEditMode ? (
              <>
                <Edit className="h-6 w-6 text-primary" />
                <DialogTitle className="text-2xl font-bold">Edit Component</DialogTitle>
              </>
            ) : (
              <>
                <Plus className="h-6 w-6 text-primary" />
                <DialogTitle className="text-2xl font-bold">Create New Component</DialogTitle>
              </>
            )}
          </div>
          <p className="text-muted-foreground">
            {isEditMode 
              ? 'Update component information and notification settings'
              : 'Define component metadata, upload initial revision, and set up notifications'
            }
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Component Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Component Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Define the core component details and specifications
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Component Name *
                      </Label>
                      <Input 
                        id="name"
                        {...register('name')} 
                        placeholder="e.g., Main Bearing Housing"
                        className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.name && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.name.message}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="componentCode" className="text-sm font-medium">
                        Component Code *
                      </Label>
                      <Input 
                        id="componentCode"
                        {...register('componentCode')} 
                        placeholder="e.g., MBH-001"
                        className={errors.componentCode ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.componentCode && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.componentCode.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issueNumber" className="text-sm font-medium">
                        Issue Number *
                      </Label>
                      <Input 
                        id="issueNumber"
                        {...register('issueNumber')} 
                        placeholder="e.g., 01"
                        className={errors.issueNumber ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.issueNumber && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.issueNumber.message}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="latestRevisionNumber" className="text-sm font-medium">
                        Revision Number *
                      </Label>
                      <Input 
                        id="latestRevisionNumber"
                        {...register('latestRevisionNumber')} 
                        placeholder="e.g., 00"
                        className={errors.latestRevisionNumber ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.latestRevisionNumber && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.latestRevisionNumber.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description *
                    </Label>
                    <Textarea 
                      id="description"
                      {...register('description')} 
                      placeholder="Provide a detailed description of the component, its purpose, and key specifications..."
                      rows={4}
                      className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.description && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description.message}
                      </div>
                    )}
                  </div>

                  {!isEditMode && (
                    <div className="space-y-2">
                      <Label htmlFor="remark" className="text-sm font-medium">
                        Initial Revision Remark *
                      </Label>
                      <Textarea 
                        id="remark"
                        {...register('remark')} 
                        placeholder="Describe the initial revision and any important notes..."
                        rows={3}
                        className={errors.remark ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.remark && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.remark.message}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* File Upload Section - Only for new components */}
              {!isEditMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Initial Revision File
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload the first revision file for this component
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        PDF File *
                      </Label>
                      
                      {/* Drag & Drop Area */}
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                          dragActive
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : uploadedFile
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          {uploadedFile ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-8 w-8" />
                                <span className="font-medium">File Uploaded Successfully</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <File className="h-4 w-4" />
                                <span className="font-medium">{uploadedFile.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeFile}
                                className="gap-2"
                              >
                                <X className="h-4 w-4" />
                                Remove File
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center w-12 mx-auto h-12 bg-gray-100 rounded-full">
                                <Upload className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  Drag and drop your PDF file here
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  or click to browse files
                                </p>
                              </div>  
                              <Input
                                id="file"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('file')?.click()}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Choose File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error Messages */}
                      {(fileError || errors.file?.message) && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {fileError || (errors.file?.message as string)}
                        </div>
                      )}

                      {/* Expected Filename Preview */}
                      {watchedValues.componentCode && watchedValues.issueNumber && watchedValues.latestRevisionNumber && (
                        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded border">
                          <p className="font-medium mb-1">Expected filename:</p>
                          <code className="bg-background px-2 py-1 rounded border text-xs">
                            {watchedValues.componentCode}_{watchedValues.issueNumber}_{watchedValues.latestRevisionNumber}.pdf
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Notification Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select users who will be notified when revisions are uploaded
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Notify Users *
                    </Label>
                    <MultiSelectCombobox
                      options={users.map((user) => ({ 
                        label: `${user.name} (${user.email})`, 
                        value: user._id 
                      }))}
                      value={notifyTo}
                      onChange={(vals) => setValue('notifyTo', vals, { shouldValidate: true })}
                      placeholder="Search and select users to notify..."
                      error={errors.notifyTo?.message}
                      disabled={isSubmitting}
                      loading={usersLoading}
                      onSearch={searchUsers}
                      searchPlaceholder="Search users by name or email..."
                    />
                    {errors.notifyTo && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.notifyTo.message}
                      </div>
                    )}
                    {usersError && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {usersError}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Selected users will receive real-time notifications for component updates</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Form Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Component Name</label>
                    <p className="text-sm font-medium">
                      {watchedValues.name || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Component Code</label>
                    <p className="text-sm font-medium">
                      {watchedValues.componentCode || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Issue Number</label>
                    <p className="text-sm font-medium">
                      {watchedValues.issueNumber || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Revision Number</label>
                    <p className="text-sm font-medium">
                      {watchedValues.latestRevisionNumber || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {watchedValues.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Notify Users</label>
                    <p className="text-sm">
                      {notifyTo.length > 0 
                        ? `${notifyTo.length} user${notifyTo.length !== 1 ? 's' : ''} selected`
                        : 'No users selected'
                      }
                    </p>
                  </div>
                  {!isEditMode && uploadedFile && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">File</label>
                      <div className="flex items-center gap-2 text-sm">
                        <File className="h-4 w-4" />
                        <span>{uploadedFile.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <span className=" text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Create Component</p>
                      <p className="text-xs text-muted-foreground">Save the component metadata</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <span className=" text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload Initial Revision</p>
                      <p className="text-xs text-muted-foreground">Add the first drawing file</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Manage Revisions</p>
                      <p className="text-xs text-muted-foreground">Track version history</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Separator />
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !isValid}
              className="w-full sm:w-auto gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <>
                      <Edit className="h-4 w-4" />
                      Update Component
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Component
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 