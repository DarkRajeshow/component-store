import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { addNewPageAPI } from '../lib/designAPI';
import { ViewPopUpType } from '../components/view/types';

interface UsePageManagementProps {
  pages: Record<string, string>;
  generateStructure: (options: { updatedPages?: Record<string, string> }) => any;
  fetchProject: (id: string) => Promise<void>;
  projectId: string;
}

export const usePageManagement = ({
  pages,
  generateStructure,
  fetchProject,
  projectId
}: UsePageManagementProps) => {
  const [newPageName, setNewPageName] = useState('');
  const [viewPopUpType, setViewPopUpType] = useState<ViewPopUpType>('');
  const [isPopUpON, setIsPopUpON] = useState(false);

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
      // Create updated pages object with new page
      const updatedPages = {
        ...pages,
        [newPageName]: uuidv4()
      };

      // Generate structure with updated pages
      const structure = generateStructure({ updatedPages });

      // Prepare request body
      const body = {
        structure: structure
      };

      // Call API to add new page
      const { data } = await addNewPageAPI(projectId, body);

      if (data.success) {
        toast.success(data.status);
        await fetchProject(projectId);
        setViewPopUpType('');
        setIsPopUpON(false);
        setNewPageName('');
      } else {
        console.log(data);
        toast.error(data.status);
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong.');
    }
  }, [newPageName, pages, generateStructure, projectId, fetchProject]);

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