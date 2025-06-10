import React from 'react';
import { Search, Plus, FileX, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
    type: 'no-data' | 'no-results' | 'error';
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    onClearFilters?: () => void;
    hasActiveFilters?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    title,
    description,
    actionLabel,
    onAction,
    onClearFilters,
    hasActiveFilters = false
}) => {
    const getIcon = () => {
        switch (type) {
            case 'no-data':
                return <Plus className="h-12 w-12 text-gray-400" />;
            case 'no-results':
                return <Search className="h-12 w-12 text-gray-400" />;
            case 'error':
                return <FileX className="h-12 w-12 text-gray-400" />;
            default:
                return <FileX className="h-12 w-12 text-gray-400" />;
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md mx-auto border-none shadow-none">
                <CardContent className="text-center py-12">
                    <div className="mb-6 flex justify-center">
                        {getIcon()}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        {type === 'no-results' && hasActiveFilters && onClearFilters && (
                            <Button variant="outline" onClick={onClearFilters}>
                                <Filter className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        )}

                        {actionLabel && onAction && (
                            <span className='flex items-center text-center cursor-pointer' onClick={onAction}>
                                <Plus className="h-4 w-4 mr-2" />
                                {actionLabel}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};