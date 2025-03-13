import PropTypes from 'prop-types';
import filePath from '../../../../utils/filePath';
import React, { useState, useRef } from 'react';
import { Slider } from '../../../../components/ui/slider';
import { cn } from '../../../../lib/utils';
import useStore from '../../../../store/useStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "../../../../components/ui/dialog"
import { useMemo } from 'react';
import { useEffect } from 'react';
import { checkFileExists } from '../../../../utils/checkFileExists';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { addNewPageAPI } from '../../lib/designAPI';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Custom hooks
import { useSelection } from '../../hooks/useSelection';
import { useDragging } from '../../hooks/useDragging';
import { useSVGPaths } from '../../hooks/useSVGPaths';
import { usePageManagement } from '../../hooks/usePageManagement';
import { useZoomAndRotation } from '../../hooks/useZoomAndRotation';

// Components
import ExportPopup from './ExportPopup';
import AddPagePopup from './AddPagePopup';
import SelectionOverlay from './SelectionOverlay';
import DesignCanvas from './DesignCanvas';
import PageSelector from './PageSelector';
import ZoomControls from './ZoomControls';

// Types
import { ViewProps, Offset, SelectionBox } from './types';
import { IDesign } from '../../../../types/design';

// Define BaseDrawing interface
interface BaseDrawing {
  path: string;
}

// Define Design interface with minimal required properties
interface Design {
  folder: string;
  [key: string]: any;
}

const View: React.FC<ViewProps> = ({ generatePDF, reference, zoom, setZoom, offset, setOffset, selectionBox }) => {
    const { designAttributes, design, loading, setSelectionBox, fileVersion, baseDrawing, selectedPage, setSelectedPage, pages, generateStructure, fetchProject, rotation, setRotation } = useStore();

    const { id } = useParams<{ id: string }>();
    const containerRef = useRef<HTMLDivElement>(null);

    // Type assertions for store values
    const typedDesign = design as unknown as Design;
    const typedBaseDrawing = baseDrawing as unknown as BaseDrawing;

    // Initialize custom hooks
    const { 
        selectionState, 
        setSelectionState, 
        absoluteSelection, 
        setAbsoluteSelection, 
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
        <Dialog open={isPopUpON}>
            <DialogContent className="bg-theme max-h-[80vh] w-auto overflow-y-scroll p-6">
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

            <main className='h-[89vh] flex flex-col gap-1' ref={containerRef}>
                <div 
                    className='bg-white mx-6 rounded-lg h-[94%] transition-none overflow-hidden relative border-2 border-white/30'
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
                
                <div className="select-none h-[7%] flex justify-between items-center mx-6 px-2 bg-white rounded-lg">
                    <PageSelector
                        pages={pages}
                        selectedPage={selectedPage}
                        setSelectedPage={setSelectedPage}
                        onAddPage={() => openPopup('pages')}
                    />

                    <ZoomControls
                        zoom={zoom}
                        onZoomChange={setZoomValue}
                        onRotate={rotateSVG}
                    />
                </div>
            </main>
        </Dialog>
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
