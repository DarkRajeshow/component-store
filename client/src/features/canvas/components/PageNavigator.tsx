import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle } from 'lucide-react';

interface PageNavigatorProps {
  pages: Record<string, string>;
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
  const pageKeys = pages ? Object.keys(pages) : [];
  const canAddMorePages = pageKeys.length <= maxPages;

  return (
    <div className='flex items-center gap-1'>
      <span className='font-medium text-sm text-muted-foreground pr-1'>Pages</span>

      <Tabs value={selectedPage} onValueChange={setSelectedPage} className="w-auto">
        <TabsList className="bg-muted/40">
          {pageKeys.map((page) => (
            <TabsTrigger
              key={page}
              value={page}
              className="uppercase text-sm font-medium data-[state=active]:bg-background"
            >
              {page}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {canAddMorePages && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onAddPage}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
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