import React from 'react';
import { AbsoluteSelection, SelectionState } from './types';

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

  return (
    <div
      style={{
        left: Math.abs(Math.min(absoluteSelection.startX, absoluteSelection.endX)) + "px",
        top: Math.abs(Math.min(absoluteSelection.startY, absoluteSelection.endY)) + "px",
        width: Math.abs(absoluteSelection.endX - absoluteSelection.startX) + "px",
        height: Math.abs(absoluteSelection.endY - absoluteSelection.startY) + "px"
      }}
      className={`border-2 select-none transition-none fixed border-dark ${selectionState.isConfirmed ? "border-solid border-dark/50 bg-blue-500/20" : "bg-transparent border-dashed"}`}
    >
      {selectionState.isConfirmed && (
        <div className='flex w-full items-top justify-between px-2 py-2'>
          <svg 
            onClick={resetSelection} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="size-5 cursor-pointer"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          <button 
            onClick={openExportPopup} 
            id='exportBtn' 
            className='bg-red-200 hover:bg-green-300 py-2 rounded-full px-4 text-xs text-dark font-medium flex items-center gap-2'
          >
            PDF
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectionOverlay; 