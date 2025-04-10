import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UpdateChild from './update/UpdateChild';
import { updatecomponentsAPI, deletecomponentsAPI } from '../../lib/designAPI';
import { toast } from 'sonner';
import { handleClick, handleDragOver } from '../../../../utils/dragDrop'
import filePath from '../../../../utils/filePath';
import AddChild from './update/AddChild';
import useStore from '../../../../store/useStore';
import { DialogDescription, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { checkFileExists } from '../../../../utils/checkFileExists';
import { IStructure, IAttribute, IAttributeOption } from '../../../../types/types';

interface UpdateFormProps {}

interface FileCountInfo {
    fileUploads: number;
    selectedPagesCount: number;
}

interface FileExistenceStatus {
    [key: string]: boolean;
}

interface NewFiles {
    [key: string]: {
        [key: string]: File;
    };
}

interface FileCounts {
    [key: string]: FileCountInfo;
}

interface AttributeValue {
    options?: {
        [key: string]: IAttribute | IAttributeOption;
    };
    [key: string]: any;
}

function UpdateForm({}: UpdateFormProps) {
    const { design, menuOf, components, setComponents, incrementFileVersion, newFiles, setNewFiles, updatedComponents, setUpdatedComponents, generateStructure, setUndoStack, setRedoStack, pages, loading, deleteFilesOfPages, setDeleteFilesOfPages, filesToDelete, setFilesToDelete } = useStore();

    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [operation, setOperation] = useState<"update" | "add" | "delete" | "">("update");
    const [newAttributeName, setNewAttributeName] = useState<string>(menuOf[menuOf.length - 1]);
    const [updatedValue, setUpdatedValue] = useState<AttributeValue>({});
    const [selectedAttributeValue, setSelectedAttributeValue] = useState<AttributeValue>({});
    const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
    const [selectedPages, setSelectedPages] = useState<string[]>(['gad']);
    const [fileCounts, setFileCounts] = useState<FileCounts>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: (files: NewFiles) => void, page: string) => {
        if (e.target.files && e.target.files[0].type === 'image/svg+xml' || e.target.files && e.target.files[0].type === 'application/pdf') {
            setFiles({
                ...newFiles,
                [selectedAttributeValue?.path]: {
                    ...newFiles?.[selectedAttributeValue?.path],
                    [pages[page]]: e.target.files[0]
                },
            });
        }
        else {
            toast.error('Please choose a svg file.');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, setFiles: (files: NewFiles) => void, page: string) => {
        e.preventDefault();
        if (e.dataTransfer.files[0].type === 'image/svg+xml' || e.dataTransfer.files[0].type === 'application/pdf') {
            setFiles({
                ...newFiles,
                [selectedAttributeValue?.path]: {
                    ...newFiles?.[selectedAttributeValue?.path],
                    [pages[page]]: e.dataTransfer.files[0]
                },
            });
        }
        else {
            toast.error('Please choose a svg file.');
        }
    };



    useEffect(() => {
        const deepCopyValue = JSON.parse(JSON.stringify(components));
        setUpdatedComponents(deepCopyValue)
    }, [components, setUpdatedComponents])

    const updateValue = async (renamedAttributes: any) => {
        const tempAttributes = { ...renamedAttributes }

        if (menuOf.length === 3) {
            tempAttributes[menuOf[0]].options[menuOf[1]].options[newAttributeName] = updatedValue;
        } else if (menuOf.length === 2) {
            tempAttributes[menuOf[0]].options[newAttributeName] = updatedValue;
        } else if (menuOf.length === 1) {
            tempAttributes[newAttributeName] = updatedValue;
        }

        return tempAttributes;
    };

    const deleteValue = async () => {
        const tempAttributes = { ...components }

        if (menuOf.length === 3) {
            if (tempAttributes[menuOf[0]].options[menuOf[1]].selectedOption === menuOf[menuOf.length - 1]) {
                tempAttributes[menuOf[0]].options[menuOf[1]].selectedOption = " "
            }
            delete tempAttributes[menuOf[0]].options[menuOf[1]].options[menuOf[menuOf.length - 1]];
        } else if (menuOf.length === 2) {
            if (tempAttributes[menuOf[0]].selectedOption === menuOf[menuOf.length - 1]) {
                tempAttributes[menuOf[0]].selectedOption = "none"
            }
            delete tempAttributes[menuOf[0]].options[menuOf[menuOf.length - 1]];
        } else if (menuOf.length === 1) {
            delete tempAttributes[menuOf[menuOf.length - 1]];
        }

        return tempAttributes;
    };

    async function extractPaths(): Promise<string[]> {
        let paths: string[] = [];

        function traverse(current: any): void {
            if (typeof current === 'object' && current !== null) {
                if (current.path && current.path !== "none") {
                    paths.push(current.path);
                }
                for (let key in current) {
                    if (current[key]) {
                        traverse(current[key]);
                    }
                }
            }
        }

        traverse(updatedValue);
        return paths;
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateLoading(true);

        if (!newAttributeName.trim()) {
            toast.error("Attribute name field is required.");
            setUpdateLoading(false)
            return;
        }

        if (selectedAttributeValue?.path) {
            const fileUploadCount = selectedPages.reduce((count, page) => {
                const exists = fileExistenceStatus[page]
                if (exists) {
                    return count + 1
                }
                return count;
            }, 0)


            const newFileUploadCount = newFiles?.[selectedAttributeValue?.path] ? Object.keys(newFiles?.[selectedAttributeValue?.path]).length : 0

            if (((newFileUploadCount + fileUploadCount) < Object.keys(selectedPages).length)) {
                toast.warning("You must upload the files for all the selected pages.")
                setUpdateLoading(false)
                return
            }
        } else {
            for (const [option, info] of Object.entries(fileCounts)) {
                if (info.fileUploads < info.selectedPagesCount) {
                    toast.warning(`In "${option}" option, you selected ${info.selectedPagesCount} page, but uploaded only ${info.fileUploads} ${info.fileUploads <= 1 ? 'file' : 'files'}.`);
                    setUpdateLoading(false);
                    return;
                }
            }
        }


        try {
            setUndoStack([]);
            setRedoStack([])
            const renameAttribute = async (attributes: any, keys: string[], newKey: string) => {
                if (keys[keys.length - 1] === newKey) {
                    return attributes; // Return early if newKey is the same as the last key
                }

                if (keys.length === 1) {
                    const oldKey = keys[0];
                    if (attributes[oldKey]) {
                        attributes[newKey] = attributes[oldKey];
                        delete attributes[oldKey];
                    }
                } else if (keys.length === 2) {
                    const [category, option] = keys;
                    if (attributes[category] && attributes[category].options) {
                        if (attributes[category].options[option]) {
                            attributes[category].options[newKey] = attributes[category].options[option];
                            delete attributes[category].options[option];
                        }

                        // Update selectedOption if necessary
                        if (attributes[category].selectedOption === option) {
                            attributes[category].selectedOption = newKey;
                        }
                    }
                } else if (keys.length === 3) {
                    const [category, subcategory, option] = keys;
                    if (attributes[category] && attributes[category].options &&
                        attributes[category].options[subcategory] &&
                        attributes[category].options[subcategory].options) {

                        attributes[category].options[subcategory].options[newKey] = attributes[category].options[subcategory].options[option];
                        delete attributes[category].options[subcategory].options[option];

                        // Update selectedOption if necessary
                        if (attributes[category].options[subcategory].selectedOption === option) {
                            attributes[category].options[subcategory].selectedOption = newKey;
                        }
                    }
                }

                return attributes; // Return the updated attributes object
            };


            const renamedAttributes = await renameAttribute(components, menuOf, newAttributeName);

            const updatedcomponents = await updateValue(renamedAttributes);

            const formData = new FormData();

            const structure: IStructure = generateStructure({
                updatedComponents: updatedcomponents
            })

            formData.append('folder', design.folder);
            formData.append('filesToDelete', JSON.stringify(filesToDelete));
            formData.append('deleteFilesOfPages', JSON.stringify(deleteFilesOfPages));

            //tempcomponents is a object
            formData.append('structure', JSON.stringify(structure));

            for (const [title, value] of Object.entries(newFiles)) {
                for (const [folder, file] of Object.entries(value)) {
                    const customName = `${folder}<<&&>>${title}${file.name.slice(-4)}`; // Folder path + filename
                    formData.append('files', file, customName);
                }
            }

            const { data } = await updatecomponentsAPI(id!, formData);

            if (data.success) {
                setComponents(updatedcomponents)
                toast.success(data.status);
                const closeButton = document.querySelector("#close");
                if (closeButton instanceof HTMLElement) {
                    closeButton.click();
                }
                setNewFiles({});
                incrementFileVersion()
            }
            else {
                toast.error(data.status);
            }
        }

        catch (error) {
            console.error('Failed to rename attribute:', error);
        }

        setUpdateLoading(false);
    };

    useEffect(() => {
        const value = (menuOf.length === 3)
            ? updatedComponents[menuOf[0]]?.options[menuOf[1]]?.options[menuOf[2]]
            : (menuOf.length === 2)
                ? updatedComponents[menuOf[0]]?.options[menuOf[1]]
                : updatedComponents[menuOf[0]];


        if (value) {
            const deepCopyValue = JSON.parse(JSON.stringify(value))
            setUpdatedValue(deepCopyValue);
            setSelectedAttributeValue(deepCopyValue);
        }
    }, [updatedComponents, menuOf])



    const { id } = useParams<{ id: string }>();

    const baseFilePath = `${filePath}${design.folder}`;



    const handleDelete = async () => {
        const updateValueAfterDelete = await deleteValue();

        let structure: IStructure = generateStructure({
            updatedComponents: updateValueAfterDelete
        })

        const body = {
            structure: structure,
            filesToDelete: await extractPaths()
        }

        const { data } = await deletecomponentsAPI(id!, body);

        if (data.success) {
            setComponents(updateValueAfterDelete);
            toast.success(data.status);
            const closeButton = document.querySelector("#close");
            if (closeButton instanceof HTMLElement) {
                closeButton.click();
            }
            incrementFileVersion((version) => version + 1)
        }
        else {
            toast.error(data.status);
        }
    }

    useEffect(() => {

        const checkFilesExistence = async () => {
            if (!selectedAttributeValue?.path) {
                setFileExistenceStatus({});
                return;
            }

            const alreadySelectedPages: string[] = [];

            const results = await Promise.all(
                Object.keys(pages).map(async (page) => {
                    const exists = await checkFileExists(`${baseFilePath}/${pages[page]}/${selectedAttributeValue?.path}.svg`);
                    if (exists) {
                        alreadySelectedPages.push(page);
                    }
                    return { [page]: exists };
                })
            );

            // Convert array of objects to a single object with pageFolder as keys
            const statusObject = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

            // Update state with the full object
            setFileExistenceStatus(statusObject);
            setSelectedPages(alreadySelectedPages)
        };

        if (!loading) {
            checkFilesExistence();
        }
    }, [loading, pages, baseFilePath, selectedAttributeValue?.path]);


    const resetStates = () => () => {
        setUpdatedValue(selectedAttributeValue);
        setNewAttributeName(menuOf[menuOf.length - 1]);
        setNewFiles({})
        setDeleteFilesOfPages([])
        setFilesToDelete([])
        setFileCounts({})
    }

    return (
        <form onSubmit={handleUpdate} className='flex flex-col gap-1 w-[60vw] p-6 pb-0 bg-theme'>
            <DialogTitle className="text-dark/60 font-medium py-2">Update</DialogTitle>
            <DialogTrigger id='close'></DialogTrigger>
            <div className='flex items-center justify-between py-2 bg-white rounded-lg px-4 border-2 border-dark/5'>
                <h1 className='w-[90%] font-medium text-xl uppercase text-blue-700'>{newAttributeName}</h1>
                <div id='operations' className='flex items-center justify-between gap-2 w-[10%] py-2'>
                    <svg onClick={() => setOperation((operation) => operation === "add" ? "" : "add")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className={`hover:text-green-600 transition-all size-6 ${updatedValue?.selectedOption ? "opacity-100 cursor-pointer" : "opacity-0"}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>

                    <svg onClick={() => setOperation("update")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer hover:text-blue-600 transition-all">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                    <svg onClick={() => setOperation((operation) => operation === "delete" ? "" : "delete")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer hover:text-red-600 transition-all">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </div>
            </div>
            <div id='replect' className='w-full mb-6 transition-all'>
                {operation === "update" &&
                    <div className='rounded-lg bg-white overflow-hidden py-8 px-4 border-2 border-dark/5'>
                        <div>
                            <p className='pb-2 font-medium text-lg'>Rename</p>
                            <div className={`group cursor-text border-dark/5 focus-within:border-dark/10 border-2 py-1 rounded-md flex items-center justify-center px-2`}>
                                <label htmlFor='newAttributeName' className='p-2 bg-dark/5 rounded-md'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-dark/60 group-hover:text-dark h-full">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                    </svg>
                                </label>
                                <input
                                    id='newAttributeName'
                                    required
                                    type="text"
                                    value={newAttributeName}
                                    onChange={(e) => {
                                        setNewAttributeName(e.target.value)
                                    }}
                                    className="bg-transparent h-full mt-0 w-full outline-none py-3 px-3"
                                    placeholder="e.g my-design"
                                />
                            </div>

                        </div>

                        {selectedAttributeValue?.path && <div>
                            <div className='my-6'>
                                <label className='text-black text-lg font-medium'>Select impacted pages.</label>
                                <div className="grid grid-cols-4 gap-1.5 mb-4">
                                    {Object.keys(pages).map((pageName) => (
                                        <div key={pageName} className={`text-center uppercase text-sm font-medium cursor-pointer relative border-2 ${selectedPages.includes(pageName) ? 'border-zinc-400 bg-green-200' : 'border-transparent bg-blue-50'}`}>
                                            <p className="px-4 py-3" onClick={() => {
                                                if (selectedPages.includes(pageName)) {
                                                    let updatedNewFiles = { ...newFiles }
                                                    const fileName = selectedAttributeValue?.path
                                                    delete updatedNewFiles?.[fileName]?.[pages[pageName]]
                                                    setNewFiles(updatedNewFiles)


                                                    if (fileExistenceStatus[pageName]) {
                                                        setDeleteFilesOfPages([...deleteFilesOfPages, `${pages[pageName]}<<&&>>${selectedAttributeValue?.path}`])
                                                    }

                                                    const tempSelectedPages = selectedPages.filter((page) => page !== pageName)
                                                    setSelectedPages(tempSelectedPages)
                                                    return
                                                }
                                                const tempDeleteFileOfPages = deleteFilesOfPages.filter((path) => path !== `${pages[pageName]}<<&&>>${selectedAttributeValue?.path}`)

                                                setDeleteFilesOfPages(tempDeleteFileOfPages)

                                                setSelectedPages((prev) => [pageName, ...prev])
                                            }}>
                                                {pageName}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className='flex flex-col gap-4'>
                                {selectedPages.map((page) => {
                                    const selectedFile = newFiles?.[selectedAttributeValue?.path]?.[pages[page]] ? newFiles?.[selectedAttributeValue?.path]?.[pages[page]] : null;

                                    return (
                                        <div key={page} className='py-6 bg-yellow-50 px-6 border border-zinc-300'>

                                            <h2 className='font-medium text-black capitalize pb-2'>File for <span className='uppercase'>`{page}`</span> Page</h2>

                                            {selectedFile && <div className='px-4 py-2 rounded-lg bg-blue-200 flex items-center justify-between'>
                                                <p>Selected file : <span className='font-medium text-red-800'>{selectedFile.name}</span> </p>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 hover:text-red-700 cursor-pointer" onClick={() => {
                                                    const updatedFiles = { ...newFiles }
                                                    delete updatedFiles?.[selectedAttributeValue?.path][pages[page]]
                                                    setNewFiles(updatedFiles)
                                                }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </div>}

                                            <div className='grid grid-cols-2 gap-4 pt-1'>
                                                <div className='flex flex-col gap-2'>
                                                    <p className="font-medium text-gray-600">Change File</p>
                                                    <input
                                                        id={page}
                                                        type="file"
                                                        multiple
                                                        accept='.svg,.pdf'
                                                        onChange={(e) => handleFileChange(e, setNewFiles, page)}
                                                        className="hidden"
                                                    />

                                                    <div
                                                        onClick={() => handleClick(page)}
                                                        onDrop={(e) => { handleDrop(e, setNewFiles, page) }}
                                                        onDragOver={handleDragOver}
                                                        className="w-full aspect-square p-4 border-2 border-dashed border-gray-400 cursor-pointer flex items-center justify-center min-h-72"
                                                    >
                                                        <span className='text-sm w-60 mx-auto text-center'>Drag and drop the customization option in SVG format.</span>
                                                    </div>
                                                </div>


                                                {(
                                                    <div className=" flex gap-2 flex-col">
                                                        <p className="font-medium text-gray-600">File Preview</p>
                                                        <div className='aspect-square p-5 bg-design/5 border-2 border-gray-400 w-full overflow-hidden items-center justify-center flex flex-col'>

                                                            {
                                                                selectedFile ? (selectedFile?.type === "application/pdf" ? (
                                                                    <embed src={URL.createObjectURL(selectedFile)} type="application/pdf" width="100%" height="500px" />
                                                                ) : (
                                                                    <img
                                                                        src={URL.createObjectURL(selectedFile)}
                                                                        alt={"base drawing"}
                                                                        className="w-full rounded-xl"
                                                                    />
                                                                )) : (
                                                                    fileExistenceStatus[page] ? <img
                                                                        src={`${baseFilePath}/${pages[page]}/${selectedAttributeValue?.path}.svg`}
                                                                        alt={"base drawing"}
                                                                        className="w-full rounded-xl"
                                                                    /> : (
                                                                        <p>Upload PDF or SVG File.</p>
                                                                    )
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>}
                    </div>
                }
                {operation === "add" &&
                    <div className='rounded-lg bg-white/40 overflow-hidden py-4 px-4 flex flex-col gap-3'>
                        <h1 className=''>Add attribute in <span className='text-red-500'>{menuOf[menuOf.length - 1]}</span></h1>
                        <AddChild updatedValue={updatedValue} setOperation={setOperation} />
                    </div>
                }
                {operation === "delete" &&
                    <div className='rounded-lg bg-red-50 border border-red-400/30 overflow-hidden py-4 px-4 flex flex-col gap-3'>
                        <h1 className=''>This action can not be undone are you sure?</h1>
                        <div className='flex items-center justify-start gap-2'>
                            <button onClick={handleDelete} type='button' className='bg-red-300 font-normal py-1.5 px-4 rounded-full'>Yes</button>
                            <button onClickCapture={() => setOperation("")} type='button' className='bg-white font-normal py-1.5 px-4 rounded-full'>No</button>
                        </div>
                    </div>
                }
            </div>
            <button id='closeButton' onClick={()=>{
                resetStates()
                document.getElementById("close")?.click()
            }} type='button' className='absolute top-3 right-3 shadow-none'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>

            <DialogDescription hidden />
            {
                selectedAttributeValue?.options && <div className="pb-6">
                    <p className='pb-3 font-medium text-lg'>Childs</p>
                    {Object.entries(selectedAttributeValue?.options).map(([option, value]) => {
                        if (option !== "none") {
                            return (
                                <UpdateChild fileCounts={fileCounts} setFileCounts={setFileCounts} key={option} path={[...menuOf, option]} updatedValue={updatedValue} setUpdatedValue={setUpdatedValue} option={option} value={value} />
                            )
                        }
                    })}
                    {Object.keys(updatedValue?.options).length === 0 && <p>You haven&apos;t added nested options yet.</p>}
                </div>

            }
            <div className='text-sm font-medium flex items-center justify-between pt-3 -mx-6 px-6 pb-10'>
                <button onClick={resetStates} type='button' disabled={updateLoading} className='flex items-center justify-center gap-3 bg-green-200 hover:bg-green-300 py-3 px-3 rounded-md  text-dark font-medium relative'>Reset</button>
                <div className='flex items-center justify-end gap-3'>
                    <button type='button' onClick={() => {
                        setNewFiles({})
                        setUpdatedValue(selectedAttributeValue);
                        setNewAttributeName(menuOf[menuOf.length - 1]);
                        document.getElementById('close')?.click()
                    }} disabled={updateLoading} className={`flex items-center justify-center gap-3 hover:bg-zinc-400/30 py-3 px-3 rounded-md  text-dark font-medium relative bg-design`}>Cancel</button>
                    <button disabled={updateLoading} type='submit' className={`flex items-center justify-center gap-3 py-3 px-16 rounded-md text-white font-medium relative ${updateLoading ? "bg-[#6B26DB]/80" : "bg-[#6B26DB]"}`}>Save Changes
                        {
                            updateLoading && <div className='absolute right-4 h-4 w-4 rounded-full bg-transparent border-t-transparent border-[2px] border-white animate-spin' />
                        }
                    </button>
                </div>
            </div>
        </form >
    );
}


export default UpdateForm;