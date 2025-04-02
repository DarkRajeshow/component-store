import { useState, useCallback, RefObject } from 'react';
import { SelectionState, SelectionBox, AbsoluteSelection } from '../../types/viewTypes';

interface UseSelectionProps {
  reference: RefObject<SVGSVGElement>;
  setSelectionBox: (selection: SelectionBox | null) => void;
}

export const useSelection = ({ reference, setSelectionBox }: UseSelectionProps) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    isSelecting: false,
    isConfirmed: false,
    lastMousePosition: { x: 0, y: 0 },
    selection: null,
  });
  
  const [absoluteSelection, setAbsoluteSelection] = useState<AbsoluteSelection | null>(null);

  const handleSelection = useCallback((event: React.MouseEvent) => {
    setSelectionState(prevState => {
      if (!prevState.isSelecting && !prevState.isConfirmed) {
        if (!reference.current) return prevState;
        
        const rect = reference.current.getBoundingClientRect();
        const startX = event.clientX - rect.left;
        const startY = event.clientY - rect.top;
        
        setAbsoluteSelection({
          startX: event.clientX,
          startY: event.clientY,
          endX: event.clientX,
          endY: event.clientY,
        });
        
        return {
          ...prevState,
          isSelecting: true,
          selection: { startX, startY, endX: startX, endY: startY },
        };
      } else {
        setSelectionBox(prevState.selection);
        setAbsoluteSelection(null);
        return {
          ...prevState,
          isSelecting: false,
          isConfirmed: false,
          selection: null,
        };
      }
    });
  }, [reference, setSelectionBox]);

  const handleHoldSelection = useCallback(() => {
    if (selectionState.isSelecting) {
      setSelectionState(prevState => ({
        ...prevState,
        isConfirmed: true,
      }));
      setSelectionBox(selectionState.selection);
    }
  }, [selectionState.isSelecting, selectionState.selection, setSelectionBox]);

  const updateSelectionOnMove = useCallback((event: React.MouseEvent) => {
    if (selectionState.selection && !selectionState.isConfirmed) {
      if (!reference.current) return;
      
      const rect = reference.current.getBoundingClientRect();
      const endX = event.clientX - rect.left;
      const endY = event.clientY - rect.top;

      setAbsoluteSelection(prev => {
        if (!prev) return null;
        return {
          ...prev,
          endX: event.clientX,
          endY: event.clientY,
        };
      });
      
      setSelectionState(prevState => ({
        ...prevState,
        selection: prevState.selection ? {
          ...prevState.selection,
          endX,
          endY,
        } : null,
      }));
    }
  }, [reference, selectionState.isConfirmed, selectionState.selection]);

  const resetSelection = useCallback(() => {
    setSelectionState({
      isSelecting: false,
      isConfirmed: false,
      lastMousePosition: { x: 0, y: 0 },
      selection: null,
    });
    setAbsoluteSelection(null);
    setSelectionBox(null);
  }, [setSelectionBox]);

  return {
    selectionState,
    setSelectionState,
    absoluteSelection,
    setAbsoluteSelection,
    handleSelection,
    handleHoldSelection,
    updateSelectionOnMove,
    resetSelection
  };
}; 