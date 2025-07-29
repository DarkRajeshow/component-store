import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Download, 
  X, 
  FileText, 
  Calendar, 
  User, 
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Search,
  HelpCircle
} from 'lucide-react';
import { Revision } from '../types';

interface PdfViewerModalProps {
  revision: Revision;
  open: boolean;
  onClose: () => void;
}

export function PdfViewerModal({ revision, open, onClose }: PdfViewerModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && revision.fileId) {
      setLoading(true);
      setError(null);
      
      const pdfUrl = `${import.meta.env.VITE_REACT_APP_API_URL}/uploads/${revision.fileId}.pdf`;
      console.log(pdfUrl);
      setPdfUrl(pdfUrl);
      
      // Test if the PDF is accessible
      fetch(pdfUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('PDF not accessible');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load PDF file');
          setLoading(false);
        });
    }
  }, [open, revision.fileId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (!pdfUrl) {
        throw new Error('PDF URL is not available');
      }
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = revision.originalFileName || `${revision.fileId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleZoomReset = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(prev => Math.max(25, Math.min(300, prev + delta)));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleFullscreen();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomReset();
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRotate();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const getPdfContainerStyle = () => ({
    transform: `scale(${zoom / 100}) translate(${position.x / (zoom / 100)}px, ${position.y / (zoom / 100)}px) rotate(${rotation}deg)`,
    cursor: isDragging ? 'grabbing' : zoom > 100 ? 'grab' : 'default',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-none w-screen h-screen' : 'max-w-6xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl font-bold">
                  {revision.originalFileName}
                </DialogTitle>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(revision.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {revision.createdBy?.name}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Rev {revision.revisionNumber}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 25}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 300}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn size={16} />
                </Button>
              </div>

              {/* Rotation Control */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="gap-2"
              >
                <RotateCw size={16} />
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
                className="gap-2"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </Button>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="gap-2"
              >
                {downloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download
                  </>
                )}
              </Button>

              {/* Help Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="gap-2"
                title="Keyboard shortcuts"
              >
                <HelpCircle size={16} />
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-2"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-gray-600">Zoom:</span>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={25}
              max={300}
              step={5}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
              className="text-xs"
            >
              Reset
            </Button>
            {rotation !== 0 && (
              <Badge variant="outline" className="text-xs">
                {rotation}° Rotated
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">Loading PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load PDF</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          ) : (
            <div 
              ref={containerRef}
              className="w-full h-full border rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-900"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div 
                className="w-full h-full flex items-center justify-center"
                style={getPdfContainerStyle()}
              >
                <iframe
                  ref={iframeRef}
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-full min-h-[600px] border-0"
                  title={revision.originalFileName}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setError('Failed to load PDF file');
                    setLoading(false);
                  }}
                  style={{
                    pointerEvents: isDragging ? 'none' : 'auto',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Drag Instructions */}
        {zoom > 100 && !isDragging && (
          <div className="absolute bottom-4 left-4 bg-black/70 dark:bg-zinc-800 text-white dark:text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
            <Move size={14} />
            Drag to pan
          </div>
        )}

        {/* Zoom Instructions */}
        <div className="absolute bottom-4 right-4 bg-black/70 dark:bg-zinc-800 text-white dark:text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
          <Search size={14} />
          Ctrl + Scroll to zoom
        </div>

        {/* Help Tooltip */}
        {showHelp && (
          <div className="absolute top-20 right-4 bg-black/90 text-white p-4 rounded-lg text-sm max-w-xs z-50">
            <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
            <div className="space-y-1 text-xs">
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl + +</kbd> Zoom in</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl + -</kbd> Zoom out</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl + 0</kbd> Reset zoom</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl + R</kbd> Rotate</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl + F</kbd> Fullscreen</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> Close</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 