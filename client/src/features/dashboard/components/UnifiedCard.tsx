import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Calendar, User, Code, Layers, ChevronLeft, ChevronRight, ExternalLink, Copy, Folder } from 'lucide-react';
import { IDesign } from '@/types/design.types';
import { IProject } from '@/types/project.types';
import { ViewMode } from '../types/home.types';
import { useFileUtils } from '../hooks/useFileUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isElectron } from '@/utils/isElectron';

interface UnifiedCardProps {
    item: IDesign | IProject;
    viewMode: ViewMode;
    onSelect?: (id: string) => void;
    isSelected?: boolean;
}

export interface ElectronAPI {
    openItemWindow: (route: string) => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

// Type guards
const isDesign = (item: IDesign | IProject): item is IDesign => {
    return 'structure' in item && 'code' in item;
};

const isProject = (item: IDesign | IProject): item is IProject => {
    return 'hierarchy' in item && !('code' in item);
};

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
    item,
    viewMode,
    onSelect,
    isSelected = false
}) => {
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [, setIsHovering] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const navigate = useNavigate();
    const {
        getSVGPathForDesign,
        getSVGPathForProject,
        getBaseDrawingPath,
        getAllFilePaths,
        checkFilesExistence,
        existingFiles,
    } = useFileUtils();

    const itemType = isDesign(item) ? 'design' : 'project';

    // Initialize default category for projects
    useEffect(() => {
        if (isProject(item) && !selectedCategoryId && item.hierarchy?.categoryMapping) {
            const categoryId = item.hierarchy.categoryMapping[item.selectedCategory];
            if (categoryId) {
                setSelectedCategoryId(categoryId);
            }
        }
    }, [item, selectedCategoryId]);

    // Memoize categories for projects
    const categories = useMemo(() => {
        if (!isProject(item) || !item.hierarchy?.categories || !item.hierarchy?.categoryMapping) return [];

        return Object.entries(item.hierarchy.categoryMapping).map(([code, categoryId]) => ({
            code,
            categoryId,
            name: code
        }));
    }, [item]);

    // Get current category data for projects
    const currentCategoryData = useMemo(() => {
        if (!isProject(item)) return null;
        return selectedCategoryId && item.hierarchy?.categories?.[selectedCategoryId]
            ? item.hierarchy.categories[selectedCategoryId]
            : null;
    }, [item, selectedCategoryId]);

    // Get pages based on item type
    const pages = useMemo(() => {
        if (isDesign(item)) {
            return item.structure?.pages ? Object.keys(item.structure.pages) : [];
        } else {
            return currentCategoryData?.pages ? Object.keys(currentCategoryData.pages) : [];
        }
    }, [item, currentCategoryData]);

    const currentPage = pages[selectedPageIndex] || '';

    // Memoize file paths to prevent unnecessary recalculation
    const filePaths = useMemo(() => {
        if (isDesign(item)) {
            return getAllFilePaths(item);
        } else {
            return selectedCategoryId ? getAllFilePaths(item, selectedCategoryId) : [];
        }
    }, [item, selectedCategoryId, getAllFilePaths]);

    // Check file existence with dependency optimization
    useEffect(() => {
        if (filePaths.length > 0) {
            // Only check files that haven't been checked yet
            const uncheckedPaths = filePaths.filter(path => !(path in existingFiles));
            if (uncheckedPaths.length > 0) {
                checkFilesExistence(uncheckedPaths);
            }
        }
    }, [filePaths, checkFilesExistence]); // Removed existingFiles from dependencies

    // Reset page index when category changes for projects
    useEffect(() => {
        if (isProject(item)) {
            setSelectedPageIndex(0);
        }
    }, [item, selectedCategoryId]);

    const handleNextPage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedPageIndex((prev) => (prev + 1) % pages.length);
    };

    const handlePrevPage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedPageIndex((prev) => (prev - 1 + pages.length) % pages.length);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedPageIndex(0);
    };

    const handleCopyCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDesign(item)) {
            navigator.clipboard.writeText(item.code);
        }
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Render SVG components based on item type
    const renderSVGComponents = () => {
        if (isDesign(item) && item.structure?.components) {
            return Object.entries(item.structure.components).map(([componentKey, value]) => {
                const svgPath = getSVGPathForDesign(value, currentPage, item);
                return (
                    svgPath && existingFiles[svgPath] && (
                        <image
                            key={`${componentKey}-${currentPage}`}
                            href={svgPath}
                            x="0"
                            y="0"
                            width="340"
                            height="340"
                        />
                    )
                );
            });
        } else if (isProject(item) && currentCategoryData?.components) {
            return Object.entries(currentCategoryData.components).map(([componentKey, value]) => {
                const svgPath = getSVGPathForProject(value, currentPage, item, selectedCategoryId);
                return (
                    svgPath && existingFiles[svgPath] && (
                        <image
                            key={`${componentKey}-${currentPage}-${selectedCategoryId}`}
                            href={svgPath}
                            x="0"
                            y="0"
                            width="340"
                            height="340"
                        />
                    )
                );
            });
        }
        return null;
    };

    // Get base drawing path based on item type
    const getBaseDrawingImagePath = () => {
        if (isDesign(item) && item.structure?.baseDrawing?.fileId) {
            return getBaseDrawingPath(item, currentPage);
        } else if (isProject(item) && currentCategoryData?.baseDrawing?.fileId) {
            return getBaseDrawingPath(item, currentPage, selectedCategoryId);
        }
        return null;
    };

    if (!item) return null;

    const cardContent = (
        <Card
            className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } ${viewMode.layout === 'list' ? 'flex-row' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => onSelect?.(item._id)}
        >
            <CardHeader className={`pb-3 ${viewMode.layout === 'list' ? 'flex-shrink-0 w-64' : ''}`}>
                {/* Header with badges and controls */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`text-xs font-medium ${itemType === 'design'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                                }`}
                        >
                            {itemType.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                            {item.type}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCopyCode}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{itemType === 'design' ? `Copy code: ${(item as IDesign).code}` : 'Copy project ID'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                                e.preventDefault();
                                const route = `/${itemType}s/${item._id}`;

                                if (isElectron() && 'electronAPI' in window) {
                                    // Let Electron main process handle new window
                                    (window.electronAPI as ElectronAPI)?.openItemWindow(route);
                                } else {
                                    // Normal browser window open
                                    window.open(route, '_blank');
                                }
                            }}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {item.name}
                    </h3>
                    {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                        </p>
                    )}
                </div>

                {/* Category Selector for Projects */}
                {itemType === 'project' && categories.length > 1 && (
                    <div className="mt-3">
                        <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.categoryId} value={category.categoryId}>
                                        <div className="flex items-center gap-2">
                                            <Folder className="h-3 w-3" />
                                            <span>{category.code}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                    <div className="flex items-center gap-1">
                        {itemType === 'design' ? (
                            <>
                                <Code className="h-3 w-3" />
                                <span className="font-mono">{(item as IDesign).code}</span>
                            </>
                        ) : (
                            <>
                                <Layers className="h-3 w-3" />
                                <span>{categories.length} categories</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.updatedAt)}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className={`pt-0 ${viewMode.layout === 'list' ? 'flex-1' : ''}`}>
                {/* Preview */}
                <div className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    {/* Page Navigation */}
                    {pages.length > 1 && (
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={handlePrevPage}
                                disabled={pages.length <= 1}
                            >
                                <ChevronLeft className="h-3 w-3" />
                            </Button>

                            <span className="text-xs font-medium text-gray-700 px-2">
                                {selectedPageIndex + 1} / {pages.length}
                            </span>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={handleNextPage}
                                disabled={pages.length <= 1}
                            >
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    {/* Current Page Name */}
                    {currentPage && (
                        <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                            <span className="text-xs font-medium text-gray-700 uppercase">
                                {currentPage}
                            </span>
                        </div>
                    )}

                    {/* SVG Preview */}
                    <div className={`relative ${viewMode.layout === 'list' ? 'h-32' : 'h-48'} flex items-center justify-center`}>
                        {currentPage && (
                            (itemType === 'design' && (item as IDesign).structure?.pages) ||
                            (itemType === 'project' && currentCategoryData)
                        ) && (
                                <svg
                                    className="w-full h-full object-contain"
                                    viewBox="0 0 340 340"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{
                                        filter: isImageLoading ? 'blur(4px)' : 'none',
                                        transition: 'filter 0.3s ease'
                                    }}
                                >
                                    {/* Base Drawing */}
                                    {getBaseDrawingImagePath() && (
                                        <image
                                            x="0"
                                            y="0"
                                            width="340"
                                            height="340"
                                            href={getBaseDrawingImagePath()!}
                                            onLoad={() => setIsImageLoading(false)}
                                            onError={() => setIsImageLoading(false)}
                                        />
                                    )}

                                    {/* Components */}
                                    {renderSVGComponents()}
                                </svg>
                            )}

                        {/* Loading State */}
                        {isImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className={`w-8 h-8 border-2 ${itemType === 'design' ? 'border-blue-500' : 'border-green-500'
                                    } border-t-transparent rounded-full animate-spin`} />
                            </div>
                        )}

                        {/* Empty State */}
                        {(!currentPage || (itemType === 'project' && !currentCategoryData)) && (
                            <div className="text-center text-gray-400">
                                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No preview available</p>
                            </div>
                        )}
                    </div>

                    {/* Page Indicators */}
                    {pages.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
                            {pages.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === selectedPageIndex
                                        ? (itemType === 'design' ? 'bg-blue-500' : 'bg-green-500')
                                        : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedPageIndex(index);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Category and Stats */}
                {viewMode.layout === 'grid' && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {itemType === 'design' ? (
                                <Badge variant="outline" className="text-xs">
                                    {(item as IDesign).category}
                                </Badge>
                            ) : (
                                selectedCategoryId && (
                                    <Badge variant="outline" className="text-xs">
                                        {categories.find(c => c.categoryId === selectedCategoryId)?.code}
                                    </Badge>
                                )
                            )}
                            {pages.length > 1 && (
                                <span className="text-xs text-gray-500">
                                    {pages.length} pages
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // Handle navigation/selection
    const handleCardClick = (e: React.MouseEvent) => {
        if (onSelect) {
            e.preventDefault();
            onSelect(item._id);
        } else if (itemType === 'design') {
            // For designs, use Link navigation
            return;
        } else {
            // For projects, handle navigation manually
            e.preventDefault();
            navigate(`/${itemType}s}/${item._id}`);
            // window.location.href = `/projects/${item._id}`;
        }
    };

    if (itemType === 'design' && !onSelect) {
        return (
            <Link
                to={`/designs/${item._id}`}
                className={`block ${viewMode.layout === 'list' ? 'w-full' : ''}`}
            >
                {cardContent}
            </Link>
        );
    }

    return (
        <div
            className={`block ${viewMode.layout === 'list' ? 'w-full' : ''} cursor-pointer`}
            onClick={handleCardClick}
        >
            {cardContent}
        </div>
    );
};