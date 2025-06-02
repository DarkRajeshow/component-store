import { IBaseDrawing, IStructure } from "@/types/design.types";
import { IComponent, IComponents, INestedChildLevel1, INormalComponent, IPages } from "@/types/project.types";

// 1fd3d71f0efc4c418a24ed623ac4de54d3ebbf24d044c1399f79e180132c235f
// 9323fad6cb3d30060cfdb343ad281009c13952cbd41f1fe63f938df15e915df3
// f5db1cadae22e97cc80a8d17254827f7fb816af60242b21a5aa4844fbf439538
// 9323fad6cb3d30060cfdb343ad281009c13952cbd41f1fe63f938df15e915df3

async function generateUniqueCode(structure: IStructure): Promise<string> {
    const baseFilePaths = extractBasePaths(structure.pages, structure.baseDrawing)
    const filePaths = extractPaths(structure.components);

    console.log(structure);
    console.log(baseFilePaths);
    console.log(filePaths);
    

    const allPaths = [...baseFilePaths, ...filePaths]
    const textToHash = allPaths.join(';');

    const encoder = new TextEncoder();
    const data = encoder.encode(textToHash);

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

function extractBasePaths(pages: IPages, baseDrawing: IBaseDrawing) {
    let baseFilePaths = [];
    baseFilePaths = Object.values(pages).map((pageId) => `${pageId}.${baseDrawing?.fileId}`)
    return baseFilePaths;
}

function extractPaths(components: IComponents): string[] {
    const result: string[] = [];

    for (const key in components) {
        if (!Object.prototype.hasOwnProperty.call(components, key)) continue;

        const value = components[key];
        if ((value as INormalComponent).fileId) {
            if ((value as INormalComponent).value) {
                result.push((value as INormalComponent).fileId);
            }
            continue;
        }

        if ((value as IComponent).selected === 'none') continue;

        const selected = (value as IComponent).selected;
        const selectedValue = (value as IComponent).options?.[selected];

        if (!selectedValue) continue;

        const subOption = (selectedValue as IComponent).selected;
        const subSubOptionValue = (selectedValue as IComponent).options?.[subOption];

        // 2-level nested path
        if (subSubOptionValue && (subSubOptionValue as INestedChildLevel1).fileId) {
            result.push((subSubOptionValue as INestedChildLevel1).fileId);
        }
        // direct selected option path
        else if ((selectedValue as INestedChildLevel1).fileId) {
            result.push((selectedValue as INestedChildLevel1).fileId);
        }
    }

    return result;
}

export default generateUniqueCode;