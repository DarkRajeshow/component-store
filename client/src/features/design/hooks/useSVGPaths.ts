import { useCallback, useEffect, useMemo, useState } from 'react';
import { IAttribute, IDesign } from '../../../types/types';
import { checkFileExists } from '../../../utils/checkFileExists';
import filePath from '../../../utils/filePath';
import { ExistingFiles } from '../components/view/types';

interface BaseDrawing {
  path: string;
}

interface UseSVGPathsProps {
  design: IDesign;
  designAttributes: Record<string, IAttribute>;
  fileVersion: string | number;
  pages: Record<string, string>;
  selectedPage: string;
  baseDrawing: BaseDrawing | null;
}

export const useSVGPaths = ({
  design,
  designAttributes,
  fileVersion,
  pages,
  selectedPage,
  baseDrawing
}: UseSVGPathsProps) => {
  const [existingFiles, setExistingFiles] = useState<ExistingFiles>({});
  const [isBaseDrawingExists, setIsBaseDrawingExists] = useState(false);

  // Get SVG path for a specific attribute
  const getSVGPath = useCallback((value: IAttribute | null): string | null => {
    if (!value || typeof value !== 'object') return null;

    const baseFilePath = `${filePath}${design.folder}/${pages[selectedPage]}`;

    if (value.value && value.path) {
      return `${baseFilePath}/${value.path}.svg?v=${fileVersion}`;
    }

    if (value.selectedOption === 'none') {
      return null;
    }

    const subOption = value.selectedOption;
    if (!subOption || !value.options) return null;
    
    const subSubOption = value.options[subOption]?.selectedOption;

    if (subSubOption && subSubOption !== " " && value.options[subOption]?.options) {
      return `${baseFilePath}/${value.options[subOption].options?.[subSubOption]?.path}.svg?v=${fileVersion}`;
    }

    if (subOption && value.options[subOption]?.path) {
      return `${baseFilePath}/${value.options[subOption].path}.svg?v=${fileVersion}`;
    }

    return null;
  }, [design.folder, fileVersion, pages, selectedPage]);

  // Generate all file paths
  const filePaths = useMemo(() => {
    return Object.values(designAttributes)
      .map((value) => getSVGPath(value))
      .filter(Boolean) as string[];
  }, [designAttributes, getSVGPath]);

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
  }, [filePaths, existingFiles]);

  // Check if base drawing exists
  useEffect(() => {
    const checkBaseFileExistence = async (path: string) => {
      const result = await checkFileExists(path);
      setIsBaseDrawingExists(result);
    };
    
    if (baseDrawing?.path) {
      checkBaseFileExistence(`${filePath}${design.folder}/${pages[selectedPage]}/${baseDrawing.path}.svg`);
    }
  }, [baseDrawing, design.folder, pages, selectedPage]);

  return {
    getSVGPath,
    existingFiles,
    isBaseDrawingExists
  };
}; 