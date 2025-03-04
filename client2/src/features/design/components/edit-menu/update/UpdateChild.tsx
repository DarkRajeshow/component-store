import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import { handleClick, handleDragOver } from '../../../../../utils/dragDrop';
import filePath from '../../../../../utils/filePath';
import AddChild from './AddChild';
import useStore from '../../../../../store/useStore';
import { checkFileExists } from '../../../../../utils/checkFileExists';
import { useCallback } from 'react';

function UpdateChild({ parentOption = "", nestedIn = "", setUpdatedValue, updatedValue, option, value, fileCounts, setFileCounts }) {
    const { design, newFiles, setNewFiles, pages, loading, filesToDelete, setFilesToDelete, deleteFilesOfPages, setDeleteFilesOfPages } = useStore();

    const [renamedOption, setRenamedOption] = useState(option);
    const [operation, setOperation] = useState("");
    const [fileExistenceStatus, setFileExistenceStatus] = useState({});
    const [selectedPages, setSelectedPages] = useState(['gad']);

    const handleFileChange = (e, setFiles, page) => {
        if (e.target.files[0].type === 'image/svg+xml' || e.target.files[0].type === 'application/pdf') {
            setFiles({
                ...newFiles,
                [value?.path]: {
                    ...newFiles?.[value?.path],
                    [pages[page]]: e.target.files[0]
                },
            });
        }
        else {
            toast.error('Please choose a svg file.');
        }
    };

    const handleDrop = (e, setFiles, page) => {
        e.preventDefault();
        if (e.dataTransfer.files[0].type === 'image/svg+xml' || e.dataTransfer.files[0].type === 'application/pdf') {
            setFiles({
                ...newFiles,
                [value?.path]: {
                    ...newFiles?.[value?.path],
                    [pages[page]]: e.target.files[0]
                },
            });
        }
        else {
            toast.error('Please choose a svg file.');
        }
    };

    const handleDelete = () => {
        // deep copy
        const tempUpdateValue = JSON.parse(JSON.stringify(updatedValue));

        if (parentOption) {
            if (tempUpdateValue.options[parentOption].selectedOption === renamedOption) {
                tempUpdateValue.options[parentOption].selectedOption = " ";
            }

            if (value?.path) {
                setFilesToDelete([...filesToDelete, value?.path])
            }

            delete tempUpdateValue.options[parentOption].options[renamedOption];
        }

        else {
            if (value?.path) {
                setFilesToDelete([...filesToDelete, value?.path])
            }

            else if (value?.options) {
                for (const subValue of Object.values(value?.options)) {
                    if (subValue?.path) {
                        setFilesToDelete([...filesToDelete, subValue?.path])
                    }
                }
            }

            if (tempUpdateValue.selectedOption === renamedOption) {
                tempUpdateValue.selectedOption = "none";
            }

            delete tempUpdateValue.options[renamedOption];
        }
        setUpdatedValue(tempUpdateValue);
    }

    const handleRename = (e) => {
        const newOptionName = e.target.value;
        const tempUpdateValue = JSON.parse(JSON.stringify(updatedValue));

        // Check if the new option name already exists in the parent options
        const optionsToCheck = parentOption
            ? tempUpdateValue.options[parentOption].options
            : tempUpdateValue.options;

        if (optionsToCheck[newOptionName]) {
            toast.error(`Option name "${newOptionName}" already exists! Please choose a different name.`);
            return; // Exit the function to prevent further processing
        }

        // Proceed with renaming the option since it doesn't exist
        if (parentOption) {
            tempUpdateValue.options[parentOption].options[newOptionName] = tempUpdateValue.options[parentOption].options[renamedOption];
            delete tempUpdateValue.options[parentOption].options[renamedOption];

            if (tempUpdateValue.options[parentOption].selectedOption === renamedOption) {
                tempUpdateValue.options[parentOption].selectedOption = newOptionName;
            }
        } else {
            tempUpdateValue.options[newOptionName] = tempUpdateValue.options[renamedOption];
            delete tempUpdateValue.options[renamedOption];

            if (tempUpdateValue.selectedOption === renamedOption) {
                tempUpdateValue.selectedOption = newOptionName;
            }
        }

        setUpdatedValue(tempUpdateValue);
        setRenamedOption(newOptionName);
    };

    const baseFilePath = `${filePath}${design.folder}`;


    useEffect(() => {
        const checkFilesExistence = async () => {
            if (!value?.path) {
                setFileExistenceStatus({});
                return;
            }

            const alreadySelectedPages = [];

            const results = await Promise.all(
                Object.keys(pages).map(async (page) => {
                    const exists = await checkFileExists(`${baseFilePath}/${pages[page]}/${value?.path}.svg`);
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
    }, [loading, pages, baseFilePath, value?.path]);

    const updateFileCount = useCallback(() => {
        if (value?.path) {
            const fileUploadCount = selectedPages.reduce((count, page) => {
                const exists = fileExistenceStatus[page]
                if (exists) {
                    return count + 1
                }
                return count;
            }, 0)

            const newFileUploadCount = newFiles?.[value?.path] ? Object.keys(newFiles?.[value?.path]).length : 0

            setFileCounts((prev) => ({
                ...prev,
                [option]: {
                    fileUploads: (newFileUploadCount + fileUploadCount),
                    selectedPagesCount: Object.keys(selectedPages).length
                }
            }))
        }
    }, [selectedPages, newFiles, value?.path, option, fileExistenceStatus, setFileCounts])

    useEffect(() => {
        updateFileCount()
    }, [updateFileCount])


    if (nestedIn) {
        if (!updatedValue?.options[nestedIn]?.options[renamedOption]) {
            return null;
        }
    }

    else {
        if (!updatedValue?.options[renamedOption]) {
            return null;
        }
    }


    return (
        <div className="w-full">
            <div className={`group flex items-center flex-col justify-between gap-0.5 select-none cursor-pointer w-full`}>
                <div className='flex items-center justify-between py-1 bg-white rounded-lg px-4 border-2 border-dark/5 w-full'>
                    <h1 onClick={() => setOperation((op) => op === "update" ? "" : "update")} className='w-[90%] font-medium uppercase text-green-700'>{renamedOption}</h1>
                    <div id='operations' className='flex items-center justify-between gap-2 w-[10%] py-2'>
                        <svg onClick={() => setOperation((op) => op === "add" ? "" : "add")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className={`hover:text-green-600 transition-all size-6 ${value?.selectedOption ? "opacity-100 cursor-pointer" : "opacity-0"}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>

                        <svg onClick={() => setOperation((op) => op === "update" ? "" : "update")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer hover:text-blue-600 transition-all">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                        <svg onClick={() => setOperation((op) => op === "delete" ? "" : "delete")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer hover:text-red-600 transition-all">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </div>
                </div>
                <div id='replect' className='w-full transition-all'>
                    {operation === "update" &&
                        <div className='pl-3 ml-3 border-l-2 border-dark/10 my-2'>
                            <div className='rounded-lg bg-white overflow-hidden py-4 px-4 border-2 border-dark/5'>
                                <div>
                                    <p className='pb-2 font-medium'>Rename</p>
                                    <div className={`group cursor-text border-dark/5 focus-within:border-dark/10 border-2 py-0.5 rounded-md flex items-center justify-center px-1`}>
                                        <label htmlFor='newAttributeName' className='p-2 bg-dark/5 rounded-md'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-dark/60 group-hover:text-dark h-full">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </label>
                                        <input
                                            id='newAttributeName'
                                            required
                                            type="text"
                                            value={renamedOption}
                                            onChange={handleRename}
                                            className="bg-transparent h-full mt-0 w-full outline-none py-3 px-2"
                                            placeholder="e.g my-design"
                                        />
                                    </div>
                                </div>
                                {(value?.path && option !== "none") && <div>
                                    <div className='my-6'>
                                        <label className='text-black text-lg font-medium'>Select impacted pages.</label>
                                        <div className="grid grid-cols-4 gap-1.5 mb-4">
                                            {Object.keys(pages).map((pageName) => (
                                                <div key={pageName} className={`text-center uppercase text-sm font-medium cursor-pointer relative border-2 ${selectedPages.includes(pageName) ? 'border-zinc-400 bg-green-200' : 'border-transparent bg-blue-50'}`}>
                                                    <p className="px-4 py-3" onClick={() => {
                                                        if (selectedPages.includes(pageName)) {
                                                            let updatedNewFiles = { ...newFiles }
                                                            const fileName = value?.path
                                                            delete updatedNewFiles?.[fileName]?.[pages[pageName]]
                                                            setNewFiles(updatedNewFiles)


                                                            if (fileExistenceStatus[pageName]) {
                                                                setDeleteFilesOfPages([...deleteFilesOfPages, `${pages[pageName]}<<&&>>${value?.path}`])
                                                            }

                                                            const tempSelectedPages = selectedPages.filter((page) => page !== pageName)
                                                            setSelectedPages(tempSelectedPages)
                                                            return
                                                        }
                                                        const tempDeleteFileOfPages = deleteFilesOfPages.filter((path) => path !== `${pages[pageName]}<<&&>>${value?.path}`)

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
                                            const selectedFile = newFiles?.[value?.path]?.[pages[page]] ? newFiles?.[value?.path]?.[pages[page]] : null;

                                            return (
                                                <div key={page} className='py-6 bg-yellow-50 px-6 border border-zinc-300'>

                                                    <h2 className='font-medium text-black capitalize pb-2'>File for <span className='uppercase'>`{page}`</span> Page</h2>

                                                    {selectedFile && <div className='px-4 py-2 rounded-lg bg-blue-200 flex items-center justify-between'>
                                                        <p>Selected file : <span className='font-medium text-red-800'>{selectedFile.name}</span> </p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 hover:text-red-700 cursor-pointer" onClick={() => {
                                                            const updatedFiles = { ...newFiles }
                                                            delete updatedFiles?.[value?.path][pages[page]]
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
                                                                <div className='aspect-square p-5 bg-design/5 border-2 border-dark/5 border-gray-400 w-full overflow-hidden items-center justify-center flex flex-col bg-white'>

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
                                                                                src={`${baseFilePath}/${pages[page]}/${value?.path}.svg`}
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
                            {
                                value?.options &&
                                <div className=" pl-2 py-3">
                                    <p className='pb-2 font-medium text-lg '>Nested Childs</p>
                                    <div className='pl-3 ml-3 border-l-2 border-dark/10 my-2 '>
                                        {Object.entries(value?.options).map(([subOption, subValue]) => (
                                            <UpdateChild setFileCounts={setFileCounts} fileCounts={fileCounts} parentOption={option} nestedIn={renamedOption} key={subOption} updatedValue={updatedValue} setUpdatedValue={setUpdatedValue} option={subOption} value={subValue} />
                                        ))}
                                    </div>
                                </div>
                            }
                        </div>
                    }
                    {operation === "delete" &&
                        <div className='rounded-lg bg-red-50 border-red-300/40 border overflow-hidden py-4 px-4 flex flex-col gap-3'>
                            <h1 className='font-medium'>Are you sure?</h1>
                            <div className='flex items-center justify-start gap-2'>
                                <button onClick={handleDelete} type='button' className='bg-red-300 font-normal py-1.5 px-4 rounded-full'>Yes</button>
                                <button onClickCapture={() => setOperation("")} type='button' className='bg-white font-normal py-1.5 px-4 rounded-full'>No</button>
                            </div>
                        </div>
                    }
                    {operation === "add" &&
                        <div className='rounded-lg bg-white/40 overflow-hidden py-4 px-4 flex flex-col gap-3'>
                            <h1 className=''>Add child attribute in <span className='text-red-500'>{renamedOption}</span></h1>
                            <AddChild updatedValue={updatedValue} nestedIn={option} setOperation={setOperation} />
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

UpdateChild.propTypes = {
    nestedIn: PropTypes.string,
    parentOption: PropTypes.string,
    fileCounts: PropTypes.object,
    setFileCounts: PropTypes.func,
    setUpdatedValue: PropTypes.func.isRequired,
    updatedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
    option: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired
};

export default UpdateChild;