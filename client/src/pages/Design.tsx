import { ModelProvider } from "@/contexts/ModelContext";
import DesignContent from "@/wrappers/DesignContent";
import { useParams } from "react-router-dom";

const Design = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) return <div>No Design ID provided</div>;

    return (
        <ModelProvider modelType="design" id={id}>
            <DesignContent />
        </ModelProvider>
    );
};

export default Design;