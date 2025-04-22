
import { memo, useEffect } from 'react';
import AddChild from './AddChild';
import { IComponent, IFileInfo, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from '@/types/project.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import FileUploader from './FileUploader';
import PageSelector from './PageSelector';
import RenameSection from './RenameSection';
import NestedChildrenSection from './NestedChildrenSection';
import DeleteConfirmation from './DeleteConfirmation';
import { useUpdateChild } from '@/features/editor/hooks/edit-menu/useUpdateChild';

interface UpdateChildProps {
    parentOption?: string;
    nestedIn?: string;
    setFileCounts: (counts: Record<string, { fileUploads: number; selectedPagesCount: number }>) => void;
    fileCounts: Record<string, { fileUploads: number; selectedPagesCount: number }>;
    setUpdatedValue: (value: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null) => void;
    updatedValue: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
    // path: string[];
    option: string;
    value: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
}

// Main UpdateChild component
const UpdateChild = memo(({
    parentOption = "",
    nestedIn = "",
    setFileCounts,
    fileCounts,
    setUpdatedValue,
    updatedValue,
    option,
    value,
    // path
}: UpdateChildProps) => {
    // Use the custom hook to handle all the logic
    const {
        renamedOption,
        operation,
        fileExistenceStatus,
        selectedPages,
        baseContentPath,
        pages,
        newFiles,
        handleFileChange,
        handleDrop,
        handleDelete,
        handleRename,
        togglePageSelection,
        removeFile,
        setOperation,
        shouldRender
    } = useUpdateChild({
        parentOption,
        nestedIn,
        option,
        value,
        updatedValue,
        setFileCounts,
        setUpdatedValue,
    });

    useEffect(() => {
        console.log(newFiles);
        
    }, [newFiles]);

    // Don't render if this option doesn't exist in the updated value
    if (!shouldRender()) {
        return null;
    }


    console.log(value);
    

    return (
        <div className="w-full mb-3">
            <div className="group flex items-center flex-col justify-between gap-0.5 select-none w-full">
                {/* Option header */}
                <div className='flex items-center justify-between py-2 bg-white rounded-lg px-4 border-2 border-dark/5 w-full hover:border-dark/10 transition-colors'>
                    <h1
                        onClick={() => setOperation(op => op === "update" ? "" : "update")}
                        className='w-[90%] font-medium uppercase text-green-700 cursor-pointer'
                    >
                        {renamedOption}
                    </h1>
                    <div className='flex items-center gap-3'>
                        {(value as IComponent)?.selected && (
                            <Button
                                type='button'
                                variant="ghost"
                                size="icon"
                                onClick={() => setOperation(op => op === "add" ? "" : "add")}
                                title="Add child component"
                                className={`h-8 w-8 ${operation === "add" ? "bg-green-100" : ""}`}
                            >
                                <PlusIcon className="h-5 w-5 text-green-600" />
                            </Button>
                        )}

                        <Button
                            type='button'
                            variant="ghost"
                            size="icon"
                            onClick={() => setOperation(op => op === "update" ? "" : "update")}
                            title="Edit component"
                            className={`h-8 w-8 ${operation === "update" ? "bg-blue-100" : ""}`}
                        >
                            <PencilIcon className="h-5 w-5 text-blue-600" />
                        </Button>

                        <Button
                            type='button'
                            variant="ghost"
                            size="icon"
                            onClick={() => setOperation(op => op === "delete" ? "" : "delete")}
                            title="Delete component"
                            className={`h-8 w-8 ${operation === "delete" ? "bg-red-100" : ""}`}
                        >
                            <Trash2Icon className="h-5 w-5 text-red-600" />
                        </Button>
                    </div>
                </div>

                {/* Content section - only shown when an operation is selected */}
                <div className='w-full transition-all'>
                    {operation === "update" && (
                        <div className='pl-3 ml-3 border-l-2 border-dark/10 my-2'>
                            <Card className="overflow-hidden">
                                <CardContent className="p-4">
                                    <RenameSection renamedOption={renamedOption} handleRename={handleRename} />
                                    {/* File upload section - only shown for options with a path */}
                                    {/* <p>{(value as IFileInfo)?.fileId ? "Sdf": "SDf2"}</p> */}
                                    {((value as IFileInfo)?.fileId && option !== "none") && (
                                        <div className="mt-4">
                                            <PageSelector
                                                pages={pages}
                                                selectedPages={selectedPages}
                                                onPageSelect={togglePageSelection}
                                            />

                                            <div className='flex flex-col gap-4'>
                                                {selectedPages.map(page => {
                                                    const valuePath = (value as IFileInfo).fileId || "";
                                                    const pagePath = pages[page];
                                                    const selectedFile = valuePath && newFiles?.[valuePath]?.[pagePath]
                                                        ? newFiles[valuePath][pagePath]
                                                        : null;

                                                    return (
                                                        <FileUploader
                                                            key={page}
                                                            pagePath={pagePath}
                                                            page={page}
                                                            handleFileChange={handleFileChange}
                                                            handleDrop={handleDrop}
                                                            selectedFile={selectedFile}
                                                            fileExists={fileExistenceStatus[page]}
                                                            baseContentPath={baseContentPath}
                                                            valuePath={valuePath}
                                                            removeFile={removeFile}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Nested children section */}
                            {(value as IComponent)?.options && (
                                <NestedChildrenSection
                                    value={value}
                                    option={option}
                                    renamedOption={renamedOption}
                                    updatedValue={updatedValue}
                                    setUpdatedValue={setUpdatedValue}
                                    fileCounts={fileCounts}
                                    setFileCounts={setFileCounts}
                                />
                            )}
                        </div>
                    )}

                    {/* Delete confirmation */}
                    {operation === "delete" && (
                        <DeleteConfirmation
                            onDelete={handleDelete}
                            onCancel={() => setOperation("")}
                        />
                    )}

                    {/* Add child section */}
                    {operation === "add" && (
                        <Card className="bg-white/40">
                            <CardContent className="py-4 px-4 flex flex-col gap-3">
                                <h1>
                                    Add child component in <span className='text-red-500'>{renamedOption}</span>
                                </h1>
                                <AddChild
                                    updatedValue={updatedValue}
                                    nestedIn={option}
                                    setOperation={setOperation}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
});

UpdateChild.displayName = 'UpdateChild';


export default UpdateChild;