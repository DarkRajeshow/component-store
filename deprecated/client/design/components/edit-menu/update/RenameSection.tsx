import { Input } from "@/components/ui/input";
import { PencilIcon } from "lucide-react";
import { memo } from "react";

// RenameSection component for renaming an option
const RenameSection = memo(({
    renamedOption,
    handleRename
}: {
    renamedOption: string;
    handleRename: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    return (
        <div>
            <p className='pb-2 font-medium'>Rename</p>
            <div className="flex items-center space-x-2">
                <div className="p-2 bg-gray-100 rounded-md">
                    <PencilIcon className="h-5 w-5 text-gray-600" />
                </div>
                <Input
                    required
                    type="text"
                    value={renamedOption}
                    onChange={handleRename}
                    className="bg-transparent py-3"
                    placeholder="e.g my-design"
                />
            </div>
        </div>
    );
});

RenameSection.displayName = 'RenameSection';

export default RenameSection;