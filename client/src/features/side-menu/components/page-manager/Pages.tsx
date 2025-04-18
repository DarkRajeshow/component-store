import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import PageList from "./PageList";
import DeletePageConfirmation from "./DeletePageConfirmation";
import { IPages } from "@/types/project.types";

interface PagesProps {
    newPageName: string;
    setNewPageName: (name: string) => void;
    addNewPage: () => void;
    choosenPage: string;
    fileExistenceStatus: Record<string, boolean>;
    openDeleteConfirmation: (pageName: string) => void;
    setChoosenPage: (pageName: string) => void;
    setOpenPageDeleteWarning: (pageName: string) => void;
    tempPages: IPages;
    openPageDeleteWarning: string;
    handleDelete: () => void;
}

const Pages: React.FC<PagesProps> = ({
    newPageName,
    setNewPageName,
    addNewPage,
    choosenPage,
    fileExistenceStatus,
    openDeleteConfirmation,
    setChoosenPage,
    tempPages,
    openPageDeleteWarning,
    setOpenPageDeleteWarning,
    handleDelete
}) => {
    return (
        <div id="pages" className="py-3 flex gap-2 flex-col">
            <h3 className="font-medium text-lg">Add pages</h3>

            <div className="flex gap-2">
                <Input
                    id="newPageName"
                    type="text"
                    value={newPageName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPageName(e.target.value)}
                    className="focus:bg-blue-50/60 bg-blue-50/40"
                    placeholder="e.g my-design"
                />

                {newPageName && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={addNewPage}
                        className="rounded-full hover:border-black"
                    >
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <div>
                <PageList
                    choosenPage={choosenPage}
                    fileExistenceStatus={fileExistenceStatus}
                    openDeleteConfirmation={openDeleteConfirmation}
                    setChoosenPage={setChoosenPage}
                    tempPages={tempPages || {}}
                />

                <DeletePageConfirmation
                    handleDelete={handleDelete}
                    openPageDeleteWarning={openPageDeleteWarning}
                    setOpenPageDeleteWarning={setOpenPageDeleteWarning}
                />
            </div>
        </div>
    );
};

export default React.memo(Pages);