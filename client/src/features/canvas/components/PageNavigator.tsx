import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle } from 'lucide-react';
import { useModel } from '@/contexts/ModelContext';
import { IPages, IRenamePageRequest } from '@/types/project.types';
import { toast } from 'sonner';
import useAppStore from '@/store/useAppStore';

interface PageNavigatorProps {
  pages: IPages;
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  onAddPage: () => void;
  maxPages?: number;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  selectedPage,
  setSelectedPage,
  onAddPage,
  maxPages = 8
}) => {
  const { renamePage, reorderPages } = useModel();
  const { setStructureElements, incrementFileVersion } = useAppStore();
  const pageKeys = pages ? Object.keys(pages) : [];
  const canAddMorePages = pageKeys.length <= maxPages;
  const [isLoading, setIsLoading] = useState(false);
  const [updatedPageName, setUpdatedPageName] = useState<string>(selectedPage);
  const [editingPage, setEditingPage] = useState<string | null>(null);

  // Drag and drop state
  const [draggedPage, setDraggedPage] = useState<string | null>(null);
  const [dragOverPage, setDragOverPage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeout = useRef<number | null>(null);

  useEffect(() => {
    setUpdatedPageName(selectedPage);
  }, [selectedPage]);

  const handleRename = useCallback(async () => {
    if (!updatedPageName || !updatedPageName.trim()) {
      toast.error("Page name cannot be empty");
      setUpdatedPageName(selectedPage); // Reset to original name
      setEditingPage(null);
      return;
    }

    if (updatedPageName === selectedPage) {
      setEditingPage(null);
      return;
    }

    setIsLoading(true);
    try {
      const request: IRenamePageRequest = {
        newName: updatedPageName
      };

      if (!pages || Object.keys(pages).length === 0) {
        toast.error("No pages available to rename");
        return;
      }

      if (pages && pages[updatedPageName]) {
        toast.error("Page name already exists");
        setUpdatedPageName(selectedPage); // Reset to original name
        setEditingPage(null);
        return;
      }

      const selectedPageId = pages[selectedPage];
      if (!selectedPageId) {
        toast.error("Rename Page function not available");
        return;
      }

      const response = await renamePage(selectedPageId, request);
      if (response && response.success) {
        const pageEntries = Object.entries({ ...pages });
        // Create new ordered pages object
        const orderedPages: { [key: string]: string } = {};
        // Rebuild the pages object with the new name while maintaining order
        pageEntries.forEach(([key, value]) => {
          if (key === selectedPage) {
            orderedPages[updatedPageName] = value;
          } else {
            orderedPages[key] = value;
          }
        });

        setStructureElements({
          updatedPages: orderedPages,
        });
        setSelectedPage(updatedPageName);
        incrementFileVersion(); // Increment file version after renaming
        setEditingPage(null);
        toast.success("Page renamed successfully");
      } else {
        toast.error(response && response.status || "Failed to rename page");
        setUpdatedPageName(selectedPage); // Reset to original name
      }
    } catch (_: unknown) {
      console.log(_);
      toast.error("An unexpected error occurred");
      setUpdatedPageName(selectedPage); // Reset to original name
    } finally {
      setIsLoading(false);
    }
  }, [pages, updatedPageName, selectedPage, renamePage, setStructureElements, setSelectedPage, incrementFileVersion]);

  const handleDoubleClick = (page: string) => {
    setEditingPage(page);
    setUpdatedPageName(page);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditingPage(null);
      setUpdatedPageName(selectedPage);
    }
  };

  const handleBlur = () => {
    handleRename();
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, page: string) => {
    setDraggedPage(page);
    setIsDragging(true);

    // Set drag image and cursor
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      // Create a ghost image that looks like the tab
      const ghostEl = e.currentTarget.cloneNode(true) as HTMLDivElement;
      ghostEl.style.width = `${e.currentTarget.offsetWidth}px`;
      ghostEl.style.opacity = '0.7';
      ghostEl.style.position = 'absolute';
      ghostEl.style.top = '-1000px';
      document.body.appendChild(ghostEl);

      e.dataTransfer.setDragImage(ghostEl, e.currentTarget.offsetWidth / 2, 15);

      // Clean up ghost element after drag starts
      setTimeout(() => {
        document.body.removeChild(ghostEl);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, page: string) => {
    e.preventDefault();
    if (draggedPage !== page) {
      setDragOverPage(page);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, page: string) => {
    e.preventDefault();
    if (draggedPage !== page) {
      setDragOverPage(page);
    }
  };

  const handleDragLeave = () => {
    // Use a small timeout to prevent flickering when moving between elements
    if (dragTimeout.current) {
      window.clearTimeout(dragTimeout.current);
    }

    dragTimeout.current = window.setTimeout(() => {
      setDragOverPage(null);
    }, 50);
  };

  const handleDragEnd = () => {
    setDraggedPage(null);
    setDragOverPage(null);
    setIsDragging(false);

    if (dragTimeout.current) {
      window.clearTimeout(dragTimeout.current);
      dragTimeout.current = null;
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetPage: string) => {
    e.preventDefault();
    if (!draggedPage || draggedPage === targetPage) {
      handleDragEnd();
      return;
    }

    try {
      setIsLoading(true);

      // Create new ordered array of page keys
      const currentPageKeys = [...pageKeys];
      const sourceIndex = currentPageKeys.indexOf(draggedPage);
      const targetIndex = currentPageKeys.indexOf(targetPage);

      if (sourceIndex === -1 || targetIndex === -1) {
        throw new Error("Page not found");
      }

      // Remove source page and insert at target position
      currentPageKeys.splice(sourceIndex, 1);
      currentPageKeys.splice(targetIndex, 0, draggedPage);

      // Create new ordered pages object that maintains the page IDs
      const orderedPages: { [key: string]: string } = {};
      currentPageKeys.forEach(key => {
        orderedPages[key] = pages[key];
      });

      // Update UI immediately for responsive feel
      setStructureElements({
        updatedPages: orderedPages,
      });

      // Prepare page IDs in new order for API
      // const pageIds = currentPageKeys.map(key => pages[key]);

      // Save new order to backend
      const response = await reorderPages({ pages: orderedPages });

      if (response && response.success) {
        incrementFileVersion();
        toast.success("Pages reordered successfully");
      } else {
        // Revert to original order if failed
        setStructureElements({
          updatedPages: pages,
        });
        toast.error(response?.status || "Failed to reorder pages");
      }
    } catch (error: unknown) {
      console.log(error);
      // Revert to original order if error
      setStructureElements({
        updatedPages: pages,
      });
      toast.error("An error occurred while reordering pages");
    } finally {
      handleDragEnd();
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center gap-1'>
      <span className='font-medium text-sm text-muted-foreground pr-1'>Pages</span>
      <Tabs value={selectedPage} onValueChange={setSelectedPage} className="w-auto">
        <TabsList className="bg-muted/40 relative">
          {pageKeys.map((page) => (
            <div
              key={page}
              draggable={!isLoading}
              onDragStart={(e) => handleDragStart(e, page)}
              onDragOver={(e) => handleDragOver(e, page)}
              onDragEnter={(e) => handleDragEnter(e, page)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, page)}
              className={`flex items-center group ${draggedPage === page ? 'opacity-50' : ''} 
                         ${dragOverPage === page ? 'before:absolute before:inset-0 before:bg-primary/10 before:rounded-md before:z-0' : ''}
                         ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <TabsTrigger
                value={page}
                onDoubleClick={() => {
                  if (selectedPage === page) {
                    handleDoubleClick(page);
                  }
                }}
                className="uppercase text-sm font-medium data-[state=active]:bg-background relative w-auto pr-3 flex items-center"
                disabled={isLoading}
              >

                {/* {selectedPage === page && (
                  <span className="grip-icon group-hover:opacity-60 opacity-0 cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} />
                  </span>
                )} */}

                {editingPage === page ? (
                  <input
                    value={updatedPageName}
                    onChange={(e) => setUpdatedPageName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="h-6 w-auto text-center bg-background outline-none border-none text-sm font-medium text-muted-foreground"
                    autoFocus
                    disabled={isLoading}
                    style={{ width: `${updatedPageName.length + 2}ch` }}
                  />
                ) : (
                  <span className="whitespace-nowrap">{page}</span>
                )}

              </TabsTrigger>
            </div>
          ))}
        </TabsList>
      </Tabs>
      {canAddMorePages && (
        <Tooltip>
          <TooltipTrigger className='w-at' asChild>
            <Button
              onClick={onAddPage}
              variant="ghost"
              size="icon"
              className="h-9 rounded-full"
              disabled={isLoading}
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add New Page</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default PageNavigator;