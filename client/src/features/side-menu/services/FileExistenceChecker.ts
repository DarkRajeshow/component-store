import { BaseDrawing, FileExistenceStatus, NewBaseDrawingFiles, Pages } from "../types/sideMenuTypes";
import { SideMenuService } from "./SideMenuService";

// FileExistenceChecker.ts - A dedicated service for checking file existence
export const FileExistenceChecker = {
    async checkAllFiles(
        tempPages: Pages,
        baseFilePath: string,
        tempBaseDrawing: BaseDrawing
    ): Promise<FileExistenceStatus> {
        if (Object.keys(tempPages).length === 0) {
            return {};
        }

        try {
            const results = await Promise.all(
                Object.entries(tempPages).map(async ([pageFolder]) => {
                    const exists = await SideMenuService.checkFileExists(
                        `${baseFilePath}/${tempPages[pageFolder]}/${tempBaseDrawing?.path}.svg`
                    );
                    return { [pageFolder]: exists };
                })
            );

            // Convert array of objects to a single object with pageFolder as keys
            return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        } catch (error) {
            console.error('Error checking file existence:', error);
            return {};
        }
    },

    areAllFilesUploaded(
        tempPages: Pages,
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
        baseDrawing: BaseDrawing,
        pages: Pages
    ): boolean {

        console.log(pages);
        
        return (
            // tempBaseDrawing?.fileId !== " " &&
            baseDrawing?.fileId !== " " &&
            !Object.keys(pages).some((page) => !currentBaseDrawingFileExistanceStatus?.[page])
            // !Object.keys(tempPages).some((page) => !fileExistenceStatus?.[page]) &&
        );
    },
};