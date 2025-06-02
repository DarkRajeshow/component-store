import { useEffect } from 'react';
import { DialogTrigger } from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Edit3,
    Trash2,
    FileEdit,
    Lock,
    Shield,
    AlertCircle,
    LucideIcon
} from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import useAppStore from '@/store/useAppStore';

type ActionType = 'rename' | 'edit' | 'delete';
type ButtonVariant = VariantProps<typeof Button>['variant'];

interface MenuItemProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: ButtonVariant;
    tooltipContent?: React.ReactNode;
}

interface EditMenuProps {
    componentOption: string;
    setDialogType: (type: string) => void;
    lockStatus?: {
        isLocked: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canRename: boolean;
        reason: string;
    };
}

const EditMenu = ({ componentOption, setDialogType, lockStatus }: EditMenuProps) => {
    const canEdit = !lockStatus || lockStatus.canEdit;
    const canDelete = !lockStatus || lockStatus.canDelete;
    // const canRename = !lockStatus || lockStatus.canRename;
    const isLocked = lockStatus?.isLocked || false;

    const { menuOf, setMenuOf, setUniqueFileName } = useAppStore();

    useEffect(() => {
        const ComponentPath = componentOption.split(">$>");
        setMenuOf(ComponentPath);
    }, [componentOption, setMenuOf])



    // Helper function to get tooltip content for disabled actions
    const getTooltipContent = (action: ActionType, canPerform: boolean) => {
        if (canPerform) return null;

        const baseReason = lockStatus?.reason || 'Action not permitted';
        const actionMessages: Record<ActionType, string> = {
            rename: 'Cannot rename this component',
            edit: 'Cannot edit this component',
            delete: 'Cannot delete this component'
        };

        return (
            <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span className="font-medium">{actionMessages[action]}</span>
                </div>
                <span className="text-muted-foreground">{baseReason}</span>
            </div>
        );
    };

    // Menu item component with enhanced styling
    const MenuItem = ({
        icon: Icon,
        label,
        onClick,
        disabled,
        variant = "ghost",
        tooltipContent
    }: MenuItemProps) => {
        const buttonContent = (
            <Button
                variant={variant}
                size="sm"
                disabled={disabled}
                onClick={onClick}
                className={`
                    w-full justify-start gap-2 h-9 px-3 
                    ${disabled
                        ? 'opacity-50 cursor-not-allowed bg-muted/30'
                        : 'hover:bg-accent hover:text-accent-foreground transition-colors'
                    }
                    ${variant === 'destructive' && !disabled ? 'hover:bg-destructive/90' : ''}
                `}
            >
                <Icon className={`h-4 w-4 ${disabled ? 'text-muted-foreground' : ''}`} />
                <span className="text-sm font-medium">{label}</span>
                {disabled && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </Button>
        );

        if (disabled && tooltipContent) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-48">
                        {tooltipContent}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return buttonContent;
    };

    const menuContent = (
        <TooltipProvider delayDuration={300}>
            <div className="flex flex-col gap-1 p-2 w-48 min-w-max bg-background border border-border rounded-lg shadow-lg">
                {/* Header with lock status indicator */}
                {isLocked && (
                    <>
                        <div className="flex items-center gap-2 px-2 py-1 mb-1">
                            <Shield className="h-4 w-4 text-amber-500" />
                            <Badge variant="secondary" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Protected
                            </Badge>
                        </div>
                        <Separator className="mb-1" />
                    </>
                )}

                {/* Rename Action */}
                <DialogTrigger asChild>
                    <MenuItem
                        icon={FileEdit}
                        label="Rename"
                        disabled={!canDelete}
                        onClick={() => setDialogType('rename')}
                        tooltipContent={getTooltipContent('rename', canDelete)}
                    />
                </DialogTrigger>

                {/* Update/Edit Action */}
                <DialogTrigger asChild>
                    <MenuItem
                        icon={Edit3}
                        label="Update"
                        disabled={!canEdit}
                        onClick={() => {
                            if (menuOf.length > 1) {
                                setUniqueFileName();
                            }
                            setDialogType('update');
                        }}
                        tooltipContent={getTooltipContent('edit', canEdit)}
                    />
                </DialogTrigger>

                <Separator className="my-1" />

                {/* Delete Action */}
                <DialogTrigger asChild>
                    <MenuItem
                        icon={Trash2}
                        label="Delete"
                        disabled={!canDelete}
                        variant={canDelete ? "destructive" : "ghost"}
                        onClick={() => setDialogType('delete')}
                        tooltipContent={getTooltipContent('delete', canDelete)}
                    />
                </DialogTrigger>

                {/* Lock status info at bottom */}
                {isLocked && lockStatus?.reason && (
                    <>
                        <Separator className="mt-1" />
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span className="leading-tight">{lockStatus.reason}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TooltipProvider>
    );

    // Position-specific arrow styling
    if (menuOf.length === 1) {
        return (
            <div className="relative">
                {/* Top arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-border" />
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-background" />
                {menuContent}
            </div>
        );
    } else {
        return (
            <div className="relative">
                {/* Left arrow */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-border" />
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-background" />
                {menuContent}
            </div>
        );
    }
};

export default EditMenu;