import { useState, useEffect, useCallback } from 'react';
import useAppStore from '../../../../store/useAppStore';
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileDown, ArrowRight, CheckCircle, AlertCircle, X, Save, FileText } from 'lucide-react';
import generateUniqueCode from '../../utils/hash';
import { createEmptyDesignAPI, getDesignByHash } from '@/lib/globalAPI';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { IProject } from '@/types/project.types';
import { useModel } from '@/contexts/ModelContext';
import { ICreateDesignRequest, IDesign } from '@/types/design.types';

const ExportPopup = ({ onExport }: {
    onExport: (fileName: string) => void
}) => {
    const { id } = useParams()
    const [exportFormat, setExportFormat] = useState('pdf');
    const [hashId, setHashId] = useState("")
    const [fileName, setFileName] = useState('');
    // const [action, setAction] = useState('export'); // 'export' or 'create'
    const [designExists, setDesignExists] = useState(false);
    const [existingDesignData, setExistingDesignData] = useState<undefined | IDesign>()
    const [isChecking, setIsChecking] = useState(false);
    const [isCreatingDesign, setIsCreatingDesign] = useState(false);
    const [newDesignData, setNewDesignData] = useState({
        name: '',
        type: '',
        code: '',
        description: ''
    });
    const { setSelectionBox, structure, selectedCategory, content } = useAppStore();
    const { modelType } = useModel()

    // Set default filename based on design or project name
    useEffect(() => {
        if (content) {
            setFileName(content?.name);
        }
    }, [content]);

    useEffect(() => {
        const generateHashCode = async () => {
            const hash = await generateUniqueCode(structure)
            setHashId(hash);
        }
        generateHashCode();
    }, [structure]);

    // Check if design with same hashId exists
    const checkExistingDesign = useCallback(async () => {
        if (hashId) {
            setIsChecking(true);
            const response = await getDesignByHash(hashId);
            console.log(response);
            if (response.success) {
                if (response.exists) {
                    setDesignExists(true);
                    setExistingDesignData(response.design && response.design)
                }
            }
            setIsChecking(false);
        }
    }, [hashId])

    useEffect(() => {
        checkExistingDesign()
    }, [checkExistingDesign]);

    const handleExport = () => {
        // onExport(fileName, exportFormat);
        onExport(fileName);
        setSelectionBox(null);
    };

    // Validation function for design creation
    const validateDesignData = ({
        hash,
        project,
        structure,
        type,
        category,
        name,
        code,
        folder,
        categoryId,
        // isParentADesign,
        // categoryFolder,
        // sourceDesign,
        // description,
    }: ICreateDesignRequest) => {
        if (!name?.trim()) {
            toast.error("Design name is required");
            return false;
        }
        if (!code?.trim()) {
            toast.error("Design code is required");
            return false;
        }
        if (!structure) {
            toast.error("Design structure is required");
            return false;
        }
        if (!hash) {
            toast.error("Design hash is invalid");
            return false;
        }
        if (!project) {
            toast.error("Project ID is required");
            return false;
        }
        if (!category) {
            toast.error("Please select a category");
            return false;
        }
        if (!type) {
            toast.error("Design type is required");
            return false;
        }
        if (!folder) {
            toast.error("Project folder is required");
            return false;
        }
        if (!categoryId) {
            toast.error("Category folder id is required");
            return false;
        }
        return true;
    };

    const handleCreateDesign = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const categoryFolder = modelType === "project" ? (content as IProject).hierarchy.categoryMapping[selectedCategory] : (content as IDesign).categoryId;
            const sourceDesign = modelType === "design" ? (content as IDesign)._id : undefined;
            const projectFolder = modelType === "design" ? (content as IDesign).folder : (content as IProject).folder;
            const projectId = modelType === "design" ? (content as IDesign).project : (content as IProject)._id
            const formData: ICreateDesignRequest = {
                hash: hashId,
                project: projectId,
                structure: structure,
                type: (content as IDesign | IProject).type,
                category: selectedCategory,
                name: newDesignData.name,
                code: newDesignData.code,
                folder: projectFolder,
                categoryId: categoryFolder,
                sourceDesign: sourceDesign,
                description: newDesignData.description
            }

            if (!validateDesignData(formData)) return;

            setIsCreatingDesign(true);
            const data = await createEmptyDesignAPI(formData);

            if (data.success) {
                toast.success(data.status);
                if (data.design) {
                    const designId = data.design?._id;
                    setTimeout(async () => {
                        closeExportForm();
                        window.open(`/designs/${designId}`, '_blank');
                        setIsCreatingDesign(false);
                    }, 2000)
                }
            } else {
                toast.error(data.status);
                setIsCreatingDesign(false);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to create design.');
            setIsCreatingDesign(false);
        }
    };

    const formatOptions = [
        { value: 'pdf', label: 'PDF Document', icon: FileDown },
        { value: 'DXF', label: 'DXF Format', icon: FileText },
        { value: 'svg', label: 'SVG Vector', icon: FileDown }
    ];

    const closeExportForm = () => {
        document.getElementById("exportFormClose")?.click();
    }
    const handleOpenExistingDesign = async () => {
        if (existingDesignData) {
            closeExportForm();
            window.open(`/designs/${existingDesignData._id}`, '_blank');
            // setTimeout(async () => {
            //     await refreshContent();
            // }, 1000)
        }
        else {
            toast.error("Somethign went wrong, Try again later.")
        }
    }

    return (
        <div className="sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-lg">
            <DialogTrigger id='close' className='absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors'>
                <X className='size-5' />
            </DialogTrigger>

            <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="text-2xl font-bold text-gray-900">Design Actions</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                    Export your design or save it to your library for future use
                </DialogDescription>
            </DialogHeader>

            {isChecking ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Checking for existing designs...</p>
                </div>
            ) : (
                <div className="px-6 py-4">
                    {designExists && (
                        <Alert className="mb-5 border-amber-200 bg-amber-50">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <AlertTitle className="text-amber-800 font-semibold">{(existingDesignData && existingDesignData._id === id) ? "No change in the existing Design." : "Design already exists"}</AlertTitle>
                            <AlertDescription className="flex items-center justify-between mt-1">
                                <span className="text-amber-700 font-">{(existingDesignData && existingDesignData._id === id) ? `if you need, you can customize your ${modelType} and export it as a new design.` : "A design with identical component's combination already exists in your library."}</span>
                                {
                                    (existingDesignData && existingDesignData._id !== id) && <Button variant="outline" className="flex items-center gap-2 border-amber-500 text-amber-700 hover:bg-amber-100" onClick={handleOpenExistingDesign}>
                                        Open existing <ArrowRight className="h-4 w-4" />
                                    </Button>
                                }
                            </AlertDescription>
                        </Alert>
                    )}

                    {!designExists && (
                        <Alert className="mb-5 border-green-200 bg-green-50">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <AlertTitle className="font-medium text-green-800">Unique Selection</AlertTitle>
                            <AlertDescription className="text-green-700 mt-1">
                                This component combination is unique. You can export it as a file or save it to your design library.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="export" className="w-full">
                        <TabsList className="w-full rounded-lg bg-gray-100 p-1">
                            <TabsTrigger value="export" className="rounded-md py-2.5 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileDown className="h-4 w-4" /> Export File
                            </TabsTrigger>
                            {!designExists && (
                                <TabsTrigger value="create" className="rounded-md py-2.5 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Save className="h-4 w-4" /> Save to Library
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="export" className="mt-2">
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold text-gray-800">Export Options</CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Choose your preferred file format and customize the file name
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="export-format" className="text-sm font-medium text-gray-700">File Format</Label>
                                        <Select value={exportFormat} onValueChange={setExportFormat}>
                                            <SelectTrigger id="export-format" className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                                <SelectValue placeholder="Select format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formatOptions.map(format => (
                                                    <SelectItem key={format.value} value={format.value}>
                                                        <div className="flex items-center gap-2">
                                                            <format.icon className="h-4 w-4 text-gray-600" />
                                                            <span>{format.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {exportFormat === 'pdf' && "PDF files are best for sharing and printing"}
                                            {exportFormat === 'DXF' && "DXF format preserves all design properties for future editing"}
                                            {exportFormat === 'svg' && "SVG files are ideal for web usage and scaling"}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="file-name" className="text-sm font-medium text-gray-700">File Name</Label>
                                        <Input
                                            id="file-name"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            placeholder="Enter a descriptive file name"
                                            className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2">
                                        <FileDown className="h-4 w-4 mr-2" />
                                        Export as {exportFormat.toUpperCase()}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="create" className="mt-2">
                            {isCreatingDesign ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-50 border-b-green-600"></div>
                                    <p className="mt-4 text-sm text-gray-600">Creating your design...</p>
                                </div>
                            ) : (
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-semibold text-gray-800">Save to Library</CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Add this design to your library for reuse across projects
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="design-name" className="text-sm font-medium text-gray-700">Design Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="design-name"
                                                value={newDesignData.name}
                                                onChange={(e) => setNewDesignData({ ...newDesignData, name: e.target.value })}
                                                placeholder="Enter a distinctive name for identification"
                                                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="design-code" className="text-sm font-medium text-gray-700">Design Code <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="design-code"
                                                value={newDesignData.code}
                                                onChange={(e) => setNewDesignData({ ...newDesignData, code: e.target.value })}
                                                placeholder="Enter a unique code (e.g., ABC-123)"
                                                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                A unique identifier for referencing within your organization
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="design-description" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                Description <span className="text-xs text-gray-500">(Optional)</span>
                                            </Label>
                                            <Textarea
                                                id="design-description"
                                                value={newDesignData.description}
                                                onChange={(e) => setNewDesignData({ ...newDesignData, description: e.target.value })}
                                                placeholder="Add details about this design's purpose, features, or usage"
                                                className="w-full min-h-24 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        <Button
                                            onClick={handleCreateDesign}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2"
                                            disabled={!newDesignData.name || !newDesignData.code || isCreatingDesign}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save to Design Library
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            <DialogFooter className="px-6 pb-6 pt-2 flex gap-2 sm:justify-end">
                <DialogTrigger id='exportFormClose' asChild>
                    <Button variant="outline" type="button" className="border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50">
                        Cancel
                    </Button>
                </DialogTrigger>
            </DialogFooter>
        </div>
    );
};

export default ExportPopup;