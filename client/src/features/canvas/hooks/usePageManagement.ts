import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ViewPopUpType } from '../types/viewTypes';
import { useModel } from '@/contexts/ModelContext';
import { IPages } from '@/types/project.types';

interface UsePageManagementProps {
  pages: IPages;
}

export const usePageManagement = ({
  pages,
}: UsePageManagementProps) => {
  const [newPageName, setNewPageName] = useState('');
  const [viewPopUpType, setViewPopUpType] = useState<ViewPopUpType>('');
  const [isPopUpON, setIsPopUpON] = useState(false);


  // api functions 
  const { addPage, refreshContent } = useModel()

  const addNewPage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate page name
    if (!newPageName.trim()) {
      toast.warning('Page name cannot be empty.');
      return;
    }

    // Check if page already exists
    const pageExists = Object.keys(pages).some(pageName =>
      pageName.toLocaleLowerCase() === newPageName.toLocaleLowerCase()
    );

    if (pageExists) {
      toast.warning('Page already exists.');
      return;
    }

    try {
      // Call API to add new page
      const data = await addPage({
        pageName: newPageName
      });

      if (data && data.success) {
        toast.success(data.status);
        await refreshContent();
        setViewPopUpType('');
        setIsPopUpON(false);
        setNewPageName('');
      } else {
        console.log(data);
        toast.error(data ? data.status : "Error occured while adding new page.");
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong.');
    }
  }, [newPageName, pages, refreshContent, addPage]);

  const openPopup = useCallback((type: ViewPopUpType) => {
    setViewPopUpType(type);
    setIsPopUpON(true);
  }, []);

  const closePopup = useCallback(() => {
    setViewPopUpType('');
    setIsPopUpON(false);
    setNewPageName('');
  }, []);

  return {
    newPageName,
    setNewPageName,
    viewPopUpType,
    isPopUpON,
    addNewPage,
    openPopup,
    closePopup
  };
}; 