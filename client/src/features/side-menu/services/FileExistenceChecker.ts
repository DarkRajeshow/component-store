import { IFileInfo, IPages } from "@/types/project.types";
import { FileExistenceStatus, NewBaseDrawingFiles } from "../types/sideMenuTypes";
import { SideMenuService } from "./SideMenuService";

// FileExistenceChecker.ts - A dedicated service for checking file existence
export const FileExistenceChecker = {
    async checkAllFiles(
        tempPages: IPages,
        baseContentPath: string,
        tempBaseDrawing: IFileInfo | null,
        fileVersion: number
    ): Promise<FileExistenceStatus> {
        if (!tempPages || Object.keys(tempPages).length === 0) {
            return {};
        }

        try {

            const results = await Promise.all(
                Object.entries(tempPages).map(async ([pageFolder]) => {
                    const exists = await SideMenuService.checkFileExists(
                        `${baseContentPath}//${tempPages[pageFolder]}/${tempBaseDrawing?.fileId}.svg?version=${fileVersion}`
                    );
                    return { [pageFolder]: exists };
                })
            );

            // http://localhost:8080/api/uploads/projects/7ed67452-9386-42ef-a9cf-a7ad01c60465edd21e7c-ba62-45c4-9949-5428b064a6bb/e96e43a8-3419-40d9-9627-a084cf84ed1d/668ec1dd-bbf2-465b-bb66-0c2494094348.svg


            // Convert array of objects to a single object with pageFolder as keys
            return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        } catch (error) {
            console.error('Error checking file existence:', error);
            return {};
        }
    },

    areAllFilesUploaded(
        tempPages: IPages,
        fileExistenceStatus: FileExistenceStatus,
        newBaseDrawingFiles: NewBaseDrawingFiles
    ): boolean {
        const fileUploadCount = Object.keys(tempPages).reduce((count, page) => {
            const exists = fileExistenceStatus[page];
            if (exists) {
                return count + 1;
            }
            return count;
        }, 0);

        const newFileUploadCount = newBaseDrawingFiles ? Object.keys(newBaseDrawingFiles).length : 0;

        return fileUploadCount + newFileUploadCount >= Object.keys(tempPages).length;
    },

    shouldShowPopup(fileExistenceStatus: FileExistenceStatus): boolean {
        return Object.values(fileExistenceStatus).some((exists) => !exists);
    },

    allowedToClose(
        currentBaseDrawingFileExistanceStatus: FileExistenceStatus,
        baseDrawing: IFileInfo | null,
        pages: IPages
    ): boolean {
        return (
            // tempBaseDrawing?.fileId !== " " &&
            baseDrawing?.fileId !== " " &&
            !Object.keys(pages).some((page) => !currentBaseDrawingFileExistanceStatus?.[page])
            // !Object.keys(tempPages).some((page) => !fileExistenceStatus?.[page]) &&
        );
    },
};