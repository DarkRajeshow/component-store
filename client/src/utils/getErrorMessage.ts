import axios from "axios";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        // Try to extract a message from the error response data
        const data = error.response?.data;
        if (data && typeof data === "object" && "message" in data && typeof (data as any).message === "string") {
            return (data as any).message;
        }
    }
    return 'Something went wrong';
}

export default getErrorMessage;