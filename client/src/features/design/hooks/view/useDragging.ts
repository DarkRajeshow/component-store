import { useState, useCallback } from 'react';
import { Offset, SelectionState } from '../../types/viewTypes';

interface UseDraggingProps {
  zoom: number;
  rotation: number;
  setOffset: (offset: Offset | ((prevOffset: Offset) => Offset)) => void;
  selectionState: SelectionState;
  setSelectionState: React.Dispatch<React.SetStateAction<SelectionState>>;
}

export const useDragging = ({
  zoom,
  rotation,
  setOffset,
  selectionState,
  setSelectionState
}: UseDraggingProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    setSelectionState(prevState => ({
      ...prevState,
      lastMousePosition: { x: event.clientX, y: event.clientY },
    }));
  }, [setSelectionState]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      const dx = event.clientX - selectionState.lastMousePosition.x;
      const dy = event.clientY - selectionState.lastMousePosition.y;

      // Convert the movement to account for rotation
      const angleRad = (rotation * Math.PI) / 180; // Convert degrees to radians
      const adjustedDx = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
      const adjustedDy = -dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

      // Update the offset with adjusted values
      setOffset((prevOffset) => ({
        x: prevOffset.x + adjustedDx / zoom,
        y: prevOffset.y + adjustedDy / zoom,
      }));

      setSelectionState((prevState) => ({
        ...prevState,
        lastMousePosition: { x: event.clientX, y: event.clientY },
      }));
    }
  }, [isDragging, rotation, selectionState.lastMousePosition, setOffset, setSelectionState, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}; 