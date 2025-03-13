import React from 'react';
import { Slider } from '../../../../components/ui/slider';
import { cn } from '../../../../lib/utils';

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
  return (
    <div className='flex items-center justify-center gap-2'>
      <button onClick={onRotate} title='View Only Rotation'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
        </svg>
      </button>
      <Slider
        max={600}
        step={1}
        min={20}
        value={[Math.round(zoom * 100)]}
        onValueChange={onZoomChange}
        className={cn("w-60 !transition-none")}
      />
      <span className='text-sm font-medium w-10'>{Math.round(zoom * 100)}%</span>
    </div>
  );
};

export default ZoomControls; 