// components/AddChild.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageSelector from "./PageSelector";
import { IAttribute } from "../../../../../types/types";
import { useAddChild } from "@/features/design/hooks/edit-menu/useAddChild";
import OptionTypeSelector from "./OptionTypeSelector";
import FileUploader from "./FileUploader";

interface AddChildProps {
    nestedIn?: string;
    setOperation: React.Dispatch<React.SetStateAction<"" | "update" | "delete" | "add">>;
    updatedValue: {
        options?: {
            [key: string]: IAttribute;
        };
    };
}

const AddChild = React.memo(({ nestedIn = "", setOperation, updatedValue }: AddChildProps) => {
    const {
        optionName,
        isParent,
        isAttributeAlreadyExist,
        selectedPages,
        menuOf,
        handleOptionNameChange,
        handleSetIsParent,
        handlePageSelection,
        handleFileChange,
        handleDrop,
        handleAdd,
        handleCancel,
        pages,
        newFiles,
        uniqueFileName,
        removeFile
    } = useAddChild({ nestedIn, setOperation, updatedValue });

    const isMenuOfLengthOne = menuOf.length === 1;
    const shouldShowParentSelector = !nestedIn && isMenuOfLengthOne;
    const isAddButtonDisabled = isAttributeAlreadyExist || !optionName;
    const addButtonClassName = isAddButtonDisabled ? 'bg-gray-300' : 'bg-green-300/90 hover:bg-green-300';

    return (
        <div id="add" className="w-full">
            <div className="pl-3 ml-3 border-l-2 border-dark/10 my-2">
                {shouldShowParentSelector && (
                    <>
                        <OptionTypeSelector
                            isParent={isParent}
                            setIsParent={handleSetIsParent}
                        />
                        <div className="flex items-center font-medium py-1">
                            <span>
                                <span className="text-red-500">**</span>
                                {isParent
                                    ? `Insert parent option inside the ${menuOf[menuOf.length - 1]}`
                                    : `Insert child option inside the ${menuOf[menuOf.length - 1]}`
                                }
                            </span>
                        </div>
                    </>
                )}

                <Card className="border-2 border-dark/5">
                    <CardContent className="pt-6">
                        <div>
                            <p className="pb-2 font-medium">Name</p>
                            <div className="group border-dark/5 focus-within:border-dark/10 border-2 py-0.5 rounded-md flex items-center justify-center px-1">
                                <label htmlFor="newAttributeName" className="p-2 bg-dark/5 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-dark/60 group-hover:text-dark h-full">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                    </svg>
                                </label>
                                <Input
                                    id="newAttributeName"
                                    required
                                    type="text"
                                    value={optionName}
                                    onChange={handleOptionNameChange}
                                    className="bg-transparent h-full mt-0 w-full outline-none py-3 px-2 border-none shadow-none"
                                    placeholder="e.g my-design"
                                />
                            </div>
                        </div>

                        {isParent ? (
                            <div className="flex items-center font-medium pt-2 justify-end gap-1">
                                <span>- No need for any file uploads </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-blue-700 cursor-pointer">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                </svg>
                            </div>
                        ) : (
                            <div className="flex gap-2 w-full h-full items-center justify-between px-2 pt-8">
                                <div className="w-full">
                                    <p className="pb-3 font-medium text-lg">Upload File</p>

                                    <PageSelector
                                        pages={pages}
                                        selectedPages={selectedPages}
                                        onPageSelect={handlePageSelection}
                                    />

                                    <div className="flex flex-col gap-4 mt-6">
                                        {selectedPages.map((page) => {
                                            const pagePath = pages[page];
                                            const selectedFile = (uniqueFileName && newFiles?.[uniqueFileName]?.[pagePath]) ? newFiles[uniqueFileName]?.[pagePath] as File : null;

                                            return (
                                                <FileUploader
                                                    key={page}
                                                    pagePath={pages[page]}
                                                    page={page}
                                                    handleFileChange={handleFileChange}
                                                    handleDrop={handleDrop}
                                                    selectedFile={selectedFile}
                                                    removeFile={removeFile}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 text-sm pt-10">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant="outline"
                                className="hover:bg-zinc-400/30 bg-design"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                disabled={isAddButtonDisabled}
                                onClick={handleAdd}
                                className={`${addButtonClassName}`}
                            >
                                Add {isParent ? "Parent" : ""} Option
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});

export default AddChild;