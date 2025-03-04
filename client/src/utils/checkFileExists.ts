export function checkFileExists(imageSrc: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            resolve(true); // Resolve true if the image loads successfully
        };

        img.onerror = () => {
            resolve(false); // Resolve false if there's an error loading the image
        };

        // Set the src after defining the event handlers to avoid any race conditions
        img.src = imageSrc;
    });
}