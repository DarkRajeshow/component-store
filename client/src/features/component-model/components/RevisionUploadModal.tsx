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
import { uploadRevision } from '../services/api';
import { Component } from '../types';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  File,
  X,
  Loader2,
  UploadCloud,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { MultiSelectCombobox } from '@/components/ui/combobox';
import { useUserSearch } from '../hooks/useUserSearch';

const schema = z.object({
  issueNumber: z.string().min(1, 'Issue number is required'),
  revisionNumber: z.string().min(1, 'Revision number is required'),
  remark: z.string().min(2, 'Remark must be at least 2 characters'),
  date: z.string().min(1, 'Date is required'),
  componentCode: z.string().min(1, 'Component code is required'),
  file: z.any().refine((files) => files?.length > 0, 'File is required'),
  notifyTo: z.array(z.string()).min(1, 'Select at least one user to notify'),
});

type FormValues = z.infer<typeof schema>;

interface RevisionUploadModalProps {
  componentId: string;
  component: Component;
  onSuccess?: () => void;
  onClose: () => void;
}

export function RevisionUploadModal({ componentId, component, onSuccess, onClose }: RevisionUploadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
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
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      issueNumber: component.issueNumber || '',
      revisionNumber: '',
      remark: '',
      date: new Date().toISOString().split('T')[0],
      componentCode: component.componentCode,
      notifyTo: component.notifyTo?.map(u => u._id) || [],
    }
  });

  const notifyTo = watch('notifyTo') || [];
  const watchedValues = watch();

  const validateFileName = useCallback(() => {
    const { componentCode, issueNumber, revisionNumber } = watchedValues;
    if (componentCode && issueNumber && revisionNumber && uploadedFile) {
      const expectedFileName = `${componentCode}_${issueNumber}_${revisionNumber}.pdf`;
      if (uploadedFile.name !== expectedFileName) {
        setFileError(`File name must be exactly: ${expectedFileName}`);
        return false;
      }
    }
    setFileError(null);
    return true;
  }, [watchedValues, uploadedFile]);

  // Update file validation when values change
  React.useEffect(() => {
    if (uploadedFile) {
      validateFileName();
    }
  }, [validateFileName, uploadedFile]);

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
        setFileError(null);
      } else {
        setFileError('Please upload a PDF file');
      }
    }
  }, [setValue]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        setValue('file', [file]);
        setFileError(null);
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

  const onSubmit = async (data: FormValues) => {
    if (!validateFileName()) {
      toast.error('File name validation failed');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('issueNumber', data.issueNumber);
      formData.append('revisionNumber', data.revisionNumber);
      formData.append('remark', data.remark);
      formData.append('date', data.date);
      formData.append('componentCode', data.componentCode);
      formData.append('file', uploadedFile!);
      
      // Append each user ID individually to FormData
      data.notifyTo.forEach((userId: string) => {
        formData.append('notifyTo', userId);
      });
      
      await uploadRevision(componentId, formData);
      toast.success('Revision uploaded successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload revision');
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
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Upload className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl font-bold">Upload New Revision</DialogTitle>
          </div>
          <p className="text-gray-600">
            Upload a new revision for "{component.name}" and update component metadata
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Revision Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Revision Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Define the revision details and specifications
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <Label htmlFor="revisionNumber" className="text-sm font-medium">
                        Revision Number *
                      </Label>
                      <Input 
                        id="revisionNumber"
                        {...register('revisionNumber')} 
                        placeholder="e.g., 01"
                        className={errors.revisionNumber ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.revisionNumber && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.revisionNumber.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remark" className="text-sm font-medium">
                      Revision Remark *
                    </Label>
                    <Textarea 
                      id="remark"
                      {...register('remark')} 
                      placeholder="Describe the changes in this revision..."
                      rows={4}
                      className={errors.remark ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.remark && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.remark.message}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Revision Date *
                    </Label>
                    <Input 
                      id="date"
                      type="date" 
                      {...register('date')} 
                      className={errors.date ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.date && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.date.message}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* File Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Revision File Upload
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Upload the PDF file for this revision
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drag & Drop Zone */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : uploadedFile 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploadedFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-8 w-8" />
                          <span className="text-lg font-medium">File Uploaded Successfully</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <File className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">{uploadedFile.name}</span>
                          <span className="text-sm text-gray-500">
                            ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
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
                      <div className="space-y-4">
                        <UploadCloud className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drag and drop your PDF file here
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            or click to browse files
                          </p>
                        </div>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* File Validation */}
                  {fileError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {fileError}
                    </div>
                  )}

                  {/* Expected Filename */}
                  {watchedValues.componentCode && watchedValues.issueNumber && watchedValues.revisionNumber && (
                    <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-1">Expected filename:</p>
                      <code className="bg-white px-2 py-1 rounded border text-sm">
                        {watchedValues.componentCode}_{watchedValues.issueNumber}_{watchedValues.revisionNumber}.pdf
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Notification Settings
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Select users who will be notified about this revision
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
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Selected users will receive real-time notifications for this revision</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Component Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Component Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Component Name</label>
                    <p className="text-sm font-medium">
                      {component.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Component Code</label>
                    <p className="text-sm font-medium">
                      {component.componentCode}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Current Revision</label>
                    <Badge variant="secondary" className="text-sm">
                      {component.latestRevisionNumber}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Total Revisions</label>
                    <p className="text-sm font-medium">
                      {component.revisions.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Form Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Issue Number</label>
                    <p className="text-sm font-medium">
                      {watchedValues.issueNumber || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Revision Number</label>
                    <p className="text-sm font-medium">
                      {watchedValues.revisionNumber || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Revision Date</label>
                    <p className="text-sm font-medium">
                      {watchedValues.date || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Remark</label>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {watchedValues.remark || 'No remark provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Notify Users</label>
                    <p className="text-sm">
                      {notifyTo.length > 0 
                        ? `${notifyTo.length} user${notifyTo.length !== 1 ? 's' : ''} selected`
                        : 'No users selected'
                      }
                    </p>
                  </div>
                  {uploadedFile && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">File</label>
                      <div className="flex items-center gap-2 text-sm">
                        <File className="h-4 w-4" />
                        <span>{uploadedFile.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Upload File</p>
                      <p className="text-xs text-blue-700">Drag & drop or select PDF file</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Update Metadata</p>
                      <p className="text-xs text-blue-700">Set revision details & notifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Track History</p>
                      <p className="text-xs text-gray-600">Monitor version changes</p>
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
              disabled={isSubmitting || !isValid || !uploadedFile}
              className="w-full sm:w-auto gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Revision
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 