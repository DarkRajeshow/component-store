import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ onDelete, onCancel }) => {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="font-medium">This action cannot be undone</h2>
        </div>
        <p className="text-gray-700">Are you sure you want to delete this attribute?</p>
        <div className="flex items-center gap-3 mt-2">
          <Button 
            variant="destructive" 
            onClick={onDelete}
            type='button'
            className="px-6"
          >
            Yes, delete it
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeleteConfirmation;