import PropTypes from 'prop-types';
import filePath from '../../../../utils/filePath';
import { useState, useRef } from 'react';
import { Slider } from '../../../../components/ui/Slider';
import { cn } from '../../../../utils/utils';
import useStore from '../../../../store/useStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    // DialogFooter,
    // DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../../components/ui/Dialog"
import { useMemo } from 'react';
import { useEffect } from 'react';
import { checkFileExists } from '../../../../utils/checkFileExists';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { addNewPageAPI } from '../../lib/designAPI';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';


// import LeaderArrowText from './LoaderArrowText';

function View({ generatePDF, reference, zoom, setZoom, offset, setOffset }) {
    const { designAttributes, design, loading, setSelectionBox, fileVersion, baseDrawing, selectedPage, setSelectedPage, pages, generateStructure, fetchProject, rotation, setRotation } = useStore();

    const { id } = useParams()
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState("")
    const [newPageName, setNewPageName] = useState("")

    const [viewPopUpType, setViewPopUpType] = useState('')
    const [isPopUpON, setIsPopUpON] = useState(false)
    const [isBaseDrawingExists, setIsBaseDrawingExists] = useState(false)

    const [absoluteSelection, setAbsoluteSelection] = useState(null)
    const [selectionState, setSelectionState] = useState({
        isSelecting: false,
        isConfirmed: false,
        lastMousePosition: { x: 0, y: 0 },
        selection: null,
    });
    const [existingFiles, setExistingFiles] = useState({});

    const containerRef = useRef(null);
    const rotateSVG = () => {
        const newRotation = (rotation + 90) % 360; // Increment rotation by 90°
        setRotation(newRotation);
    };

    const handleWheel = (event) => {
        setZoom(prevZoom => Math.min(Math.max(prevZoom + event.deltaY * -0.001, 0.2), 6));
    };

    const handleMouseDown = (event) => {
        setIsDragging(true);
        setSelectionState(prevState => ({
            ...prevState,
            lastMousePosition: { x: event.clientX, y: event.clientY },
        }));
    };

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
                }))
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

    const handleMouseMove = (event) => {
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
        } else if (selectionState.selection && !selectionState.isConfirmed) {
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


    const addNewPage = async (e) => {
        e.preventDefault();
        const pageExists = Object.keys(pages).some(pageName =>
            pageName.toLocaleLowerCase() === newPageName.toLocaleLowerCase()
        );

        if (pageExists) {
            toast.warning('Page already Exist.')
            return;
        }


        try {
            const updatedPages = {
                ...pages,
                [newPageName]: uuidv4()
            }

            let structure = generateStructure({ updatedPages })

            const body = {
                structure: structure
            }

            const { data } = await addNewPageAPI(id, body);

            if (data.success) {
                toast.success(data.status);
                await fetchProject(id)
                setViewPopUpType('')
                setIsPopUpON(false)
            }
            else {
                console.log(data);
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.')
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false);
    };

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


    // Generate file paths and log them for debugging
    const filePaths = useMemo(() => {
        const paths = Object.values(designAttributes)
            .map((value) => getSVGPath(value))
            .filter(Boolean);
        return paths;
    }, [designAttributes, getSVGPath]);

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
            setIsBaseDrawingExists(result)
        };
        if (baseDrawing?.path) {

            checkBaseFileExistance(`${filePath}${design.folder}/${pages[selectedPage]}/${baseDrawing?.path}.svg`)
        }
    }, [baseDrawing, pages, selectedPage, design.folder])












    // to be deleted in the future 


    // const [isOpen, setIsOpen] = useState(true);
    // const [companyCode, setCompanyCode] = useState('');
    // const [codePosition, setCodePosition] = useState({ x: 50, y: window.innerHeight * 0.8 });

    // // Generate design hash based on components
    // const generateDesignHash = () => {
    //     const components = [baseDrawing?.path, ...Object.values(designAttributes)
    //         .map(value => value?.selectedOption || value?.value)
    //         .filter(Boolean)];
    //     return 'DESIGN-' + components.join('-').replace(/[^a-zA-Z0-9]/g, '').substr(0, 8).toUpperCase();
    // };

    // const CodeGroup = () => {
    //     return (
    //         <g
    //             id="company-code-group"
    //             className='select-none'
    //             style={{
    //                 transform: `scale(${zoom}) translate(${offset.x + codePosition.x / zoom}px, ${offset.y + codePosition.y / zoom}px))`,
    //                 transformOrigin: 'center',
    //                 cursor: isDragging ? 'grabbing' : 'grab',
    //             }}
    //         >
    //             <rect
    //                 width="200"
    //                 height="50"
    //                 fill="transparent"
    //                 fillOpacity="1"
    //             />
    //             <text
    //                 x="10"
    //                 y="30"
    //                 fontSize="20"
    //                 fill="black"
    //             >
    //                 sdfkdsfksdkjh
    //             </text>
    //         </g>
    //     );
    // };

    // const handleCodeDrag = (e) => {
    //     if (e.target.closest('#company-code-group')) {
    //         const svgRect = e.target.closest('svg').getBoundingClientRect();
    //         const newX = (e.clientX - svgRect.left) / zoom - offset.x;
    //         const newY = (e.clientY - svgRect.top) / zoom - offset.y;
    //         setCodePosition({ x: newX, y: newY });
    //     }
    // };




    return (
        <Dialog open={isPopUpON}>
            <DialogContent className="bg-theme max-h-[80vh] w-auto overflow-y-scroll p-6">
                {viewPopUpType === 'export' && <form onSubmit={(e) => {
                    e.preventDefault();
                    generatePDF(fileName);
                    setViewPopUpType('')
                    setIsPopUpON(false)
                    setSelectionState({
                        isSelecting: false,
                        isConfirmed: false,
                        lastMousePosition: { x: 0, y: 0 },
                        selection: null,
                    });
                    setAbsoluteSelection(null);
                    setSelectionBox(null)
                    setFileName("");
                }}
                    className='flex flex-col gap-2'>
                    <DialogTitle className="text-dark font-medium py-2">Export File as</DialogTitle>
                    <DialogTrigger id='trigger' className='absolute top-3 right-3 shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </DialogTrigger>
                    <DialogDescription className='group cursor-text bg-theme/40 py-2 focus-within:bg-theme/60 rounded-md flex items-center justify-center gap-2 px-2'>
                        <label htmlFor='fileName' className=' p-2 bg-dark/5 rounded-md'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6  text-dark/60 group-hover:text-dark h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                        </label>
                        <input
                            id='fileName'
                            required
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="focus:bg-transparent bg-transparent h-full mt-0 w-full outline-none py-3 px-4"
                            placeholder="e.g my-design"
                        />
                    </DialogDescription>
                    <button type='submit' className='bg-blue-300 hover:bg-green-300 py-2 px-3 rounded-full text-dark font-medium mt-4'>Export as PDF</button>
                </form>}

                {viewPopUpType === 'pages' && <form onSubmit={addNewPage}
                    className='flex flex-col gap-2'>
                    <DialogTitle className="text-dark font-medium py-2">Add New Page</DialogTitle>
                    <button onClick={() => setIsPopUpON(false)} className='absolute top-3 right-3 shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <DialogDescription className='group cursor-text bg-theme/40 py-2 focus-within:bg-theme/60 rounded-md flex items-center justify-center gap-2 px-2'>
                        <label htmlFor='pageName' className=' p-2 bg-dark/5 rounded-md'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6  text-dark/60 group-hover:text-dark h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                        </label>
                        <input
                            id='pageName'
                            required
                            type="text"
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            className="focus:bg-transparent bg-transparent h-full mt-0 w-full outline-none py-3 px-4"
                            placeholder="e.g T Box"
                        />
                    </DialogDescription>
                    <button type='submit' className='bg-blue-300 hover:bg-green-300 py-2 px-3 rounded-full text-dark font-medium mt-4'>Add</button>
                </form>}
            </DialogContent>

            <main className='h-[89vh] flex flex-col gap-1' ref={containerRef}>
                <div className='bg-white mx-6 rounded-lg h-[94%] transition-none overflow-hidden relative border-2 border-white/30 '
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onDoubleClick={handleSelection}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className='flex items-center justify-center h-full'
                    // i want to add designRef to this 
                    >
                        {loading && <div className='h-6 w-6 my-auto border-dark border-2 border-b-transparent animate-spin rounded-full flex items-center justify-center' />}
                        {!loading && <svg
                            onClick={handleHoldSelection}
                            ref={reference}
                            className={`components relative w-full h-full transition-none`}
                            viewBox={`0 0 ${window.innerWidth - 32} ${window.innerHeight * 0.846}`}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {(baseDrawing?.path && isBaseDrawingExists) && <image
                                style={{
                                    transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                                    transformOrigin: 'center',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    rotate: `${rotation}deg`,
                                }}
                                href={`${filePath}${design.folder}/${pages[selectedPage]}/${baseDrawing?.path}.svg?v=${fileVersion}`}
                                height={window.innerHeight * 0.846}
                                width={window.innerWidth - 32}
                            />}
                            {designAttributes && Object.entries(designAttributes).map(([attribute, value]) => {
                                const href = getSVGPath(value)
                                const isValid = value?.value
                                    || (value?.selectedOption && value.selectedOption !== "none"
                                        && !value?.options?.[value.selectedOption]?.options)
                                    || (value?.options?.[value?.selectedOption]?.selectedOption
                                        && value.options[value.selectedOption].selectedOption !== ' ');

                                return (
                                    (
                                        (isValid && existingFiles[href]) && <image
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
                                    )
                                )
                            })}

                            {/* {companyCode && <CodeGroup />} */}
                        </svg>}


                        {/* experimental */}

                        {/* <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Enter Company Code</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <input
                                        value={companyCode}
                                        onChange={(e) => setCompanyCode(e.target.value)}
                                        placeholder="Enter company-specific code"
                                        className="w-full"
                                    />
                                </div>
                                <DialogFooter>
                                    <button onClick={() => setIsOpen(false)}>
                                        Save Design
                                    </button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog> */}
                    </div>
                    {absoluteSelection && (
                        <div
                            style={{
                                left: Math.abs(Math.min(absoluteSelection.startX, absoluteSelection.endX)) + "px",
                                top: Math.abs(Math.min(absoluteSelection.startY, absoluteSelection.endY)) + "px",
                                width: Math.abs(absoluteSelection.endX - absoluteSelection.startX) + "px",
                                height: Math.abs(absoluteSelection.endY - absoluteSelection.startY) + "px"
                            }}
                            className={`border-2 select-none transition-none fixed border-dark ${selectionState.isConfirmed ? "border-solid border-dark/50 bg-blue-500/20" : "bg-transparent border-dashed"}`}
                        >
                            {selectionState.isConfirmed && <div className='flex w-full items-top justify-between px-2 py-2'>
                                <svg onClick={() => {
                                    setSelectionState({
                                        isSelecting: false,
                                        isConfirmed: false,
                                        lastMousePosition: { x: 0, y: 0 },
                                        selection: null,
                                    });
                                    setAbsoluteSelection(null);
                                    setSelectionBox(selectionState.selection);
                                }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                                <button onClick={() => {
                                    setViewPopUpType('export')
                                    setIsPopUpON(true)
                                }} id='exportBtn' className='bg-red-200 hover:bg-green-300 py-2 rounded-full px-4 text-xs text-dark font-medium flex items-center gap-2'>
                                    PDF
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </button>
                            </div>}
                        </div>
                    )}
                </div>
                <div className="select-none h-[7%] flex justify-between items-center mx-6 px-2 bg-white rounded-lg">
                    <div className='flex gap-2 items-center'>
                        <p className='font-medium text-sm'>Pages</p>
                        <div className='flex pl-2 gap-2'>
                            {Object.keys(pages).map((page) => (
                                <div onClick={() => {
                                    setSelectedPage(page)
                                }} className={`py-1 px-2 bg-zinc-100 cursor-pointer uppercase text-sm font-medium border-2 border-transparent ${selectedPage === page && 'border-zinc-500'}`} key={page}>
                                    {page}
                                </div>
                            ))}
                        </div>
                        {Object.keys(pages).length <= 8 && <svg
                            onClick={() => {
                                setViewPopUpType('pages')
                                setIsPopUpON(true)
                            }}
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 p-1  hover:border-black border-2 transition-all cursor-pointer">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>}
                    </div>

                    <div className='flex items-center justify-center gap-2'>
                        <button onClick={rotateSVG} title='View Only Rotation'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                            </svg>
                        </button>
                        <Slider
                            max={600}
                            step={1}
                            min={20}
                            value={[zoom * 100]}
                            onValueChange={(value) => setZoom(value / 100)}
                            className={cn("w-60 !transition-none")}
                        />
                        <span className='text-sm font-medium w-10'>{Math.round(zoom * 100)}%</span>
                    </div>
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
