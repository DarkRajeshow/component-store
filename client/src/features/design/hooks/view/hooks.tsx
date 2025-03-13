// hooks/useViewerControls.js
import { useState } from 'react';

export function useViewerControls({ setZoom, setOffset, zoom, rotation, setRotation }) {
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

    const rotateSVG = () => {
        const newRotation = (rotation + 90) % 360; // Increment rotation by 90°
        setRotation(newRotation);
    };

    const handleWheel = (event) => {
        setZoom(prevZoom => Math.min(Math.max(prevZoom + event.deltaY * -0.001, 0.2), 6));
    };

    const handleMouseDown = (event) => {
        setIsDragging(true);
        setLastMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event) => {
        if (isDragging) {
            const dx = event.clientX - lastMousePosition.x;
            const dy = event.clientY - lastMousePosition.y;

            // Convert the movement to account for rotation
            const angleRad = (rotation * Math.PI) / 180; // Convert degrees to radians
            const adjustedDx = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
            const adjustedDy = -dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

            // Update the offset with adjusted values
            setOffset((prevOffset) => ({
                x: prevOffset.x + adjustedDx / zoom,
                y: prevOffset.y + adjustedDy / zoom,
            }));

            setLastMousePosition({ x: event.clientX, y: event.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return {
        rotation,
        rotateSVG,
        handleWheel,
        isDragging,
        setIsDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
}

// hooks/useSelectionBox.js
import { useState } from 'react';

export function useSelectionBox({ reference, setSelectionBox }) {
    const [absoluteSelection, setAbsoluteSelection] = useState(null);
    const [selectionState, setSelectionState] = useState({
        isSelecting: false,
        isConfirmed: false,
        lastMousePosition: { x: 0, y: 0 },
        selection: null,
    });

    const handleSelection = (event) => {
        setSelectionState(prevState => {
            if (!prevState.isSelecting && !prevState.isConfirmed) {
                const rect = reference.current.getBoundingClientRect();
                const startX = event.clientX - rect.left;
                const startY = event.clientY - rect.top;
                setAbsoluteSelection((prev) => ({
                    ...prev,
                    startX: event.clientX,
                    startY: event.clientY,
                }));
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
    };

    const handleHoldSelection = () => {
        if (selectionState.isSelecting) {
            setSelectionState(prevState => ({
                ...prevState,
                isConfirmed: true,
            }));
            setSelectionBox(selectionState.selection);
        }
    };

    const updateSelectionOnMove = (event) => {
        if (selectionState.selection && !selectionState.isConfirmed) {
            const rect = reference.current.getBoundingClientRect();
            const endX = event.clientX - rect.left;
            const endY = event.clientY - rect.top;

            setAbsoluteSelection((prev) => ({
                ...prev,
                endX: event.clientX,
                endY: event.clientY,
            }));

            setSelectionState((prevState) => ({
                ...prevState,
                selection: {
                    ...prevState.selection,
                    endX,
                    endY,
                },
            }));
        }
    };

    return {
        selectionState,
        setSelectionState,
        absoluteSelection,
        setAbsoluteSelection,
        handleSelection,
        handleHoldSelection,
        updateSelectionOnMove
    };
}

// hooks/useFileOperations.js
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../../../../store/useStore';
import { addNewPageAPI } from '../../lib/designAPI';

export function useFileOperations({ generatePDF, setSelectionState, setAbsoluteSelection, setSelectionBox }) {
    const { id } = useParams();
    const [viewPopUpType, setViewPopUpType] = useState('');
    const [isPopUpON, setIsPopUpON] = useState(false);
    const [fileName, setFileName] = useState('');
    const [newPageName, setNewPageName] = useState('');

    const { pages, generateStructure, fetchProject } = useStore();

    const handleExportPDF = (e) => {
        e.preventDefault();
        generatePDF(fileName);
        setViewPopUpType('');
        setIsPopUpON(false);
        setSelectionState({
            isSelecting: false,
            isConfirmed: false,
            lastMousePosition: { x: 0, y: 0 },
            selection: null,
        });
        setAbsoluteSelection(null);
        setSelectionBox(null);
        setFileName('');
    };

    const handleAddNewPage = async (e) => {
        e.preventDefault();
        const pageExists = Object.keys(pages).some(pageName =>
            pageName.toLocaleLowerCase() === newPageName.toLocaleLowerCase()
        );

        if (pageExists) {
            toast.warning('Page already Exist.');
            return;
        }

        try {
            const updatedPages = {
                ...pages,
                [newPageName]: uuidv4()
            };

            let structure = generateStructure({ updatedPages });

            const body = {
                structure: structure
            };

            const { data } = await addNewPageAPI(id, body);

            if (data.success) {
                toast.success(data.status);
                await fetchProject(id);
                setViewPopUpType('');
                setIsPopUpON(false);
            } else {
                console.log(data);
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.');
        }
    };

    return {
        viewPopUpType,
        setViewPopUpType,
        isPopUpON,
        setIsPopUpON,
        fileName,
        setFileName,
        newPageName,
        setNewPageName,
        handleExportPDF,
        handleAddNewPage
    };
}

// hooks/useSvgRendering.js
import { useState, useEffect, useCallback } from 'react';
import filePath from '../../../../utils/filePath';
import { checkFileExists } from '../../../../utils/checkFileExists';
import useStore from '../../../../store/useStore';

export function useSvgRendering() {
    const {
        designAttributes,
        design,
        loading,
        fileVersion,
        baseDrawing,
        selectedPage,
        pages
    } = useStore();

    const [existingFiles, setExistingFiles] = useState({});
    const [isBaseDrawingExists, setIsBaseDrawingExists] = useState(false);

    const getSVGPath = useCallback((value) => {
        if (typeof value !== 'object') return null;

        const baseFilePath = `${filePath}${design.folder}/${pages[selectedPage]}`;

        if (value.value && value.path) {
            return `${baseFilePath}/${value.path}.svg?v=${fileVersion}`;
        }

        if (value.selectedOption === 'none') {
            return null;
        }

        const subOption = value.selectedOption;
        const subSubOption = value.options && value?.options[subOption]?.selectedOption;

        if (subSubOption && subSubOption !== " ") {
            return `${baseFilePath}/${value?.options[subOption]?.options[subSubOption]?.path}.svg?v=${fileVersion}`;
        }

        if (subOption && value?.options[subOption]?.path) {
            return `${baseFilePath}/${value.options[subOption]?.path}.svg?v=${fileVersion}`;
        }

        return null;
    }, [design.folder, fileVersion, pages, selectedPage]);

    // Generate file paths
    const filePaths = Object.values(designAttributes || {})
        .map((value) => getSVGPath(value))
        .filter(Boolean);

    useEffect(() => {
        const fetchFileExistence = async () => {
            const results = {};
            for (const path of filePaths) {
                // Only check if not already in `existingFiles`
                if (!(path in existingFiles)) {
                    results[path] = await checkFileExists(path);
                }
            }
            setExistingFiles((prev) => ({ ...prev, ...results }));
        };

        if (filePaths.length > 0) {
            fetchFileExistence();
        }
    }, [filePaths, existingFiles]);

    useEffect(() => {
        const checkBaseFileExistance = async (path) => {
            const result = await checkFileExists(path);
            setIsBaseDrawingExists(result);
        };

        if (baseDrawing?.path) {
            checkBaseFileExistance(`${filePath}${design.folder}/${pages[selectedPage]}/${baseDrawing?.path}.svg`);
        }
    }, [baseDrawing, pages, selectedPage, design.folder]);

    return {
        loading,
        designAttributes,
        design,
        fileVersion,
        baseDrawing,
        selectedPage,
        pages,
        existingFiles,
        isBaseDrawingExists,
        getSVGPath
    };
}