import { useState, useEffect } from "react";
import { checkFileExists } from "../../../utils/checkFileExists";

export const useSideMenu = ({ baseDrawing, selectedCategory, pages, design, filePath }) => {
    const [sideMenuType, setSideMenuType] = useState("");
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory);
    const [tempBaseDrawing, setTempBaseDrawing] = useState(baseDrawing);
    const [tempPages, setTempPages] = useState(pages || {});
    const [saveLoading, setSaveLoading] = useState(false);
    const [newBaseDrawingFiles, setNewBaseDrawingFiles] = useState({});
    const [fileExistenceStatus, setFileExistenceStatus] = useState({});
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [choosenPage, setChoosenPage] = useState(Object.keys(pages)[0] || "gad");
    const [openPageDeleteWarning, setOpenPageDeleteWarning] = useState("");

    const baseFilePath = `${filePath}${design.folder}`;

    useEffect(() => setTempBaseDrawing(baseDrawing), [baseDrawing]);
    useEffect(() => setTempSelectedCategory(selectedCategory), [selectedCategory]);
    useEffect(() => {
        setTempPages(pages);
        setChoosenPage(Object.keys(pages)[Object.keys(pages).length - 1] || "gad");
    }, [pages]);

    useEffect(() => {
        const checkFilesExistence = async () => {
            const results = await Promise.all(
                Object.entries(tempPages).map(async ([pageFolder]) => {
                    const exists = await checkFileExists(`${baseFilePath}/${tempPages[pageFolder]}/${tempBaseDrawing?.path}.svg`);
                    return { [pageFolder]: exists };
                })
            );
            const statusObject = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
            setFileExistenceStatus(statusObject);
            if (Object.values(statusObject).some((exists) => !exists)) {
                setIsPopUpOpen(true);
            }
        };

        checkFilesExistence();
    }, [tempBaseDrawing, tempPages, baseFilePath]);

    useEffect(() => setNewBaseDrawingFiles({}), [tempSelectedCategory]);

    return {
        sideMenuType,
        setSideMenuType,
        tempSelectedCategory,
        setTempSelectedCategory,
        tempBaseDrawing,
        setTempBaseDrawing,
        tempPages,
        setTempPages,
        saveLoading,
        setSaveLoading,
        newBaseDrawingFiles,
        setNewBaseDrawingFiles,
        fileExistenceStatus,
        setFileExistenceStatus,
        isPopUpOpen,
        setIsPopUpOpen,
        choosenPage,
        setChoosenPage,
        openPageDeleteWarning,
        setOpenPageDeleteWarning,
    };
};
