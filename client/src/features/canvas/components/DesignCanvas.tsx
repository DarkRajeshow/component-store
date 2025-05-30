import React, { RefObject } from 'react';
import { IDimentions, Offset } from '../types/viewTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { IDesign } from '@/types/design.types';
import useAppStore from '@/store/useAppStore';

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
  const { content, selectedPage } = useAppStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-[80%] w-[80%] rounded-md" />
      </div>
    );
  }

  const commonTransform = `rotate(${rotation}deg) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;

  return (
    <svg
      onClick={onHoldSelection}
      ref={reference}
      fill="#FFF"
      className="components relative w-full h-full transition-none"
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        style={{
          transformOrigin: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: commonTransform
        }}
      >
        {baseDrawingPath && isBaseDrawingExists && (
          <image
            href={baseDrawingPath}
            height={dimensions.height}
            width={dimensions.width}
          />
        )}
        {designElements}
        {/* {
          content && (content as IDesign).type === "motor" && (content as IDesign).code && (
            <text
              fontFamily='Arial'
              className="select-none"
              style={{
                fontFamily: 'Arial'
              }}
              height={dimensions.height}
              width={dimensions.width}
              fontSize="1.3"
              fill="black"
              textAnchor="end"
              // x={dimensions.width + ((selectedPage).toLowerCase().split(" ").join("") === "tbox" ? 8.5 : 5.3)} // Adjust the position as needed
              // y={dimensions.height - ((selectedPage).toLowerCase().split(" ").join("") === "tbox" ? 30 : 29.3)} // Adjust the position as needed
              x={dimensions.width + ((selectedPage).toLowerCase().split(" ").join("") === "tbox" ? 30.3 : 27.3)} // Adjust the position as needed
              y={dimensions.height - ((selectedPage).toLowerCase().split(" ").join("") === "tbox" ? 158 : 157.3)} // Adjust the position as needed

              transform={(() => {
                // Calculate positioning for different page types
                // const isT_Box = (selectedPage).toLowerCase().split(" ").join("") === "tbox";
                // const x = dimensions.width + (isT_Box ? 8.5 : 5.3);
                // const y = dimensions.height - (isT_Box ? 30 : 29.3);
                // const x = dimensions.width + (isT_Box ? 8.5 : 5.3);
                // const y = (isT_Box ? 30 : 29.3);

                // Calculate rotation around this point
                // return `rotate(90) tras`;
                return `rotate(90), translate(0, 0)`;
              })()}
            >
              {(content as IDesign).code}
            </text>
          )
        } */}
        {
          content && (content as IDesign).type === "motor" && (content as IDesign).code && (
            <svg>
              <text
                className="select-none rotate-90"
                fontSize="1.3"
                fill="black"
                textAnchor="end"
                x={dimensions.width + ((selectedPage).toLowerCase().split(" ").join("") === "tbox" ? 30.3 : 27.3)}
                y={dimensions.height - ((selectedPage).toLowerCase().split(" ").join("") === "tbox" ? 158 : 157.3)}
                // transform={`rotate(90), translate(0, 0)`}
              >
                {(content as IDesign).code}
              </text>
            </svg>
          )
        }

      </g>
    </svg >
  );
};

export default DesignCanvas;


//old code where G tag wasn't present:

// const DesignCanvas: React.FC<DesignCanvasProps> = ({
//   reference,
//   loading,
//   zoom,
//   offset,
//   rotation,
//   isDragging,
//   baseDrawingPath,
//   isBaseDrawingExists,
//   designElements,
//   dimensions,
//   onHoldSelection
// }) => {
//   const { content } = useAppStore()

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full w-full">
//         <Skeleton className="h-[80%] w-[80%] rounded-md" />
//       </div>
//     );
//   }



//   return (
//     <svg
//       onClick={onHoldSelection}
//       ref={reference}
//       fill='#FFF'
//       className="components relative w-full h-full transition-none"
//       viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       {baseDrawingPath && isBaseDrawingExists && (
//         <image
//           style={{
//             transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
//             transformOrigin: 'center',
//             cursor: isDragging ? 'grabbing' : 'grab',
//             rotate: `${rotation}deg`,
//           }}
//           href={baseDrawingPath}
//           height={dimensions.height}
//           width={dimensions.width}
//         />
//       )}
//       {designElements}
//       {
//         content && (content as IDesign).code && <text
//           style={{
//             transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
//             transformOrigin: 'center',
//             cursor: isDragging ? 'grabbing' : 'grab',
//             rotate: `${rotation}deg`
//           }}
//           height={dimensions.height}
//           width={dimensions.width}
//           x={dimensions.width - 90} // Adjust the position as needed
//           y={dimensions.height - 20} // Adjust the position as needed
//           fontSize="2"
//           fill="black"
//           textAnchor="end"
//         >
//           {(content as IDesign).code}
//         </text>
//       }
//     </svg>
//   );
// };

// export default DesignCanvas; 