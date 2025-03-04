// dragDrop.ts
import { toast } from "sonner";

export const handleDrop = (e: DragEvent, setFile: (file: File) => void): void => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];

    if (file && (file.type === 'image/svg+xml' || file.type === 'application/pdf')) {
        setFile(file);
    } else {
        toast.error('Please choose a svg file.');
    }
};

export const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
};

export const handleClick = (inputId: string): void => {
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
        inputElement.click();
    }
};