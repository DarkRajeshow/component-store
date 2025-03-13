import React from 'react';
import { DialogTitle, DialogDescription } from '../../../../components/ui/dialog';

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
    <form onSubmit={onAddPage} className='flex flex-col gap-2'>
      <DialogTitle className="text-dark font-medium py-2">Add New Page</DialogTitle>
      <button onClick={onClose} className='absolute top-3 right-3 shadow-none'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <DialogDescription className='group cursor-text bg-theme/40 py-2 focus-within:bg-theme/60 rounded-md flex items-center justify-center gap-2 px-2'>
        <label htmlFor='pageName' className='p-2 bg-dark/5 rounded-md'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-dark/60 group-hover:text-dark h-full">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
        </label>
        <input
          id='pageName'
          required
          type="text"
          value={newPageName}
          onChange={(e) => setNewPageName(e.target.value)}
          className="focus:bg-transparent bg-transparent h-full mt-0 w-full outline-none py-3 px-4"
          placeholder="e.g T Box"
        />
      </DialogDescription>
      <button type='submit' className='bg-blue-300 hover:bg-green-300 py-2 px-3 rounded-full text-dark font-medium mt-4'>Add</button>
    </form>
  );
};

export default AddPagePopup; 