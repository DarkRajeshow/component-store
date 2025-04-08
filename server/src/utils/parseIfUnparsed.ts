function parseIfUnparsed(obj: string | object): string | object {
    if (typeof obj === 'string') {
        try {
            // Attempt to parse the string as JSON
            return JSON.parse(obj);
        } catch (e) {
            console.error("Parsing error:", e);
            return obj; // Return the string as is if it cannot be parsed
        }
    } else {
        // If it's already an object, just return it
        return obj;
    }
}

export default parseIfUnparsed;