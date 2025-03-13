import { toast } from "sonner";
import { NewBaseDrawingFiles, Pages } from "../../types";

// FileUploadService.ts - Service for handling file operations
export const FileUploadService = {
    validateFileType(file: File): boolean {
        return file.type === 'image/svg+xml' || file.type === 'application/pdf';
    },

    handleDrop(
        e: React.DragEvent<HTMLDivElement>,
        newBaseDrawingFiles: NewBaseDrawingFiles,
        choosenPage: string,
        tempPages: Pages,
        setNewBaseDrawingFiles: React.Dispatch<React.SetStateAction<NewBaseDrawingFiles>>
    ): void {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (this.validateFileType(file)) {
                setNewBaseDrawingFiles({
                    ...newBaseDrawingFiles,
                    [tempPages[choosenPage]]: file,
                });
            } else {
                toast.error('Please choose a pdf/svg file.');
            }
        }
    },

    handleClick(inputId: string): void {
        document.getElementById(inputId)?.click();
    },

    handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
    },
};
