import React, { useState } from 'react';
import { DialogTitle, DialogHeader, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, X } from 'lucide-react';

interface ExportPopupProps {
  onExport: (fileName: string) => void;
  onClose: () => void;
  resetSelection: () => void;
}

const ExportPopup: React.FC<ExportPopupProps> = ({ onExport, onClose, resetSelection }) => {
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(fileName);
    onClose();
    resetSelection();
    setFileName('');
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">Export Selection as PDF</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="fileName" className="text-right">
            File Name
          </Label>
          <Input
            id="fileName"
            required
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g. my-design"
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
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ExportPopup; 