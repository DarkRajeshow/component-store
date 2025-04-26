import React, { RefObject } from 'react';
import { IDimentions, Offset } from '../types/viewTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface DesignCanvasProps {
  reference: RefObject<SVGSVGElement>;
  loading: boolean;
  zoom: number;
  offset: Offset;
  rotation: number;
  isDragging: boolean;
  baseDrawingPath: string | null;
  isBaseDrawingExists: boolean;
  dimensions: IDimentions;
  designElements: React.ReactNode[];
  onHoldSelection: () => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  reference,
  loading,
  zoom,
  offset,
  rotation,
  isDragging,
  baseDrawingPath,
  isBaseDrawingExists,
  designElements,
  dimensions,
  onHoldSelection
}) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-[80%] w-[80%] rounded-md" />
      </div>
    );
  }

  return (
    <svg
      onClick={onHoldSelection}
      ref={reference}
      fill='#FFF'
      className="components relative w-full h-full transition-none"
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {baseDrawingPath && isBaseDrawingExists && (
        <image
          style={{
            transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            rotate: `${rotation}deg`,
          }}
          href={baseDrawingPath}
          height={dimensions.height}
          width={dimensions.width}
        />
      )}
      {designElements}
    </svg>
  );
};

export default DesignCanvas; 