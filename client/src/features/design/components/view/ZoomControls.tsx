import React from 'react';
import { Slider } from '../../../../components/ui/slider';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../../components/ui/tooltip';
import { Badge } from '../../../../components/ui/badge';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (value: number[]) => void;
  onRotate: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  onRotate
}) => {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className='flex items-center justify-center gap-3'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onRotate} 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Rotate View</p>
        </TooltipContent>
      </Tooltip>

      <Slider
        max={600}
        step={1}
        min={20}
        value={[zoomPercentage]}
        onValueChange={onZoomChange}
        className={cn("w-60 !transition-none")}
      />
      
      <Badge variant="outline" className="px-2 py-1 font-medium min-w-16">
        {zoomPercentage}%
      </Badge>
    </div>
  );
};

export default ZoomControls; 