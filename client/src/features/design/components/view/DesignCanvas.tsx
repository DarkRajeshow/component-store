import React, { RefObject } from 'react';
import { Offset } from './types';

interface DesignCanvasProps {
  reference: RefObject<SVGSVGElement>;
  loading: boolean;
  zoom: number;
  offset: Offset;
  rotation: number;
  isDragging: boolean;
  baseDrawingPath: string | null;
  isBaseDrawingExists: boolean;
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
  onHoldSelection
}) => {
  if (loading) {
    return (
      <div className='h-6 w-6 my-auto border-dark border-2 border-b-transparent animate-spin rounded-full flex items-center justify-center' />
    );
  }

  return (
    <svg
      onClick={onHoldSelection}
      ref={reference}
      className="components relative w-full h-full transition-none"
      viewBox={`0 0 ${window.innerWidth - 32} ${window.innerHeight * 0.846}`}
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
          height={window.innerHeight * 0.846}
          width={window.innerWidth - 32}
        />
      )}
      {designElements}
    </svg>
  );
};

export default DesignCanvas; 