import { DialogDescription, DialogTitle, DialogTrigger } from '@radix-ui/react-alert-dialog';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import { addNewAttributeAPI, addNewParentAttributeAPI } from '../../lib/designAPI';
import { useParams } from 'react-router-dom';
import { handleClick, handleDragOver } from '../../../../utils/dragDrop';
import useStore from '../../../../store/useStore';
import { useState } from 'react';
import DisplayOptions from './DisplayOptions';
import { IStructure } from '../../../../types/types';

interface AddFormProps {
    attributeType: string;
    setOldAttributeFileName: (name: string) => void;
    attributeFileName: string;
    setAttributeFileName: (name: string) => void;
    newAttributeTypes: Array<{
        value: string;
        Description: string;
    }>;
    setAttributeType: (type: string) => void;
    levelOneNest: string;
    setLevelOneNest: (nest: string) => void;
    levelTwoNest: string;
    setLevelTwoNest: (nest: string) => void;
    tempDesignAttributes: Record<string, any>;
    uniqueFileName?: string;
}

interface CustomizationFiles {
    [key: string]: File;
}

const AddForm: React.FC<AddFormProps> = ({
    attributeType,
    setOldAttributeFileName,
    attributeFileName,
    setAttributeFileName,
    newAttributeTypes,
    setAttributeType,
    levelOneNest,
    setLevelOneNest,
    levelTwoNest,
    setLevelTwoNest,
    tempDesignAttributes
}) => {

    const { loading, design, fetchProject, uniqueFileName, generateStructure, setUndoStack, setRedoStack, pages } = useStore();

    const { id } = useParams<{ id: string }>();

    const [addAttributeLoading, setAddAttributeLoading] = useState<boolean>(false);
    const [selectedPages, setSelectedPages] = useState<string[]>(['gad']);
    const [newCustomizationFiles, setNewCustomizationFiles] = useState<CustomizationFiles>({});

    // Function to handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<CustomizationFiles>>, page: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles((prev) => ({
                ...prev,
                [pages[page]]: e.target.files![0]
            }));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, setFile: React.Dispatch<React.SetStateAction<CustomizationFiles>>, page: string) => {
        e.preventDefault();
        if (e.dataTransfer.files[0].type === 'image/svg+xml' || e.dataTransfer.files[0].type === 'application/pdf') {
            setFile((prev) => ({
                ...prev,
                [pages[page]]: e.dataTransfer.files[0]
            }));
        } else {
            toast.error('Please choose a pdf/svg file.');
        }
    };

    // Function to submit the form and create a new design
    const addNewAttribute = async (): Promise<void> => {
        const formData = new FormData();

        setAddAttributeLoading(true);

        if (!loading && design) {
            let structure = generateStructure({
                updatedAttributes: tempDesignAttributes
            }) as IStructure;

            //passing folder, structure, and files in formdata
            formData.append('folder', design.folder);
            formData.append('structure', JSON.stringify(structure));

            for (const [folder, file] of Object.entries(newCustomizationFiles)) {
                const customName = `${folder}<<&&>>${uniqueFileName}${file.name.slice(-4)}`; // Folder path + filename
                formData.append('files', file, customName);
            }
        }

        try {
            if (!id) throw new Error("No design ID found");

            const { data } = await addNewAttributeAPI(id, formData);
            if (data.success) {
                toast.success(data.status);
                setNewCustomizationFiles({});
                setAttributeFileName("");
                fetchProject(id);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to add a customization attribute.');
        }

        setAddAttributeLoading(false);

        const closeButton = document.getElementById("closeButton");
        if (closeButton) {
            closeButton.click();
        }
    };

    // Function to submit the form and create a new design
    const addNewParentAttribute = async (): Promise<void> => {
        let structure = generateStructure({
            updatedAttributes: tempDesignAttributes
        }) as IStructure;

        setAddAttributeLoading(true);

        try {
            if (!id) throw new Error("No design ID found");

            const { data } = await addNewParentAttributeAPI(id, structure);
            if (data.success) {
                toast.success(data.status);
                setNewCustomizationFiles({});
                setAttributeFileName("");
                fetchProject(id);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to add parent attribute.');
        }
        setAddAttributeLoading(false);

        const closeButton = document.getElementById("closeButton");
        if (closeButton) {
            closeButton.click();
        }
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            setUndoStack([]);
            setRedoStack([]);
            if (attributeType === "nestedParentLevel0" || attributeType === "nestedParentLevel1") {
                addNewParentAttribute();
            }
            else {
                if (!newCustomizationFiles || (selectedPages.length !== Object.keys(newCustomizationFiles).length)) {
                    toast.error(`You need to upload ${selectedPages.length} files, but you've only uploaded ${Object.keys(newCustomizationFiles).length}.`);
                    return;
                }
                addNewAttribute();
            }
        }} className='flex flex-col gap-2 min-w-[715px]'
        >
            <DialogTitle className="text-dark font-medium py-2">Add New Customization Option</DialogTitle>
            <DialogTrigger id='closeButton' className='absolute top-3 right-3 shadow-none'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </DialogTrigger>
            <DialogDescription hidden />

            <div className='group flex flex-col gap-4 '>
                <div className='flex items-center justify-between gap-2 bg-white/40 py-2.5 focus-within:bg-white/80 rounded-md px-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 ml-2 text-dark/60 group-hover:text-dark h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                    <input
                        required
                        type="text"
                        value={attributeFileName}
                        onChange={(e) => {
                            setOldAttributeFileName(attributeFileName);
                            setAttributeFileName(e.target.value);
                        }}
                        className="focus:bg-transparent bg-transparent placeholder:text-gray-500 p-2 h-full w-full outline-none mt-0"
                        placeholder="Attribute name"
                    />
                </div>

                <div className='pb-3'>
                    <label className='text-black text-sm font-medium'>Select Attribute type</label>
                    <select
                        required
                        value={attributeType}
                        onChange={(e) => { setAttributeType(e.target.value); }}
                        className="py-3 px-2 bg-white/80 rounded-md border w-full text-sm outline-none"
                    >
                        {newAttributeTypes.map((attType, index) => (
                            <option className='text-sm hover:bg-white ' value={attType.value} key={index}>
                                {index + 1 + ". " + attType.Description}
                            </option>
                        ))}
                    </select>
                </div>

                {attributeType === "nestedChildLevel1" && (
                    <div>
                        <label className='text-black text-sm font-medium'>Select Parent Attribute</label>
                        <select
                            required
                            value={levelOneNest}
                            onChange={(e) => setLevelOneNest(e.target.value)}
                            className="py-3 px-2 bg-white/80 rounded-md border w-full text-sm outline-none"
                        >
                            <option value="" disabled>Select Parent Attribute</option>
                            <DisplayOptions level={0} />
                        </select>
                    </div>
                )}

                {attributeType === "nestedChildLevel2" && (
                    <div>
                        <label className='text-black text-sm font-medium'>Select Parent Attribute</label>
                        <select
                            required
                            value={levelOneNest}
                            onChange={(e) => setLevelOneNest(e.target.value)}
                            className="py-3 px-2 bg-white/80 rounded-md border w-full text-sm outline-none"
                        >
                            <option value="" disabled>Select Parent Attribute</option>
                            <DisplayOptions level={0} isNestedLevel2={true} />
                        </select>
                        {levelOneNest && (
                            <div>
                                <label className='text-black text-sm font-medium'>Select Level 1 Nested Attribute</label>
                                <select
                                    required
                                    value={levelTwoNest}
                                    onChange={(e) => setLevelTwoNest(e.target.value)}
                                    className="py-3 px-2 bg-white/80 rounded-md border w-full text-sm outline-none"
                                >
                                    <option value="" disabled>Select Level 1 Nested Attribute</option>
                                    <DisplayOptions level={1} levelOneNest={levelOneNest} />
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {attributeType === "nestedParentLevel1" && (
                    <div>
                        <label className='text-black text-sm font-medium'>Select Parent Attribute</label>
                        <select
                            value={levelOneNest}
                            onChange={(e) => setLevelOneNest(e.target.value)}
                            className="py-3 px-2 bg-white/80 rounded-md border w-full text-sm outline-none"
                        >
                            <option value="" disabled>Select Parent Attribute</option>
                            <DisplayOptions level={0} />
                        </select>
                    </div>
                )}

                {(attributeType === "nestedParentLevel0" || attributeType === "nestedParentLevel1") ? <div>
                    <span>* No need for any file uploads, add the options inside this attribute.</span>
                </div> :
                    <>
                        <div>
                            <label className='text-black text-sm font-medium'>Select impacted pages.</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {Object.keys(pages).map((pageName) => (
                                    <div key={pageName} className={`text-center uppercase text-sm font-medium cursor-pointer relative border-2 ${selectedPages.includes(pageName) ? 'border-zinc-400 bg-green-200' : 'border-transparent bg-blue-50'}`}>
                                        <p className="px-4 py-3" onClick={() => {
                                            if (selectedPages.includes(pageName)) {
                                                const updatedNewFiles = { ...newCustomizationFiles };
                                                delete updatedNewFiles[pages[pageName]];
                                                setNewCustomizationFiles(updatedNewFiles);

                                                const tempSelectedPages = selectedPages.filter((page) => page !== pageName);
                                                setSelectedPages(tempSelectedPages);
                                                return;
                                            }
                                            setSelectedPages((prev) => [...prev, pageName]);
                                        }}>
                                            {pageName}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='flex flex-col gap-4'>
                            {selectedPages.map((page) => (
                                <div key={page} className='py-6 bg-yellow-50 px-6 border border-zinc-300'>

                                    <h2 className='font-medium text-black capitalize pb-2'>File for <span className='uppercase'>`{page}`</span> Page</h2>

                                    {newCustomizationFiles?.[pages[page]] && <div className='px-4 py-2 rounded-lg bg-blue-200 flex items-center justify-between'>
                                        <p>Selected file : <span className='font-medium text-red-800'>{newCustomizationFiles?.[pages[page]].name}</span> </p>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 hover:text-red-700 cursor-pointer" onClick={() => {
                                            const updatedFiles = { ...newCustomizationFiles };
                                            delete updatedFiles[pages[page]];
                                            setNewCustomizationFiles(updatedFiles);
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
                                                onChange={(e) => handleFileChange(e, setNewCustomizationFiles, page)}
                                                className="hidden"
                                            />

                                            <div
                                                onClick={() => handleClick(page)}
                                                onDrop={(e) => { handleDrop(e, setNewCustomizationFiles, page); }}
                                                onDragOver={handleDragOver}
                                                className="w-full aspect-square p-4 border-2 border-dashed border-gray-400 cursor-pointer flex items-center justify-center min-h-72"
                                            >
                                                <span className='text-sm w-60 mx-auto text-center'>Drag and drop the customization option in SVG format.</span>
                                            </div>
                                        </div>

                                        {(
                                            <div className=" flex gap-2 flex-col">
                                                <p className="font-medium text-gray-600">File Preview</p>
                                                <div className='aspect-square p-5 bg-design/5 border-2 border-dark/5 border-gray-400 w-full overflow-hidden items-center justify-center flex flex-col'>

                                                    {
                                                        newCustomizationFiles?.[pages[page]] ? (newCustomizationFiles?.[pages[page]]?.type === "application/pdf" ? (
                                                            <embed src={URL.createObjectURL(newCustomizationFiles[pages[page]])} type="application/pdf" width="100%" height="500px" />
                                                        ) : (
                                                            <img
                                                                src={URL.createObjectURL(newCustomizationFiles[pages[page]])}
                                                                alt={"base drawing"}
                                                                className="w-full rounded-xl"
                                                            />
                                                        )) : (
                                                            <p>Upload pdf or svg file to preview</p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                }

                {/* select pages you want to have file for */}

            </div>
            <button
                disabled={(attributeType !== "nestedParentLevel0" && attributeType !== "nestedParentLevel1") && selectedPages.length === 0}
                type='submit'
                className='bg-green-200 hover:bg-green-300 py-2 px-3 rounded-full text-dark font-medium mt-4 relative flex items-center justify-center'
            >
                <div>{addAttributeLoading ? "Creating..." : "Create"}</div>
                {addAttributeLoading && <div className='absolute right-4 h-4 w-4 rounded-full border-r-transparent border-2 border-black animate-spin' />}
            </button>
        </form>
    );
};

// Keeping PropTypes for backward compatibility
AddForm.propTypes = {
    attributeType: PropTypes.string.isRequired,
    setOldAttributeFileName: PropTypes.func.isRequired,
    attributeFileName: PropTypes.string.isRequired,
    setAttributeFileName: PropTypes.func.isRequired,
    newAttributeTypes: PropTypes.array.isRequired,
    setAttributeType: PropTypes.func.isRequired,
    levelOneNest: PropTypes.string.isRequired,
    setLevelOneNest: PropTypes.func.isRequired,
    levelTwoNest: PropTypes.string.isRequired,
    setLevelTwoNest: PropTypes.func.isRequired,
    tempDesignAttributes: PropTypes.object,
    uniqueFileName: PropTypes.string
};

export default AddForm;