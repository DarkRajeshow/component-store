import { useCallback, useEffect, useMemo, useState } from 'react';
import { IBaseDrawing, IComponent, INormalComponent } from '@/types/design.types';
import { checkFileExists } from '@/utils/checkFileExists';
import { IComponents, IPages } from '@/types/project.types';
import useAppStore from '@/store/useAppStore';

interface ExistingFiles {
  [path: string]: boolean;
}

interface UseSVGPathsProps {
  fileVersion: string | number;
  pages: IPages;
  components: IComponents
  selectedPage: string;
  baseDrawing: IBaseDrawing | null;
  baseContentPath: string;
}

// http://localhost:8080/api/uploads/projects/7ed67452-9386-42ef-a9cf-a7ad01c60465/edd21e7c-ba62-45c4-9949-5428b064a6bb/75298797-d67a-464c-8d4d-573c0c4d3030
// 

// http://localhost:8080/api/uploads/projects/7ed67452-9386-42ef-a9cf-a7ad01c60465/edd21e7c-ba62-45c4-9949-5428b064a6bb/75298797-d67a-464c-8d4d-573c0c4d3030/f0326e80-b1c7-4d90-aeb0-775a6f094f62.svg

// /uploads/projects/7ed67452-9386-42ef-a9cf-a7ad01c60465/edd21e7c-ba62-45c4-9949-5428b064a6bb/75298797-d67a-464c-8d4d-573c0c4d3030/668ec1dd-bbf2-465b-bb66-0c2494094348.svg
// "http://localhost:8080/api/uploads/projects/7ed67452-9386-42ef-a9cf-a7ad01c60465/edd21e7c-ba62-45c4-9949-5428b064a6bb/e96e43a8-3419-40d9-9627-a084cf84ed1d/f0326e80-b1c7-4d90-aeb0-775a6f094f62.svg?v=1"

export const useSVGPaths = ({
  fileVersion,
  // selectedPage,
  pages,
  components,
  baseDrawing,
  baseContentPath
}: UseSVGPathsProps) => {
  const [existingFiles, setExistingFiles] = useState<ExistingFiles>({});
  const [isBaseDrawingExists, setIsBaseDrawingExists] = useState(false);

  const { selectedPage } = useAppStore()
  // Get SVG path for a specific component
  const getSVGPath = useCallback((value: IComponent | INormalComponent | null): string | null => {
    if (!value) return null;

    const baseFilePath = `${baseContentPath}/${pages[selectedPage]}`;

    // Handle INormalComponent type
    if ('value' in value && 'fileId' in value) {
      return `${baseFilePath}/${value.fileId}.svg?v=${fileVersion}`;
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
        return `${baseFilePath}/${subSubOption.fileId}.svg?v=${fileVersion}`;
      }
    }

    // Handle direct fileId
    const selectedOptionNormalComponent = selectedOption as INormalComponent
    if (selectedOptionNormalComponent.fileId) {
      return `${baseFilePath}/${selectedOptionNormalComponent.fileId}.svg?v=${fileVersion}`;
    }

    return null;
  }, [baseContentPath, fileVersion, pages, selectedPage]);

  // Generate all file paths
  const filePaths = useMemo(() => {
    if (!components) {
      return []
    }
    return Object.values(components)
      .map((value) => getSVGPath(value))
      .filter(Boolean) as string[];
  }, [components, getSVGPath]);

  // Check if files exist
  useEffect(() => {
    const fetchFileExistence = async () => {
      const results: ExistingFiles = {};
      for (const path of filePaths) {
        if (!(path in existingFiles)) {
          results[path] = await checkFileExists(path);
        }
      }
      setExistingFiles((prev) => ({ ...prev, ...results }));
    };

    if (filePaths.length > 0) {
      fetchFileExistence();
    }
  }, [filePaths]);

  // Check if base drawing exists
  useEffect(() => {
    const checkBaseFileExistence = async (path: string) => {
      const result = await checkFileExists(path);
      setIsBaseDrawingExists(result);
    };

    if (baseDrawing?.fileId) {
      checkBaseFileExistence(`${baseContentPath}//${pages[selectedPage]}/${baseDrawing.fileId}.svg`);
    }
  }, [baseDrawing, baseContentPath, pages, selectedPage]);

  return {
    getSVGPath,
    existingFiles,
    isBaseDrawingExists
  };
}; 