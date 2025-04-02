import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateDesignAttributesAPI, deleteDesignAttributesAPI } from '../../lib/designAPI';
import useStore from '../../../../store/useStore';
import { checkFileExists } from '../../../../utils/checkFileExists';
import filePath from '../../../../utils/filePath';
import { IStructure, IAttribute, IAttributeOption } from '../../../../types/types';

interface FileCountInfo {
  fileUploads: number;
  selectedPagesCount: number;
}

interface FileExistenceStatus {
  [key: string]: boolean;
}

interface NewFiles {
  [key: string]: {
    [key: string]: File;
  };
}

interface FileCounts {
  [key: string]: FileCountInfo;
}

interface AttributeValue {
  options?: {
    [key: string]: IAttribute | IAttributeOption;
  };
  [key: string]: any;
}

interface UseUpdateFormProps {
  id: string | undefined;
}

export const useUpdateForm = ({ id }: UseUpdateFormProps) => {
  const {
    design,
    menuOf,
    designAttributes,
    setDesignAttributes,
    incrementFileVersion,
    newFiles,
    setNewFiles,
    updatedAttributes,
    setUpdatedAttributes,
    generateStructure,
    setUndoStack,
    setRedoStack,
    pages,
    loading,
    deleteFilesOfPages,
    setDeleteFilesOfPages,
    filesToDelete,
    setFilesToDelete
  } = useStore();

  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [operation, setOperation] = useState<"update" | "add" | "delete" | "">("update");
  const [newAttributeName, setNewAttributeName] = useState<string>(menuOf[menuOf.length - 1]);
  const [updatedValue, setUpdatedValue] = useState<AttributeValue>({});
  const [selectedAttributeValue, setSelectedAttributeValue] = useState<AttributeValue>({});
  const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
  const [selectedPages, setSelectedPages] = useState<string[]>(['gad']);
  const [fileCounts, setFileCounts] = useState<FileCounts>({});

  const baseFilePath = `${filePath}${design.folder}`;

  // Initialize updated attributes
  useEffect(() => {
    const deepCopyValue = JSON.parse(JSON.stringify(designAttributes));
    setUpdatedAttributes(deepCopyValue);
  }, [designAttributes, setUpdatedAttributes]);

  // Set the current values for the selected attribute
  useEffect(() => {
    const value = (menuOf.length === 3)
      ? updatedAttributes[menuOf[0]]?.options[menuOf[1]]?.options[menuOf[2]]
      : (menuOf.length === 2)
        ? updatedAttributes[menuOf[0]]?.options[menuOf[1]]
        : updatedAttributes[menuOf[0]];

    if (value) {
      const deepCopyValue = JSON.parse(JSON.stringify(value));
      setUpdatedValue(deepCopyValue);
      setSelectedAttributeValue(deepCopyValue);
    }
  }, [updatedAttributes, menuOf]);

  // Check which files exist for the selected attribute
  useEffect(() => {
    const checkFilesExistence = async () => {
      if (!selectedAttributeValue?.path) {
        setFileExistenceStatus({});
        return;
      }

      const alreadySelectedPages: string[] = [];

      const results = await Promise.all(
        Object.keys(pages).map(async (page) => {
          const exists = await checkFileExists(`${baseFilePath}/${pages[page]}/${selectedAttributeValue?.path}.svg`);
          if (exists) {
            alreadySelectedPages.push(page);
          }
          return { [page]: exists };
        })
      );

      // Convert array of objects to a single object with pageFolder as keys
      const statusObject = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      // Update state with the full object
      setFileExistenceStatus(statusObject);
      setSelectedPages(alreadySelectedPages);
    };

    if (!loading) {
      checkFilesExistence();
    }
  }, [loading, pages, baseFilePath, selectedAttributeValue?.path]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, page: string) => {
    if (e.target.files && (e.target.files[0].type === 'image/svg+xml' || e.target.files[0].type === 'application/pdf')) {
      setNewFiles({
        ...newFiles,
        [selectedAttributeValue?.path]: {
          ...newFiles?.[selectedAttributeValue?.path],
          [pages[page]]: e.target.files[0]
        },
      });
    } else {
      toast.error('Please choose a svg file.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, page: string) => {
    e.preventDefault();
    if (e.dataTransfer.files[0].type === 'image/svg+xml' || e.dataTransfer.files[0].type === 'application/pdf') {
      setNewFiles({
        ...newFiles,
        [selectedAttributeValue?.path]: {
          ...newFiles?.[selectedAttributeValue?.path],
          [pages[page]]: e.dataTransfer.files[0]
        },
      });
    } else {
      toast.error('Please choose a svg file.');
    }
  };

  // Function to update attribute value
  const updateValue = async (renamedAttributes: any) => {
    const tempAttributes = { ...renamedAttributes };

    if (menuOf.length === 3) {
      tempAttributes[menuOf[0]].options[menuOf[1]].options[newAttributeName] = updatedValue;
    } else if (menuOf.length === 2) {
      tempAttributes[menuOf[0]].options[newAttributeName] = updatedValue;
    } else if (menuOf.length === 1) {
      tempAttributes[newAttributeName] = updatedValue;
    }

    return tempAttributes;
  };

  // Function to delete attribute value
  const deleteValue = async () => {
    const tempAttributes = { ...designAttributes };

    if (menuOf.length === 3) {
      if (tempAttributes[menuOf[0]].options[menuOf[1]].selectedOption === menuOf[menuOf.length - 1]) {
        tempAttributes[menuOf[0]].options[menuOf[1]].selectedOption = " ";
      }
      delete tempAttributes[menuOf[0]].options[menuOf[1]].options[menuOf[menuOf.length - 1]];
    } else if (menuOf.length === 2) {
      if (tempAttributes[menuOf[0]].selectedOption === menuOf[menuOf.length - 1]) {
        tempAttributes[menuOf[0]].selectedOption = "none";
      }
      delete tempAttributes[menuOf[0]].options[menuOf[menuOf.length - 1]];
    } else if (menuOf.length === 1) {
      delete tempAttributes[menuOf[menuOf.length - 1]];
    }

    return tempAttributes;
  };

  // Function to extract file paths for deletion
  const extractPaths = async (): Promise<string[]> => {
    let paths: string[] = [];

    function traverse(current: any): void {
      if (typeof current === 'object' && current !== null) {
        if (current.path && current.path !== "none") {
          paths.push(current.path);
        }
        for (let key in current) {
          if (current[key]) {
            traverse(current[key]);
          }
        }
      }
    }

    traverse(updatedValue);
    return paths;
  };

  // Function to rename attributes
  const renameAttribute = async (attributes: any, keys: string[], newKey: string) => {
    if (keys[keys.length - 1] === newKey) {
      return attributes; // Return early if newKey is the same as the last key
    }

    if (keys.length === 1) {
      const oldKey = keys[0];
      if (attributes[oldKey]) {
        attributes[newKey] = attributes[oldKey];
        delete attributes[oldKey];
      }
    } else if (keys.length === 2) {
      const [category, option] = keys;
      if (attributes[category] && attributes[category].options) {
        if (attributes[category].options[option]) {
          attributes[category].options[newKey] = attributes[category].options[option];
          delete attributes[category].options[option];
        }

        // Update selectedOption if necessary
        if (attributes[category].selectedOption === option) {
          attributes[category].selectedOption = newKey;
        }
      }
    } else if (keys.length === 3) {
      const [category, subcategory, option] = keys;
      if (attributes[category] && attributes[category].options &&
        attributes[category].options[subcategory] &&
        attributes[category].options[subcategory].options) {

        attributes[category].options[subcategory].options[newKey] = attributes[category].options[subcategory].options[option];
        delete attributes[category].options[subcategory].options[option];

        // Update selectedOption if necessary
        if (attributes[category].options[subcategory].selectedOption === option) {
          attributes[category].options[subcategory].selectedOption = newKey;
        }
      }
    }

    return attributes; // Return the updated attributes object
  };

  // Handle form submission for updating
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateLoading(true);

    if (!newAttributeName.trim()) {
      toast.error("Attribute name field is required.");
      setUpdateLoading(false);
      return;
    }

    if (selectedAttributeValue?.path) {
      const fileUploadCount = selectedPages.reduce((count, page) => {
        const exists = fileExistenceStatus[page];
        if (exists) {
          return count + 1;
        }
        return count;
      }, 0);

      const newFileUploadCount = newFiles?.[selectedAttributeValue?.path]
        ? Object.keys(newFiles?.[selectedAttributeValue?.path]).length
        : 0;

      if ((newFileUploadCount + fileUploadCount) < Object.keys(selectedPages).length) {
        toast.warning("You must upload the files for all the selected pages.");
        setUpdateLoading(false);
        return;
      }
    } else {
      for (const [option, info] of Object.entries(fileCounts)) {
        if (info.fileUploads < info.selectedPagesCount) {
          toast.warning(
            `In "${option}" option, you selected ${info.selectedPagesCount} page, but uploaded only ${info.fileUploads} ${info.fileUploads <= 1 ? 'file' : 'files'}.`
          );
          setUpdateLoading(false);
          return;
        }
      }
    }

    try {
      setUndoStack([]);
      setRedoStack([]);

      const renamedAttributes = await renameAttribute(designAttributes, menuOf, newAttributeName);
      const updatedDesignAttributes = await updateValue(renamedAttributes);
      const structure: IStructure = generateStructure({
        updatedAttributes: updatedDesignAttributes
      });

      const formData = new FormData();
      formData.append('folder', design.folder);
      formData.append('filesToDelete', JSON.stringify(filesToDelete));
      formData.append('deleteFilesOfPages', JSON.stringify(deleteFilesOfPages));
      formData.append('structure', JSON.stringify(structure));

      // Add files to FormData
      for (const [title, value] of Object.entries(newFiles)) {
        for (const [folder, file] of Object.entries(value)) {
          const customName = `${folder}<<&&>>${title}${file.name.slice(-4)}`; // Folder path + filename
          formData.append('files', file, customName);
        }
      }

      const { data } = await updateDesignAttributesAPI(id!, formData);

      if (data.success) {
        setDesignAttributes(updatedDesignAttributes);
        toast.success(data.status);
        const closeButton = document.querySelector("#close");
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
        setNewFiles({});
        incrementFileVersion();
      } else {
        toast.error(data.status);
      }
    } catch (error) {
      console.error('Failed to rename attribute:', error);
      toast.error('Failed to update attribute');
    }

    setUpdateLoading(false);
  };

  // Handle attribute deletion
  const handleDelete = async () => {
    try {
      const updateValueAfterDelete = await deleteValue();
      const structure: IStructure = generateStructure({
        updatedAttributes: updateValueAfterDelete
      });

      const body = {
        structure: structure,
        filesToDelete: await extractPaths()
      };

      const { data } = await deleteDesignAttributesAPI(id!, body);

      console.log(data);

      if (data.success) {
        setDesignAttributes(updateValueAfterDelete);
        toast.success(data.status);
        const closeButton = document.querySelector("#close");
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
        incrementFileVersion();
      } else {
        toast.error(data.status);
      }
    } catch (error) {
      console.error('Failed to delete attribute:', error);
      toast.error('Failed to delete attribute');
    }
  };

  // Function to reset all states
  const resetStates = () => {
    setUpdatedValue(selectedAttributeValue);
    setNewAttributeName(menuOf[menuOf.length - 1]);
    setNewFiles({});
    setDeleteFilesOfPages([]);
    setFilesToDelete([]);
    setFileCounts({});
  };

  // Function to handle page selection
  const handlePageSelection = (pageName: string) => {
    if (selectedPages.includes(pageName)) {
      let updatedNewFiles = { ...newFiles };
      const fileName = selectedAttributeValue?.path;
      delete updatedNewFiles?.[fileName]?.[pages[pageName]];
      setNewFiles(updatedNewFiles);

      if (fileExistenceStatus[pageName]) {
        setDeleteFilesOfPages([...deleteFilesOfPages, `${pages[pageName]}<<&&>>${selectedAttributeValue?.path}`]);
      }

      const tempSelectedPages = selectedPages.filter((page) => page !== pageName);
      setSelectedPages(tempSelectedPages);
    } else {
      const tempDeleteFileOfPages = deleteFilesOfPages.filter(
        (path) => path !== `${pages[pageName]}<<&&>>${selectedAttributeValue?.path}`
      );

      setDeleteFilesOfPages(tempDeleteFileOfPages);
      setSelectedPages((prev) => [pageName, ...prev]);
    }
  };

  // Function to remove a selected file
  const removeSelectedFile = (page: string) => {
    const updatedFiles = { ...newFiles };
    delete updatedFiles?.[selectedAttributeValue?.path][pages[page]];
    setNewFiles(updatedFiles);
  };

  return {
    updateLoading,
    operation,
    setOperation,
    newAttributeName,
    setNewAttributeName,
    updatedValue,
    setUpdatedValue,
    selectedAttributeValue,
    fileExistenceStatus,
    selectedPages,
    baseFilePath,
    pages,
    newFiles,
    fileCounts,
    setFileCounts,
    menuOf,
    handleFileChange,
    handleDrop,
    handleUpdate,
    handleDelete,
    handlePageSelection,
    removeSelectedFile,
    resetStates
  };
};