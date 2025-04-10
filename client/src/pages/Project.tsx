import { ModelProvider } from "@/contexts/ModelContext";
import useAppStore from "@/store/useAppStore";
import ProjectContent from "@/wrappers/ProjectContent";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Project = () => {
    const { id } = useParams<{ id: string }>();
    const { fetchProject, project } = useAppStore();
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (id) {
            fetchProject(id);
        }
    }, [id, fetchProject]);

    useEffect(() => {
        const currentCategoryId = project?.hierarchy.categoryMapping[project?.selectedCategory as string];
        setCategoryId(currentCategoryId)
    }, [project?.selectedCategory, project?.hierarchy.categoryMapping])

    if (!id) return <div>No project ID provided</div>;

    return (
        <ModelProvider modelType="project" id={id} categoryId={categoryId}>
            <ProjectContent />
        </ModelProvider >
    );
};

export default Project;