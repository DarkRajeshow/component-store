import { ModelProvider } from "@/contexts/ModelContext";
import useAppStore from "@/store/useAppStore";
import { IProject } from "@/types/project.types";
import ProjectContent from "@/wrappers/ProjectContent";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Project = () => {
    const { id } = useParams<{ id: string }>();
    const { content } = useAppStore();
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

    useEffect(() => {
        const project = content as IProject;
        if (!project?.hierarchy) return;
        const currentCategoryId = project?.hierarchy.categoryMapping[project?.selectedCategory as string];
        setCategoryId(currentCategoryId)
    }, [content])

    if (!id) return <div>No project ID provided</div>;

    return (
        <ModelProvider modelType="project" id={id} categoryId={categoryId}>
            <ProjectContent />
        </ModelProvider >
    );
};

export default Project;