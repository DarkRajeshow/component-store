
import { memo } from 'react';
import AddChild from './AddChild';
import { IAttribute, IAttributeOption } from '../../../../../types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useUpdateChild } from '@/features/design/hooks/edit-menu/useUpdateChild';
import FileUploader from './FileUploader';
import PageSelector from './PageSelector';
import RenameSection from './RenameSection';
import NestedChildrenSection from './NestedChildrenSection';
import DeleteConfirmation from './DeleteConfirmation';

interface UpdateChildProps {
    parentOption?: string;
    nestedIn?: string;
    setFileCounts: (counts: Record<string, { fileUploads: number; selectedPagesCount: number }>) => void;
    fileCounts: Record<string, { fileUploads: number; selectedPagesCount: number }>;
    setUpdatedValue: (value: any) => void;
    updatedValue: any;
    path: string[];
    option: string;
    value: IAttribute | IAttributeOption;
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
    path
}: UpdateChildProps) => {
    // Use the custom hook to handle all the logic
    const {
        renamedOption,
        operation,
        fileExistenceStatus,
        selectedPages,
        handleFileChange,
        handleDrop,
        handleDelete,
        handleRename,
        togglePageSelection,
        removeFile,
        setOperation,
        baseFilePath,
        pages,
        newFiles,
        shouldRender
    } = useUpdateChild({
        parentOption,
        nestedIn,
        option,
        value,
        setFileCounts,
        setUpdatedValue,
        updatedValue
    });

    // Don't render if this option doesn't exist in the updated value
    if (!shouldRender()) {
        return null;
    }

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
                        {value?.selectedOption && (
                            <Button
                                type='button'
                                variant="ghost"
                                size="icon"
                                onClick={() => setOperation(op => op === "add" ? "" : "add")}
                                title="Add child attribute"
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
                            title="Edit attribute"
                            className={`h-8 w-8 ${operation === "update" ? "bg-blue-100" : ""}`}
                        >
                            <PencilIcon className="h-5 w-5 text-blue-600" />
                        </Button>

                        <Button
                            type='button'
                            variant="ghost"
                            size="icon"
                            onClick={() => setOperation(op => op === "delete" ? "" : "delete")}
                            title="Delete attribute"
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
                                    {(value?.path && option !== "none") && (
                                        <div className="mt-4">
                                            <PageSelector
                                                pages={pages}
                                                selectedPages={selectedPages}
                                                onPageSelect={togglePageSelection}
                                            />

                                            <div className='flex flex-col gap-4'>
                                                {selectedPages.map(page => {
                                                    const valuePath = value.path || "";
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
                                                            baseFilePath={baseFilePath}
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
                            {value?.options && (
                                <NestedChildrenSection
                                    value={value}
                                    option={option}
                                    renamedOption={renamedOption}
                                    updatedValue={updatedValue}
                                    setUpdatedValue={setUpdatedValue}
                                    fileCounts={fileCounts}
                                    setFileCounts={setFileCounts}
                                    path={value.path || ''}
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
                                    Add child attribute in <span className='text-red-500'>{renamedOption}</span>
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