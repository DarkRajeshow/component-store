import React from 'react';
import { DialogTitle, DialogHeader, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface AddPagePopupProps {
  newPageName: string;
  setNewPageName: (name: string) => void;
  onAddPage: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

const AddPagePopup: React.FC<AddPagePopupProps> = ({
  newPageName,
  setNewPageName,
  onAddPage,
  onClose
}) => {
  return (
    <form onSubmit={onAddPage} className='flex flex-col gap-4'>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">Add New Page</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="pageName" className="text-right">
            Page Name
          </Label>
          <Input
            id="pageName"
            required
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="e.g. T Box"
            className="col-span-3"
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddPagePopup; 