import filePath from "../../../utils/filePath";
import { Link } from "react-router-dom";
import useAppStore from "../../../store/useAppStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { checkFileExists } from "../../../utils/checkFileExists";
import { IDesign, IMountingType, ISmileyType } from "../../../types/request.types";

interface DesignCardProps {
    design: IDesign;
}

interface ExistingFiles {
    [key: string]: boolean;
}

interface DesignInfo {
    type?: string;
    size?: string;
}

type CustomizationOptions = Partial<IMountingType | ISmileyType>;

function DesignCard({ design }: DesignCardProps) {
    const { RecentDesignLoading, fileVersion } = useAppStore();
    const [existingFiles, setExistingFiles] = useState<ExistingFiles>({});
    const designType = design?.designType;
    const selectedCategory = design?.selectedCategory;

    const customizationOptions = useMemo<CustomizationOptions>(() => {
        if (!design?.structure || !selectedCategory) return {};
        
        return designType === "motor"
            ? design.structure.mountingTypes?.[selectedCategory] || {}
            : designType === "smiley"
                ? design.structure.sizes?.[selectedCategory] || {}
                : {};
    }, [designType, selectedCategory, design?.structure]);

    const designInfo = useMemo<DesignInfo>(() => (
        designType === "motor"
            ? {
                type: design?.designInfo?.typeOfMotor,
                size: design?.designInfo?.frameSize,
            }
            : designType === "smiley"
                ? {
                    type: design?.designInfo?.shapeOfSmile,
                }
                : {}
    ), [design?.designInfo, designType]);

    const getSVGPath = useCallback((value: any, page: string): string | null => {
        if (!value || typeof value !== 'object' || !customizationOptions.pages?.[page]) return null;

        const baseFilePath = `${filePath}/${design.folder}/${customizationOptions.pages[page]}`;

        if (value.value && value.fileId) {
            return `${baseFilePath}/${value.fileId}.svg?v=${fileVersion}`;
        }

        const subOption = value.selected;
        const subSubOption = value.options?.[subOption]?.selected;

        if (subSubOption && subSubOption.trim() !== "") {
            return `${baseFilePath}/${value.options[subOption]?.options?.[subSubOption]?.fileId}.svg?v=${fileVersion}`;
        }

        if (subOption && value.options?.[subOption]?.fileId) {
            return `${baseFilePath}/${value.options[subOption]?.fileId}.svg?v=${fileVersion}`;
        }

        return null;
    }, [design.folder, fileVersion, customizationOptions.pages]);

    const filePaths = useMemo<string[]>(() => {
        if (!customizationOptions?.pages || !customizationOptions?.components) {
            return [];
        }

        const allPaths: string[] = [];

        Object.keys(customizationOptions.pages).forEach((page) => {
            const paths = Object.values(customizationOptions.components || {})
                .map((value) => getSVGPath(value, page))
                .filter((path): path is string => Boolean(path));

            allPaths.push(...fileIds);
        });

        return allPaths;
    }, [customizationOptions, getSVGPath]);

    useEffect(() => {
        const fetchFileExistence = async () => {
            const results: ExistingFiles = {};

            for (const path of filePaths) {
                if (!existingFiles[path]) {
                    const exists = await checkFileExists(path);
                    results[path] = exists;
                }
            }

            if (Object.keys(results).length > 0) {
                setExistingFiles((prev) => ({ ...prev, ...results }));
            }
        };

        if (filePaths.length > 0) {
            fetchFileExistence();
        }
    }, [filePaths, existingFiles]);

    if (!design) return null;

    return (
        <Link to={`/designs/${design._id}`} className="w-full overflow-x-auto p-6 bg-white">
            <div className="flex items-center relative justify-between pb-3 font-medium text-sm uppercase">
                <p>{designInfo?.type}</p>
                <div className="flex gap-2">
                    <p>Frame Size : {designInfo?.size}</p>
                    <p className="h-5 w-5 flex items-center justify-center bg-red-300 rounded-full">{design.code}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 overflow-x-auto gap-1">
                {RecentDesignLoading && (
                    <div className="w-full ">
                        <div className="h-6 w-6 my-auto border-dark border-2 border-b-transparent animate-spin rounded-full" />
                    </div>
                )}

                {!RecentDesignLoading && customizationOptions?.pages && Object.keys(customizationOptions.pages).map((page) => (
                    <div key={page} className="bg-white border-dark/10 border-2 p-2 mb-2">
                        <h1 className="uppercase font-medium text-sm p-3">{page}</h1>
                        <svg
                            className="components relative p-2 border-dark/10 border-2"
                            viewBox="0 0 340 340"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {customizationOptions.baseDrawing?.fileId && customizationOptions.pages && (
                                <image
                                    x="0"
                                    y="0"
                                    width="340"
                                    height="340"
                                    href={`${filePath}/${design.folder}/${customizationOptions.pages[page]}/${customizationOptions.baseDrawing.fileId}.svg?v=${fileVersion}`}
                                />
                            )}

                            {customizationOptions.components &&
                                Object.entries(customizationOptions.components).map(([component, value]) => {
                                    const svgPath = getSVGPath(value, page);
                                    return (
                                        (svgPath && existingFiles[svgPath]) && (
                                            <image
                                                key={component}
                                                href={svgPath}
                                                x="0"
                                                y="0"
                                                width="340"
                                                height="340"
                                            />
                                        )
                                    );
                                })}
                        </svg>
                    </div>
                ))}
            </div>
        </Link>
    );
}

export default DesignCard;
