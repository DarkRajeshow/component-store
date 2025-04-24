import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadService } from "../../services/FileUploadService";
import { IProject } from "@/types/project.types";
import { IDesign } from "@/types/design.types";
import { useModel } from "@/contexts/ModelContext";

interface FileUploadSectionProps {
    choosenPage: string;
    tempBaseDrawing: {
        fileId: string;
    } | null;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    tempPages: Record<string, string>;
    fileExistenceStatus: Record<string, boolean>;
    newBaseDrawingFiles: Record<string, File>;
    tempSelectedCategory: string;
    fileVersion: string | number;
    baseFolderPath: string;
    content: IProject | IDesign | null
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
    choosenPage,
    tempBaseDrawing,
    handleFileChange,
    handleDrop,
    tempPages,
    fileExistenceStatus,
    newBaseDrawingFiles,
    tempSelectedCategory,
    fileVersion,
    baseFolderPath,
    content
}) => {

    const { modelType } = useModel();
    // Memoize file preview rendering logic
    const filePreview = useMemo(() => {
        // console.log("Rendering file preview for page:", choosenPage, "with fileId:", tempBaseDrawing?.fileId, "and file existence status:", fileExistenceStatus);

        if (!(tempBaseDrawing?.fileId && fileExistenceStatus[choosenPage]) && !newBaseDrawingFiles?.[tempPages[choosenPage]] || !content) {
            return null;
        }

        if (newBaseDrawingFiles?.[tempPages[choosenPage]]?.type === "application/pdf") {
            return (
                <embed
                    src={URL.createObjectURL(newBaseDrawingFiles[tempPages[choosenPage]])}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                />
            );
        }

        let completeCategoryPath = baseFolderPath;

        if (modelType === "project" && (content as IProject).hierarchy) {
            const project = content as IProject;
            const tempSelectedCategoryId = project.hierarchy.categoryMapping[tempSelectedCategory];
            completeCategoryPath = `${baseFolderPath}/${tempSelectedCategoryId}`
        }
        return (
            <img
                src={newBaseDrawingFiles?.[tempPages[choosenPage]]
                    ? URL.createObjectURL(newBaseDrawingFiles[tempPages[choosenPage]])
                    : `${completeCategoryPath}/${tempPages[choosenPage]}/${tempBaseDrawing?.fileId}.svg?v=${fileVersion}`}
                alt="base drawing"
                className="w-full rounded-xl"
            />
        );
    }, [tempBaseDrawing?.fileId, choosenPage, newBaseDrawingFiles, tempPages, content, fileExistenceStatus, tempSelectedCategory, baseFolderPath, fileVersion, modelType]);

    return (
        <Card className="bg-blue-50 border-none">
            <CardHeader className="px-5 pt-5 pb-2">
                <CardTitle className="text-gray-500 text-sm font-semibold uppercase">Base Drawing for Page `{choosenPage}`</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
                <h3 className="font-medium text-lg mb-2">Upload File</h3>

                {tempBaseDrawing?.fileId === " " && (
                    <p className="text-red-700 font-semibold mb-4">
                        You must upload the base drawing with the above combinations to proceed.
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="font-medium text-gray-600">Select File</p>
                        <input
                            id="baseDrawingInput"
                            type="file"
                            accept=".svg,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div
                            onClick={() => FileUploadService.handleClick('baseDrawingInput')}
                            onDrop={handleDrop}
                            onDragOver={FileUploadService.handleDragOver}
                            className="w-full aspect-square p-4 border-2 border-dashed border-gray-400 cursor-pointer flex items-center justify-center min-h-72"
                        >
                            <span className="text-sm w-60 mx-auto text-center">
                                Drag and drop the customization option in SVG format.
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-col">
                        <p className="font-medium text-gray-600">File Preview</p>
                        <div className="aspect-square p-5 bg-design/5 border-2 border-dark/5 w-full overflow-hidden items-center justify-center flex flex-col">
                            {filePreview}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default React.memo(FileUploadSection);