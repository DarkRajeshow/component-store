
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "../../../../components/ui/Dialog"
import { DialogDescription, DialogTitle } from "@radix-ui/react-alert-dialog"
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom"
import { handleClick, handleDragOver } from "../../../../utils/dragDrop"
import { shiftToSelectedCategoryAPI, updateBaseDrawingAPI } from "../../lib/designAPI"
import { useEffect } from "react"
import useStore from "../../../../store/useStore"
import { popUpQuestions, sideMenuTypes } from "../../../../constants";
import filePath from "../../../../utils/filePath";
import { checkFileExists } from "../../../../utils/checkFileExists";
import PageList from "./PageList";
import DeletePageConfirmation from "./DeletePageConfirmation";




function SideMenu() {

    const { design, selectedCategory, fetchProject, incrementFileVersion, fileVersion, baseDrawing, setBaseDrawing, loading, generateStructure, pages } = useStore()
    const [sideMenuType, setSideMenuType] = useState("")
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory)
    const [tempBaseDrawing, setTempBaseDrawing] = useState(baseDrawing)
    const [saveLoading, setSaveLoading] = useState(false)
    const [newBaseDrawingFiles, setNewBaseDrawingFiles] = useState({})
    const [isPopUpOpen, setIsPopUpOpen] = useState(false)
    const [tempPages, setTempPages] = useState(pages || {})
    const [newPageName, setNewPageName] = useState('')
    const [choosenPage, setChoosenPage] = useState('gad')
    const [fileExistenceStatus, setFileExistenceStatus] = useState({});
    const [openPageDeleteWarning, setOpenPageDeleteWarning] = useState('');


    const { id } = useParams();

    // Function to handle file selection
    const handleFileChange = (e) => {
        setNewBaseDrawingFiles({
            ...newBaseDrawingFiles,
            [tempPages[choosenPage]]: e.target.files[0]
        });
    };

    const handleDrop = (e, setFile) => {
        e.preventDefault();
        if (e.dataTransfer.files[0].type === 'image/svg+xml' || e.dataTransfer.files[0].type === 'application/pdf') {
            setFile({
                ...newBaseDrawingFiles,
                [tempPages[choosenPage]]: e.target.files[0]
            });
        } else {
            toast.error('Please choose a pdf/svg file.');
        }
    };


    // Function to submit the form and create a new design
    const updateBaseDrawing = async () => {
        setSaveLoading(true)

        if (!loading) {

            const fileUploadCount = Object.keys(tempPages).reduce((count, page) => {
                const exists = fileExistenceStatus[page]
                if (exists) {
                    return count + 1
                }
                return count
            }, 0)

            const newFileUploadCount = newBaseDrawingFiles ? Object.keys(newBaseDrawingFiles).length : 0

            if (((newFileUploadCount + fileUploadCount) < Object.keys(tempPages).length)) {
                toast.warning("You must upload the base drawing for all the pages to proceed.")
                setSaveLoading(false)
                return
            }

            else if (!newBaseDrawingFiles) {

                //shift
                try {

                    let changedPages;
                    let tempUpdatedDesignAttributes;
                    // Conditional assignment based on design type
                    if (design?.designType === "motor") {
                        changedPages = design.structure.mountingTypes[tempSelectedCategory].pages;
                        tempUpdatedDesignAttributes = design.structure.mountingTypes[tempSelectedCategory].attributes || {};
                        console.log(design.structure.mountingTypes[tempSelectedCategory].attributes || {});

                    } else if (design?.designType === "smiley") {
                        changedPages = design.structure.sizes[tempSelectedCategory].pages;
                        tempUpdatedDesignAttributes = design.structure.sizes[tempSelectedCategory].attributes || {};
                    }

                    console.log(changedPages);
                    console.log(tempUpdatedDesignAttributes);

                    let structure = generateStructure({
                        updatedAttributes: tempUpdatedDesignAttributes,
                        updatedCategory: tempSelectedCategory,
                        updatedPages: tempPages,
                        updatedBaseDrawing: tempBaseDrawing
                    })

                    console.log(structure);


                    const pagesNames = Object.keys(changedPages).filter((page) => !tempPages[page])

                    const folderNames = pagesNames.map((page) => pages[page])

                    const { data } = await shiftToSelectedCategoryAPI(id, {
                        selectedCategory: tempSelectedCategory,
                        structure,
                        folderNames
                    });

                    if (data.success) {
                        toast.success(data.status);
                        setNewBaseDrawingFiles();
                        await fetchProject(id);
                        setSideMenuType("")
                        setIsPopUpOpen(false)
                    } else {
                        toast.error(data.status);
                    }
                } catch (error) {
                    console.log(error);
                    toast.error('Something went wrong, please try again.');
                }
            }
            else {
                let uniqueFileName = uuidv4()
                // let uniqueFileName = `${uuidv4()}.svg`

                //if the base drawing is previously uploaded and user want to change the svg/pdf file
                uniqueFileName =
                    design?.designType === "motor"
                        ? design.structure.mountingTypes[tempSelectedCategory]?.baseDrawing?.path
                            ? design.structure.mountingTypes[tempSelectedCategory]?.baseDrawing?.path
                            : uniqueFileName
                        : design?.designType === "smiley"
                            ? design.structure.sizes[tempSelectedCategory].baseDrawing?.path
                                ? design.structure.sizes[tempSelectedCategory].baseDrawing?.path : uniqueFileName
                            : uniqueFileName

                const formData = new FormData();

                formData.append('folder', design.folder);
                // formData.append('title', uniqueFileName);


                let attributes = {}
                if (design?.designType === "motor") {
                    attributes = design.structure.mountingTypes[tempSelectedCategory].attributes || {}
                }
                else if (design?.designType === "smiley") {
                    attributes = design.structure.sizes[tempSelectedCategory].attributes || {}
                }

                // console.log(`${uniqueFileName.slice(0, uniqueFileName.length - 4)}.svg`);


                let changedPages;
                // Conditional assignment based on design type
                if (design?.designType === "motor") {
                    changedPages = design.structure.mountingTypes[tempSelectedCategory].pages;
                } else if (design?.designType === "smiley") {
                    changedPages = design.structure.sizes[tempSelectedCategory].pages;
                }


                const pagesNames = Object.keys(changedPages).filter((page) => !tempPages[page])

                const folderNames = pagesNames.map((page) => pages[page])

                let structure = generateStructure({
                    updatedAttributes: attributes,
                    updatedBaseDrawing: {
                        path: uniqueFileName
                    },
                    updatedCategory: tempSelectedCategory,
                    updatedPages: tempPages
                })

                //tempDesignAttributes is a object
                formData.append('selectedCategory', tempSelectedCategory)
                formData.append('folderNames', folderNames);

                //we need to stringify the object as objects are not awailable in formData as a datatype
                formData.append('structure', JSON.stringify(structure));

                console.log(structure);


                for (const [folder, file] of Object.entries(newBaseDrawingFiles)) {
                    const customName = `${folder}<<&&>>${uniqueFileName}${file.name.slice(-4)}`; // Folder path + filename
                    formData.append('files', file, customName);
                }

                // formData.append('svgFile', newBaseDrawingFiles);

                try {
                    const { data } = await updateBaseDrawingAPI(id, formData);
                    if (data.success) {
                        toast.success(data.status);
                        setNewBaseDrawingFiles();
                        await fetchProject(id);
                        setSideMenuType("")
                        setBaseDrawing({
                            path: uniqueFileName
                        })
                        incrementFileVersion();
                        setIsPopUpOpen(false)
                    } else {
                        toast.error(data.status);
                    }
                } catch (error) {
                    console.log(error);
                    toast.error('Failed to add a customization attribute.');
                }
            }
        }

        setSaveLoading(false)

    };

    const openDeleteConfirmation = (pageName) => {
        if (fileExistenceStatus[pageName]) {
            setOpenPageDeleteWarning(pageName)
            return;
        }
        let updatedTempPages = { ...tempPages }
        delete updatedTempPages[pageName]
        if (choosenPage === pageName) {
            setChoosenPage('gad')
        }
        setTempPages(updatedTempPages)
    }

    const handleDelete = () => {
        let updatedTempPages = { ...tempPages }
        delete updatedTempPages[openPageDeleteWarning]
        if (choosenPage === openPageDeleteWarning) {
            setChoosenPage('gad')
        }
        setTempPages(updatedTempPages)
        setOpenPageDeleteWarning('')
    }


    const toggleDialog = () => {
        document.getElementById("closeButtonSideMenu").click();
    }

    const baseFilePath = `${filePath}${design.folder}`;

    useEffect(() => {
        setTempBaseDrawing(baseDrawing);
    }, [baseDrawing])

    useEffect(() => {
        setTempSelectedCategory(selectedCategory)
    }, [selectedCategory])

    useEffect(() => {
        console.log(`${tempBaseDrawing?.path}.svg`);
        const checkFilesExistence = async () => {
            const results = await Promise.all(
                Object.entries(tempPages).map(async ([pageFolder]) => {

                    const exists = await checkFileExists(`${baseFilePath}/${tempPages[pageFolder]}/${tempBaseDrawing?.path}.svg`);
                    return { [pageFolder]: exists };
                })
            );

            // Convert array of objects to a single object with pageFolder as keys
            const statusObject = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

            // Update state with the full object
            setFileExistenceStatus(statusObject);

            console.log(statusObject);

            // Check if any file is missing to open the popup
            if (Object.values(statusObject).some((exists) => !exists)) {
                setIsPopUpOpen(true);
            }
        };
        checkFilesExistence();

    }, [tempBaseDrawing, tempPages, baseFilePath]);


    useEffect(() => {
        setTempPages(pages)
        setChoosenPage(Object.keys(pages)[Object.keys(pages).length - 1])
    }, [pages])

    useEffect(() => {
        setNewBaseDrawingFiles()
        setChoosenPage('gad')
    }, [tempSelectedCategory])


    const allowedToClose = (tempBaseDrawing !== " " && !(Object.keys(tempPages).some((page) => !fileExistenceStatus?.[page])))

    return (
        <Dialog open={isPopUpOpen}>
            <div className="absolute select-none w-12 rounded-full flex items-center flex-col bg-white backdrop-blur-lg border-2 -translate-y-1/2 top-1/2 left-10 z-40 p-1 gap-1">
                {sideMenuTypes.map((type, index) => (
                    <DialogTrigger onClick={() => {
                        setSideMenuType(type.value)

                        if (type.value == "masterDrawing") {
                            setIsPopUpOpen(!isPopUpOpen)
                        }

                    }} title={type.label} key={index} className={`w-full hover:text-black transition-all cursor-pointer aspect-square flex items-center justify-center rounded-full ${sideMenuType === type.value ? "text-dark bg-dark/5" : "text-dark/60"}`}>
                        <span className="p-1">
                            {type.icon}
                        </span>
                    </DialogTrigger>
                ))}

                <DialogTrigger id='closeButtonSideMenu' hidden></DialogTrigger>


                <DialogContent className={"select-none bg-white max-h-[80vh] min-h-[40vh] w-[750px] overflow-y-auto p-6"}>


                    {allowedToClose && <button onClick={() => {
                        setSideMenuType("")
                        toggleDialog()
                        setIsPopUpOpen(!isPopUpOpen)
                    }} className='absolute top-3 right-3 shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>}
                    <DialogDescription hidden />

                    {design.designType && <div className='group flex flex-col gap-4 w-full'>

                        <DialogTitle className="text-xl font-semibold text-dark/70 text-center py-2">Upload / Change Base Drawing</DialogTitle>

                        {popUpQuestions[design.designType].questions.map((question, index) => (
                            <div key={index} className='pb-1'>
                                <label className='text-black font-medium'>{question.label}</label>
                                <select
                                    required
                                    value={tempSelectedCategory}
                                    onChange={(e) => {
                                        setTempSelectedCategory(e.target.value);
                                        let structure = design.structure

                                        //designTypeCode

                                        console.log(design?.designType);

                                        if (design?.designType === "motor") {

                                            setTempBaseDrawing(structure?.mountingTypes[e.target.value]?.baseDrawing)
                                            setTempPages(structure?.mountingTypes[e.target.value]?.pages || {})

                                        }
                                        else if (design?.designType === "smiley") {
                                            setTempBaseDrawing(structure.sizes[e.target.value].baseDrawing)
                                            setTempPages(structure?.sizes[e.target.value]?.pages || {})
                                        }
                                    }}
                                    className="py-3 px-2 bg-white/80 rounded-md border w-full outline-none"
                                >
                                    {question.options.map((option, index) => (
                                        <option className='hover:bg-white ' value={option.value} key={index}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}

                        <div id="pages" className="py-3 flex gap-2 flex-col ">
                            <p className='font-medium text-lg'>Add pages</p>
                            <div className={`group cursor-text bg-blue-50/40 py-1 focus-within:bg-blue-50/60 rounded-md flex items-center justify-center gap-2 px-2 mb-3`}>
                                <input
                                    id='newPageName'
                                    required
                                    type="text"
                                    value={newPageName}
                                    onChange={(e) => setNewPageName(e.target.value)}
                                    className="focus:bg-transparent bg-transparent h-full mt-0 w-full outline-none py-3 px-4"
                                    placeholder="e.g my-design"
                                />
                                {newPageName &&
                                    <svg onClick={() => {
                                        if (newPageName in tempPages) {
                                            return toast.warning(`Page "${newPageName}" Already Exist`)
                                        }
                                        setTempPages((prevTempPages) => ({
                                            ...prevTempPages,
                                            [newPageName]: uuidv4()
                                        }))
                                        setNewPageName('')
                                    }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-9 w-9 p-1.5 rounded-full bg-white hover:border-black border transition-all cursor-pointer">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                }
                            </div>
                            <div>
                                <PageList choosenPage={choosenPage} fileExistenceStatus={fileExistenceStatus} openDeleteConfirmation={openDeleteConfirmation} setChoosenPage={setChoosenPage} tempPages={tempPages || {}}></PageList>

                                <DeletePageConfirmation handleDelete={handleDelete} openPageDeleteWarning={openPageDeleteWarning} setOpenPageDeleteWarning={setOpenPageDeleteWarning}></DeletePageConfirmation>
                            </div>
                        </div>

                        <div className='flex gap-2 w-full h-full items-center justify-between px-5 py-6 rounded-md bg-blue-50'>
                            <div className='blur-none w-full'>
                                <h2 className='font-semibold text-gray-500 uppercase pb-2'>Base Drawing for Page `{choosenPage}`</h2>
                                <p className='font-medium text-lg'>Upload File</p>
                                <p className="text-red-700 font-semibold">
                                    {tempBaseDrawing === " " && "You must upload the base drawing with the above combinations to proceed."}
                                </p>
                                <div className='grid grid-cols-2 gap-4 pt-5'>
                                    <div className='flex flex-col gap-2'>
                                        <p className="font-medium text-gray-600">Select File</p>
                                        <input
                                            id='baseDrawingInput'
                                            type="file"
                                            accept='.svg,.pdf'
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        <div
                                            onClick={() => handleClick('baseDrawingInput')}
                                            onDrop={(e) => { handleDrop(e, setNewBaseDrawingFiles) }}
                                            onDragOver={handleDragOver}
                                            className="w-full aspect-square p-4 border-2 border-dashed border-gray-400 cursor-pointer flex items-center justify-center min-h-72"
                                        >
                                            <span className='text-sm w-60 mx-auto text-center'>Drag and drop the customization option in SVG format.</span>
                                        </div>
                                    </div>

                                    {(
                                        <div className=" flex gap-2 flex-col">
                                            <p className="font-medium text-gray-600">File Preview</p>
                                            {/* <div className='font-medium'>{selectedFile ? "Preview" : "Current file"}</div> */}
                                            <div className='aspect-square p-5 bg-design/5 border-2 border-dark/5 border-gray-400 w-full overflow-hidden items-center justify-center flex flex-col'>

                                                {
                                                    (tempBaseDrawing?.path && fileExistenceStatus[choosenPage] || newBaseDrawingFiles?.[tempPages[choosenPage]]) && (
                                                        newBaseDrawingFiles?.[tempPages[choosenPage]]?.type === "application/pdf" ? (
                                                            <embed src={URL.createObjectURL(newBaseDrawingFiles?.[tempPages[choosenPage]])} type="application/pdf" width="100%" height="500px" />
                                                        ) : (
                                                            <img
                                                                src={newBaseDrawingFiles?.[tempPages[choosenPage]] ? URL.createObjectURL(newBaseDrawingFiles?.[tempPages[choosenPage]]) : `${baseFilePath}/${tempPages[choosenPage]}/${tempBaseDrawing?.path}.svg?v=${fileVersion}`}
                                                                alt={"base drawing"}
                                                                className="w-full rounded-xl"
                                                            />
                                                        )
                                                    )
                                                }

                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center justify-between gap-3 py-3 px-2'>
                            <button disabled={saveLoading || (tempBaseDrawing === " " && !newBaseDrawingFiles)} onClick={updateBaseDrawing} className={`flex w-1/2 items-center justify-center gap-3 py-2 px-3 rounded-md  text-white font-medium relative ${(tempBaseDrawing === " " && !newBaseDrawingFiles) ? " bg-[#6B26DB]/60" : "bg-[#6B26DB]/90 hover:bg-[#6B26DB]"}`}>{saveLoading ? 'Saving...' : 'Save & Shift'}
                                {
                                    saveLoading && <div className='absolute left-4 h-4 w-4 rounded-full bg-transparent border-t-transparent border-[2px] border-white animate-spin' />
                                }
                            </button>
                            {allowedToClose && <button onClick={() => {
                                setSideMenuType("")
                                toggleDialog()
                                setIsPopUpOpen(!isPopUpOpen)
                            }} disabled={saveLoading} className={`flex items-center justify-center w-1/2 gap-3 py-2 px-3 rounded-md  text-dark font-medium relative bg-design`}>Cancel </button>}
                        </div>

                    </div>}
                </DialogContent>


            </div >
        </Dialog >
    )
}

export default SideMenu