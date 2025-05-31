import filePath from "../../../utils/filePath";
import { Link } from "react-router-dom";
import useAppStore from "../../../store/useAppStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { checkFileExists } from "../../../utils/checkFileExists";
import { IComponent, INormalComponent } from "@/types/project.types";
import { IDesign } from "@/types/design.types";


interface DesignCardProps {
    design: IDesign;
}

interface ExistingFiles {
    [key: string]: boolean;
}

function DesignCard({ design }: DesignCardProps) {
    const { recentDesignLoading, fileVersion } = useAppStore();
    const [existingFiles, setExistingFiles] = useState<ExistingFiles>({});

    // const getSVGPath = useCallback((value: IComponent | INormalComponent | INestedParentLevel1, page: string): string | null => {
    //     if (!value || typeof value !== 'object' || !design.structure.pages?.[page]) return null;

    //     const baseFilePath = `${filePath}/${design.folder}/${design.structure.pages[page]}`;

    //     if (((value as INormalComponent).value) && (value as INormalComponent).fileId) {
    //         return `${baseFilePath}/${(value as INormalComponent).fileId}.svg?v=${fileVersion}`;
    //     }

    //     const subOption = (value as IComponent).selected;
    //     const subSubOption = ((value as IComponent).options?.[subOption] as INestedParentLevel1)?.selected;

    //     if (subSubOption && subSubOption.trim() !== "") {
    //         return `${baseFilePath}/${((value as IComponent).options[subOption] as INestedParentLevel1)?.options?.[subSubOption]?.fileId}.svg?v=${fileVersion}`;
    //     }

    //     if (subOption && ((value as IComponent).options?.[subOption] as INestedChildLevel1)?.fileId) {
    //         return `${baseFilePath}/${((value as IComponent).options[subOption] as INestedChildLevel1)?.fileId}.svg?v=${fileVersion}`;
    //     }

    //     return null;
    // }, [design.folder, fileVersion, design.structure.pages]);
    const completeFilePath = `${filePath}/projects/${design.folder}/${design.categoryId}`

    const getSVGPath = useCallback((value: IComponent | INormalComponent | null, page: string): string | null => {
        if (!value) return null;
        const baseFilePath = `${completeFilePath}/${design.structure.pages[page]}`;

        // Handle INormalComponent type
        if ('value' in value && 'fileId' in value) {
            return `${baseFilePath}/${value.fileId}.svg`;
        }

        // Handle IComponent type
        const component = value as IComponent;
        if (component.selected === 'none') {
            return null;
        }

        const subOption = component.selected;
        if (!subOption || !component.options) return null;

        const selectedOption = component.options[subOption];
        if (!selectedOption) return null;

        const selectedOptionComponent = selectedOption as IComponent
        // Handle nested options
        if (selectedOptionComponent.options && selectedOptionComponent.selected && selectedOptionComponent.selected !== " ") {
            const subSubOption = selectedOptionComponent.options[selectedOptionComponent.selected] as INormalComponent;
            if (subSubOption?.fileId) {
                return `${baseFilePath}/${subSubOption.fileId}.svg`;
            }
        }

        // Handle direct fileId
        const selectedOptionNormalComponent = selectedOption as INormalComponent
        if (selectedOptionNormalComponent.fileId) {
            return `${baseFilePath}/${selectedOptionNormalComponent.fileId}.svg`;
        }

        return null;
    }, [design.categoryId, design.structure.pages, design.folder]);


    const filePaths = useMemo<string[]>(() => {
        if (!design.structure?.pages || !design.structure?.components) {
            return [];
        }

        const allPaths: string[] = [];

        Object.keys(design.structure.pages).forEach((page) => {
            const paths = Object.values(design.structure.components || {})
                .map((value) => getSVGPath(value, page))
                .filter((path): path is string => Boolean(path));

            allPaths.push(...paths);
        });

        return allPaths;
    }, [design.structure, getSVGPath]);

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
                <p>{design.type}</p>
                <div className="flex gap-2">
                    <p>code: {design.code}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 overflow-x-auto gap-1">
                {recentDesignLoading && (
                    <div className="w-full ">
                        <div className="h-6 w-6 my-auto border-dark border-2 border-b-transparent animate-spin rounded-full" />
                    </div>
                )}

                {!recentDesignLoading && design.structure?.pages && Object.keys(design.structure.pages).map((page) => (
                    <div key={page} className="bg-white border-dark/10 border-2 p-2 mb-2">
                        <h1 className="uppercase font-medium text-sm p-3">{page}</h1>
                        <svg
                            className="components relative p-2 border-dark/10 border-2"
                            viewBox="0 0 340 340"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {design.structure.baseDrawing?.fileId && design.structure.pages && (
                                <image
                                    x="0"
                                    y="0"
                                    width="340"
                                    height="340"
                                    href={`${completeFilePath}/${design.structure.pages[page]}/${design.structure.baseDrawing.fileId}.svg?v=${fileVersion}`}
                                />
                            )}

                            {design.structure.components &&
                                Object.entries(design.structure.components).map(([component, value]) => {
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
