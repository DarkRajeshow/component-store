import React from "react";
import { Button } from "@/components/ui/button";
import { TrashIcon, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PageList = ({
    choosenPage,
    fileExistenceStatus,
    openDeleteConfirmation,
    setChoosenPage,
    tempPages
}) => {
    return (
        <div className="space-y-2 my-3">
            <h4 className="font-medium">Pages</h4>

            <div className="grid grid-cols-1 gap-2">
                {Object.keys(tempPages).map((page, i) => (
                    <div
                        key={i}
                        className={`flex justify-between items-center p-3 rounded-md border ${choosenPage === page ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                            }`}
                    >
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => setChoosenPage(page)}
                        >
                            <span className="font-medium">{page}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {fileExistenceStatus[page] ? (
                                <Badge variant="success" className="bg-green-100 text-green-800 flex gap-1 items-center">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>File Added</span>
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="bg-red-100 text-red-800 flex gap-1 items-center">
                                    <XCircle className="h-3 w-3" />
                                    <span>No File</span>
                                </Badge>
                            )}

                            {Object.keys(tempPages).length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openDeleteConfirmation(page)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(PageList);