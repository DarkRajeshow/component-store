import { ModelProvider } from "@/contexts/ModelContext";
import useAppStore from "@/store/useAppStore";
import { IDesign } from "@/types/design.types";
import DesignContent from "@/wrappers/DesignContent";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Design = () => {
    const { id } = useParams<{ id: string }>();
    const { content } = useAppStore();
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

    useEffect(() => {
        const design = content as IDesign;
        if (!design?.categoryId) return;
        const designCategoryId = design.categoryId
        setCategoryId(designCategoryId)
    }, [content])

    if (!id) return <div>No Design ID provided</div>;

    return (
        <ModelProvider modelType="design" id={id} categoryId={categoryId}>
            <DesignContent />
        </ModelProvider>
    );
};

export default Design;