import PropTypes from 'prop-types';
import filePath from '../../../../utils/filePath';
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import useStore from '../../../../store/useStore';
import {
    Dialog,
    DialogContent,
} from "../../../../components/ui/dialog";
import { Card, CardContent } from "../../../../components/ui/card";
import { TooltipProvider } from "../../../../components/ui/tooltip";
import { Separator } from "../../../../components/ui/separator";

// Custom hooks
import { useSelection } from '../../hooks/view/useSelection';
import { useDragging } from '../../hooks/view/useDragging';
import { useSVGPaths } from '../../hooks/view/useSVGPaths';
import { usePageManagement } from '../../hooks/view/usePageManagement';
import { useZoomAndRotation } from '../../hooks/view/useZoomAndRotation';

// Components
import ExportPopup from './ExportPopup';
import AddPagePopup from './AddPagePopup';
import SelectionOverlay from './SelectionOverlay';
import DesignCanvas from './DesignCanvas';
import ZoomControls from './ZoomControls';

// Types
import { ViewProps } from '../../types/viewTypes';
import PageNavigator from './PageNavigator';
import { IDesign } from '@/types/types';

// Define BaseDrawing interface
interface BaseDrawing {
    path: string;
}


const View: React.FC<ViewProps> = ({
    generatePDF,
    reference,
    zoom,
    setZoom,
    offset,
    setOffset,
}) => {
    const {
        designAttributes,
        design,
        loading,
        setSelectionBox,
        fileVersion,
        baseDrawing,
        selectedPage,
        setSelectedPage,
        pages,
        generateStructure,
        fetchProject,
        rotation,
        setRotation
    } = useStore();

    const { id } = useParams<{ id: string }>();
    const containerRef = useRef<HTMLDivElement>(null);

    // Type assertions for store values
    const typedDesign = design as unknown as IDesign;
    const typedBaseDrawing = baseDrawing as unknown as BaseDrawing;

    // Initialize custom hooks
    const {
        selectionState,
        setSelectionState,
        absoluteSelection,
        handleSelection,
        handleHoldSelection,
        updateSelectionOnMove,
        resetSelection
    } = useSelection({
        reference,
        setSelectionBox
    });

    const {
        isDragging,
        handleMouseDown,
        handleMouseMove: handleDragMove,
        handleMouseUp
    } = useDragging({
        zoom,
        rotation,
        setOffset,
        selectionState,
        setSelectionState
    });

    const {
        getSVGPath,
        existingFiles,
        isBaseDrawingExists
    } = useSVGPaths({
        design: typedDesign,
        designAttributes,
        fileVersion,
        pages,
        selectedPage,
        baseDrawing: typedBaseDrawing
    });

    const {
        newPageName,
        setNewPageName,
        viewPopUpType,
        isPopUpON,
        addNewPage,
        openPopup,
        closePopup
    } = usePageManagement({
        pages,
        generateStructure,
        fetchProject,
        projectId: id || ''
    });

    const {
        handleWheel,
        rotateSVG,
        setZoomValue
    } = useZoomAndRotation({
        zoom,
        setZoom,
        rotation,
        setRotation
    });

    // Combined mouse move handler
    const handleMouseMove = (event: React.MouseEvent) => {
        handleDragMove(event);
        updateSelectionOnMove(event);
    };

    // Generate design elements for the canvas
    const designElements = React.useMemo(() => {
        if (!designAttributes) return [];

        return Object.entries(designAttributes).map(([attribute, value]) => {
            const href = getSVGPath(value);
            const isValid = value?.value
                || (value?.selectedOption && value.selectedOption !== "none"
                    && !value?.options?.[value.selectedOption]?.options)
                || (value?.options?.[value?.selectedOption]?.selectedOption
                    && value.options[value.selectedOption].selectedOption !== ' ');

            if (isValid && href && existingFiles[href]) {
                return (
                    <image
                        style={{
                            transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                            transformOrigin: 'center',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            rotate: `${rotation}deg`
                        }}
                        key={attribute}
                        href={href}
                        height={window.innerHeight * 0.846}
                        width={window.innerWidth - 32}
                    />
                );
            }
            return null;
        }).filter(Boolean);
    }, [designAttributes, getSVGPath, existingFiles, zoom, offset, isDragging, rotation]);

    // Get base drawing path
    const baseDrawingPath = typedBaseDrawing?.path && typedDesign?.folder
        ? `${filePath}${typedDesign.folder}/${pages[selectedPage]}/${typedBaseDrawing.path}.svg?v=${fileVersion}`
        : null;

    return (
        <TooltipProvider>
            <Dialog open={isPopUpON}>
                <DialogContent className="bg-theme max-h-[80vh] w-auto overflow-y-scroll p-6 rounded-lg border-0 shadow-lg">
                    {viewPopUpType === 'export' && (
                        <ExportPopup
                            onExport={generatePDF}
                            onClose={closePopup}
                            resetSelection={resetSelection}
                        />
                    )}

                    {viewPopUpType === 'pages' && (
                        <AddPagePopup
                            newPageName={newPageName}
                            setNewPageName={setNewPageName}
                            onAddPage={addNewPage}
                            onClose={closePopup}
                        />
                    )}
                </DialogContent>

                <main className='h-[92vh] flex flex-col gap-1.5 p-2' ref={containerRef}>
                    <Card className='h-[94%] overflow-hidden relative border-0 p-0'>
                        <CardContent className='p-0 h-full'>
                            <div
                                className='bg-white h-full transition-none overflow-hidden relative'
                                onWheel={handleWheel}
                                onMouseDown={handleMouseDown}
                                onDoubleClick={handleSelection}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <div className='flex items-center justify-center h-full'>
                                    <DesignCanvas
                                        reference={reference}
                                        loading={loading}
                                        zoom={zoom}
                                        offset={offset}
                                        rotation={rotation}
                                        isDragging={isDragging}
                                        baseDrawingPath={baseDrawingPath}
                                        isBaseDrawingExists={isBaseDrawingExists}
                                        designElements={designElements}
                                        onHoldSelection={handleHoldSelection}
                                    />
                                </div>

                                <SelectionOverlay
                                    absoluteSelection={absoluteSelection}
                                    selectionState={selectionState}
                                    resetSelection={resetSelection}
                                    openExportPopup={() => openPopup('export')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 !py-0 px-1">
                        <CardContent className="flex justify-between items-center p-2">
                            <PageNavigator
                                pages={pages}
                                selectedPage={selectedPage}
                                setSelectedPage={setSelectedPage}
                                onAddPage={() => openPopup('pages')}
                            />

                            <Separator orientation="vertical" className="h-8 mx-2" />

                            <ZoomControls
                                zoom={zoom}
                                onZoomChange={setZoomValue}
                                onRotate={rotateSVG}
                            />
                        </CardContent>
                    </Card>
                </main>
            </Dialog>
        </TooltipProvider>
    );
}

View.propTypes = {
    reference: PropTypes.object.isRequired,
    zoom: PropTypes.number.isRequired,
    setZoom: PropTypes.func.isRequired,
    offset: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }).isRequired,
    setOffset: PropTypes.func.isRequired,
    generatePDF: PropTypes.func.isRequired,
};

export default View;
