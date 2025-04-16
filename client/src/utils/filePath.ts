const filePath: string = (import.meta.env.VITE_REACT_APP_SERVER_URL ? import.meta.env.VITE_REACT_APP_SERVER_URL : "") + "/api/uploads";
export default filePath;