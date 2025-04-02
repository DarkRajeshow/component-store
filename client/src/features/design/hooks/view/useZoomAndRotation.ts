import { useCallback } from 'react';

interface UseZoomAndRotationProps {
  zoom: number;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
}

export const useZoomAndRotation = ({
  zoom,
  setZoom,
  rotation,
  setRotation
}: UseZoomAndRotationProps) => {
  // Handle wheel event for zooming
  const handleWheel = useCallback((event: React.WheelEvent) => {
    setZoom(prevZoom => Math.min(Math.max(prevZoom + event.deltaY * -0.001, 0.2), 6));
  }, [setZoom]);

  // Rotate SVG by 90 degrees
  const rotateSVG = useCallback(() => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
  }, [rotation, setRotation]);

  // Set zoom to a specific value
  const setZoomValue = useCallback((value: number[]) => {
    const newZoom = value[0] / 100;
    if (newZoom !== zoom) {
      setZoom(newZoom);
    }
  }, [zoom, setZoom]);

  return {
    handleWheel,
    rotateSVG,
    setZoomValue
  };
}; 