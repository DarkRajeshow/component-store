import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useAppStore from '../../../../store/useAppStore';
import { checkFileExists } from '../../../../utils/checkFileExists';
import { IStructure, IComponent, IFileInfo, IComponents, INestedChildLevel2 } from '@/types/design.types';
import { useModel } from '@/contexts/ModelContext';
import { INestedChildLevel1, INestedParentLevel1 } from '@/types/project.types';
import { generateNewFileIds, updateComponentFileIds, createNewFileStructure } from '../../utils/fileUtils';

interface FileCountInfo {
  fileUploads: number;
  selectedPagesCount: number;
}

interface FileExistenceStatus {
  [key: string]: boolean;
}

interface FileCounts {
  [key: string]: FileCountInfo;
}

export const useUpdateForm = () => {
  const {
    menuOf,
    newFiles,
    updatedComponents,
    structure,
    loading,
    // filesToDelete,
    deleteFilesOfPages,
    setStructureElements,
    setDeleteFilesOfPages,
    incrementFileVersion,
    setNewFiles,
    setFilesToDelete,
    setUpdatedComponents,
    setUndoStack,
    setRedoStack,
  } = useAppStore();

  const { baseContentPath, contentFolder, updateComponent, deleteComponent } = useModel();

  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [operation, setOperation] = useState<"update" | "add" | "delete" | "">("update");
  const [newComponentName, setNewComponentName] = useState<string>(menuOf[menuOf.length - 1]);
  const [updatedValue, setUpdatedValue] = useState<IComponent | INestedParentLevel1 | INestedChildLevel1 | INestedChildLevel2 | null>(null);
  const [selectedComponentValue, setSelectedComponentValue] = useState<IComponent | INestedParentLevel1 | INestedChildLevel1 | INestedChildLevel2 | null>(null);
  const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [fileCounts, setFileCounts] = useState<FileCounts>({});

  // Initialize updated components
  useEffect(() => {
    const deepCopyValue = JSON.parse(JSON.stringify(structure.components));
    setUpdatedComponents(deepCopyValue);
  }, [structure.components, setUpdatedComponents]);

  useEffect(() => {
    const firstPage = structure?.pages ? Object.keys(structure?.pages)[0] : undefined
    if (firstPage) {
      setSelectedPages([firstPage])
    }
  }, [structure.pages])
  // Set the current values for the selected component
  useEffect(() => {
    const value = (menuOf.length === 3)
      ? ((updatedComponents[menuOf[0]] as IComponent)?.options[menuOf[1]] as IComponent)?.options[menuOf[2]]
      : (menuOf.length === 2)
        ? (updatedComponents[menuOf[0]] as IComponent)?.options[menuOf[1]]
        : updatedComponents[menuOf[0]];

    if (value) {
      const deepCopyValue = JSON.parse(JSON.stringify(value));
      setUpdatedValue(deepCopyValue);
      setSelectedComponentValue(deepCopyValue);
    }
  }, [updatedComponents, menuOf]);

  // Check which files exist for the selected component
  useEffect(() => {
    const checkFilesExistence = async () => {
      if (!(selectedComponentValue as IFileInfo)?.fileId) {
        setFileExistenceStatus({});
        return;
      }

      const alreadySelectedPages: string[] = [];

      const results = await Promise.all(
        Object.keys(structure.pages).map(async (page) => {
          const exists = await checkFileExists(`${baseContentPath}/${structure.pages[page]}/${(selectedComponentValue as IFileInfo)?.fileId}.svg`);
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
  }, [loading, structure.pages, baseContentPath, selectedComponentValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, page: string) => {
    if (e.target.files && (e.target.files[0].type === 'image/svg+xml' || e.target.files[0].type === 'application/pdf')) {
      setNewFiles({
        ...newFiles,
        [(selectedComponentValue as IFileInfo)?.fileId]: {
          ...newFiles?.[(selectedComponentValue as IFileInfo)?.fileId],
          [structure.pages[page]]: e.target.files[0]
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
        [(selectedComponentValue as IFileInfo)?.fileId]: {
          ...newFiles?.[(selectedComponentValue as IFileInfo)?.fileId],
          [structure.pages[page]]: e.dataTransfer.files[0]
        },
      });
    } else {
      toast.error('Please choose a svg file.');
    }
  };

  // Function to update component value
  const updateValue = async (renamedComponents: IComponents): Promise<IComponents> => {
    const tempComponents = { ...renamedComponents };

    if (menuOf.length === 3) {
      ((tempComponents[menuOf[0]] as IComponent).options[menuOf[1]] as INestedParentLevel1).options[newComponentName] = updatedValue as IFileInfo;
    } else if (menuOf.length === 2) {
      (tempComponents[menuOf[0]] as IComponent).options[newComponentName] = updatedValue as IFileInfo | INestedParentLevel1;
    } else if (menuOf.length === 1) {
      tempComponents[newComponentName] = updatedValue as IComponent;
    }

    return tempComponents;
  };

  // Function to delete component value
  const deleteValue = async (): Promise<IComponents> => {
    const tempComponents = { ...structure.components };

    if (menuOf.length === 3) {
      if (((tempComponents[menuOf[0]] as IComponent).options[menuOf[1]] as IComponent).selected === menuOf[menuOf.length - 1]) {
        ((tempComponents[menuOf[0]] as IComponent).options[menuOf[1]] as IComponent).selected = " ";
      }
      delete ((tempComponents[menuOf[0]] as IComponent).options[menuOf[1]] as IComponent).options[menuOf[menuOf.length - 1]];
    } else if (menuOf.length === 2) {
      if ((tempComponents[menuOf[0]] as IComponent).selected === menuOf[menuOf.length - 1]) {
        (tempComponents[menuOf[0]] as IComponent).selected = "none";
      }
      delete (tempComponents[menuOf[0]] as IComponent).options[menuOf[menuOf.length - 1]];
    } else if (menuOf.length === 1) {
      delete tempComponents[menuOf[menuOf.length - 1]];
    }

    return tempComponents;
  };

  // // Function to extract file paths for deletion
  // function extractPaths() {
  //   const paths: string[] = [];

  //   function traverse(current: IComponent | INormalComponent | INestedParentLevel1 | IFileInfo | undefined) {
  //     if (!current || typeof current !== 'object') return;

  //     // Check if it's a component with fileId
  //     if ('fileId' in current && current.fileId && current.fileId !== "none") {
  //       paths.push(current.fileId);
  //     }

  //     // If it's a component with options, traverse them
  //     if ('options' in current && current.options) {
  //       Object.values(current.options).forEach(option => {
  //         traverse(option as IComponent | INormalComponent | INestedParentLevel1 | IFileInfo);
  //       });
  //     }
  //   }

  //   traverse(updatedValue as IComponent | INormalComponent | INestedParentLevel1 | IFileInfo);
  //   return paths;
  // }

  // Function to rename components
  const renameComponent = async (components: IComponents, keys: string[], newKey: string): Promise<IComponents> => {
    if (keys[keys.length - 1] === newKey) {
      return components; // Return early if newKey is the same as the last key
    }

    if (keys.length === 1) {
      const oldKey = keys[0];
      if (components[oldKey]) {
        components[newKey] = components[oldKey];
        delete components[oldKey];
      }
    } else if (keys.length === 2) {
      const [category, option] = keys;
      if (components[category] && (components[category] as IComponent).options) {
        if ((components[category] as IComponent).options[option]) {
          (components[category] as IComponent).options[newKey] = (components[category] as IComponent).options[option];
          delete (components[category] as IComponent).options[option];
        }

        // Update selected if necessary
        if ((components[category] as IComponent).selected === option) {
          (components[category] as IComponent).selected = newKey;
        }
      }
    } else if (keys.length === 3) {
      const [category, subcategory, option] = keys;
      if (components[category] && (components[category] as IComponent).options &&
        ((components[category] as IComponent).options[subcategory] as IComponent).options) {

        ((components[category] as IComponent).options[subcategory] as IComponent).options[newKey] = ((components[category] as IComponent).options[subcategory] as IComponent).options[option];
        delete ((components[category] as IComponent).options[subcategory] as IComponent).options[option];

        // Update selected if necessary
        if (((components[category] as IComponent).options[subcategory] as IComponent).selected === option) {
          ((components[category] as IComponent).options[subcategory] as IComponent).selected = newKey;
        }
      }
    }

    return components; // Return the updated components object
  };

  // Import the new utilities at the top of your useUpdateForm file

  // Replace the existing handleUpdate function with this updated version:
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateLoading(true);

    if (!newComponentName.trim()) {
      toast.error("Component name field is required.");
      setUpdateLoading(false);
      return;
    }

    if ((selectedComponentValue as IFileInfo)?.fileId) {
      const fileUploadCount = selectedPages.reduce((count, page) => {
        const exists = fileExistenceStatus[page];
        if (exists) {
          return count + 1;
        }
        return count;
      }, 0);

      const newFileUploadCount = newFiles?.[(selectedComponentValue as IFileInfo)?.fileId]
        ? Object.keys(newFiles?.[(selectedComponentValue as IFileInfo)?.fileId]).length
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



      // Rename components
      const renamedComponents = await renameComponent(updatedComponents, menuOf, newComponentName);
      const updatedComponentsLast = await updateValue(renamedComponents);
      // Generate new file IDs for files that are being updated
      const fileUpdateMap = generateNewFileIds(newFiles);

      // Update the component structure with new file IDs
      const finalUpdatedComponents = updateComponentFileIds(updatedComponentsLast, fileUpdateMap);

      const updatedStructure: IStructure = {
        ...structure,
        components: finalUpdatedComponents
      };

      const formData = new FormData();
      formData.append('folder', contentFolder);
      // formData.append('filesToDelete', JSON.stringify(filesToDelete));
      // formData.append('deleteFilesOfPages', JSON.stringify(deleteFilesOfPages));
      // formData.append('filesToDelete', JSON.stringify(""));
      // formData.append('deleteFilesOfPages', JSON.stringify(""));
      formData.append('structure', JSON.stringify(updatedStructure));
      formData.append('isUpdate', 'true'); // Indicate this is an update operation

      // Create new file structure with updated file IDs
      const newFileStructure = createNewFileStructure(newFiles, fileUpdateMap);

      // Add files to FormData with new file IDs
      for (const [newFileId, folderFiles] of Object.entries(newFileStructure)) {
        for (const [folder, file] of Object.entries(folderFiles)) {
          console.log(newFileId);

          const customName = `${folder}<<&&>>${newFileId}${(file as File).name.slice(-4)}`;
          formData.append('files', (file as File), customName);
        }
      }
      // return;


      const data = await updateComponent(formData);

      if (data && data.success) {
        setStructureElements({
          updatedComponents: finalUpdatedComponents
        });

        toast.success(data.status);
        const closeButton = document.querySelector("#close");
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
        setNewFiles({});
        incrementFileVersion();
      } else {
        toast.error(data ? data.status : "Error updating component.");
      }
    } catch (error) {
      console.error('Failed to update component:', error);
      toast.error('Failed to update component');
    }

    setUpdateLoading(false);
  };
  // Handle component deletion
  const handleDelete = async () => {
    try {
      const updateValueAfterDelete = await deleteValue();
      const updatedStructure = {
        ...structure,
        components: updateValueAfterDelete
      }

      const body = {
        structure: updatedStructure,
        // filesToDelete: await extractPaths()
        filesToDelete: []
      };

      const data = await deleteComponent(body);

      if (data && data.success) {
        setStructureElements({
          updatedComponents: updateValueAfterDelete
        })
        toast.success(data.status);
        const closeButton = document.querySelector("#close");
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
        incrementFileVersion();
      } else {
        toast.error(data ? data.status : "Error while deleting component.");
      }
    } catch (error) {
      console.error('Failed to delete component:', error);
      toast.error('Failed to delete component');
    }
  };

  // Function to reset all states
  const resetStates = () => {
    setUpdatedValue(selectedComponentValue);
    setNewComponentName(menuOf[menuOf.length - 1]);
    setNewFiles({});
    setDeleteFilesOfPages([]);
    setFilesToDelete([]);
    setFileCounts({});
  };

  // Function to handle page selection
  const handlePageSelection = (pageName: string) => {
    if (selectedPages.includes(pageName)) {
      const updatedNewFiles = { ...newFiles };
      const fileName = (selectedComponentValue as IFileInfo)?.fileId;
      delete updatedNewFiles?.[fileName]?.[structure.pages[pageName]];
      setNewFiles(updatedNewFiles);

      if (fileExistenceStatus[pageName]) {
        setDeleteFilesOfPages([...deleteFilesOfPages, `${structure.pages[pageName]}<<&&>>${(selectedComponentValue as IFileInfo)?.fileId}`]);
      }

      const tempSelectedPages = selectedPages.filter((page) => page !== pageName);
      setSelectedPages(tempSelectedPages);
    } else {
      const tempDeleteFileOfPages = deleteFilesOfPages.filter(
        (path) => path !== `${structure.pages[pageName]}<<&&>>${(selectedComponentValue as IFileInfo)?.fileId}`
      );

      setDeleteFilesOfPages(tempDeleteFileOfPages);
      setSelectedPages((prev) => [pageName, ...prev]);
    }
  };

  // Function to remove a selected file
  const removeSelectedFile = (page: string) => {
    const updatedFiles = { ...newFiles };
    delete updatedFiles?.[(selectedComponentValue as IFileInfo)?.fileId][structure.pages[page]];
    setNewFiles(updatedFiles);
  };

  return {
    newComponentName,
    updateLoading,
    updatedValue,
    operation,
    selectedComponentValue,
    fileExistenceStatus,
    selectedPages,
    baseContentPath,
    pages: structure.pages,
    newFiles,
    fileCounts,
    menuOf,
    setOperation,
    setNewComponentName,
    setUpdatedValue,
    setFileCounts,
    handleFileChange,
    handleDrop,
    handleUpdate,
    handleDelete,
    handlePageSelection,
    removeSelectedFile,
    resetStates
  };
};