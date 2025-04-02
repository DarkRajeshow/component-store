import React from 'react';
import { AbsoluteSelection, SelectionState } from '../types/viewTypes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SelectionOverlayProps {
  absoluteSelection: AbsoluteSelection | null;
  selectionState: SelectionState;
  resetSelection: () => void;
  openExportPopup: () => void;
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  absoluteSelection,
  selectionState,
  resetSelection,
  openExportPopup
}) => {
  if (!absoluteSelection) return null;

  const left = Math.abs(Math.min(absoluteSelection.startX, absoluteSelection.endX));
  const top = Math.abs(Math.min(absoluteSelection.startY, absoluteSelection.endY));
  const width = Math.abs(absoluteSelection.endX - absoluteSelection.startX);
  const height = Math.abs(absoluteSelection.endY - absoluteSelection.startY);

  return (
    <div
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`
      }}
      className={`
        border-2 select-none transition-none fixed 
        ${selectionState.isConfirmed 
          ? "border-solid border-primary/50 bg-primary/10" 
          : "bg-transparent border-dashed border-secondary"}
      `}
    >
      {selectionState.isConfirmed && (
        <div className='flex w-full items-top justify-between p-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={resetSelection} 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full bg-background/80 hover:bg-background"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancel Selection</p>
            </TooltipContent>
          </Tooltip>

          <Button 
            onClick={openExportPopup} 
            variant="secondary"
            size="sm"
            className="h-7 rounded-full px-3 text-xs font-medium flex items-center gap-1 bg-background/80 hover:bg-background"
          >
            PDF
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="h-3 w-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectionOverlay; 