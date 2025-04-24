import { Folders, Layers, NotebookPen } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const designTypes = {
    motor: {
        questions: [
            {
                name: "typeOfMotor",
                label: "Type of Motor",  // Question label
                inputType: "dropdown",  // The input type (can be 'text', 'dropdown', 'checkbox', etc.)
                options: [
                    "Induction Motor",
                    "Synchronous Motor",
                    "Stepper Motor",
                    "DC Motor",
                    "Brushless DC Motor",
                    "Servo Motor",
                    "Permanent Magnet Synchronous Motor (PMSM)",
                    "Shaded Pole Motor",
                    "Reluctance Motor",
                    "Linear Motor",
                    "Universal Motor",
                    "Explosion-Proof Motor"  // A motor type for hazardous areas
                ],
                required: true
            },
            {
                name: "frameSize",
                label: "Frame Size",
                inputType: "dropdown",
                options: [
                    "63", "71", "80", "90", "100", "112", "132",
                    "160", "180", "200", "225", "250", "280",
                    "315", "355", "400", "450", "500", "560", "630", "710"
                ],
                required: true
            }
        ]
    },
    smiley: {
        questions: [
            {
                name: "shapeOfSmile",
                label: "Shape of Smile",
                inputType: "dropdown",
                options: ["Square", "Circular", "Triangular"],
                required: true
            },
            // {
            //     name: "sizeOfSmile",
            //     label: "Size of Smile",
            //     inputType: "dropdown",
            //     options: ["Medium", "Small", "Large"],
            //     required: true
            // },
        ]
    }
};


export const initialStructure = {
    motor: {
        mountingTypes: {
            B3: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            },
            B5: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            },
            B14: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            },
            B35: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            },
            V1: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            }
        }
    },
    smiley: {
        sizes: {
            small: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            },
            medium: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            },
            large: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                components: {}
            }
        }
    }
}

export const popUpQuestions = {
    motor: {
        questions: [
            {
                name: "mountingType",
                label: "Select Mounting Type",
                inputType: "dropdown",
                options: [
                    {
                        label: "Foot Mounting (B3)",
                        value: "B3"
                    },
                    {
                        label: "Flange Mounting (B5)",
                        value: "B5"
                    },
                    {
                        label: "Face Mounting (B14)",
                        value: "B14"
                    },
                    {
                        label: "Combination Mounting (B35)",
                        value: "B35"
                    },
                    {
                        label: "Vertical Mounting (V1)",
                        value: "V1"
                    },
                ],
                required: true
            }
        ]
    },
    smiley: {
        questions: [
            {
                name: "sizeOfSmiley",
                label: "Size of Smiley",
                inputType: "dropdown",
                options: [
                    {
                        label: "Small size",
                        value: "small"
                    },
                    {
                        label: "Medium size",
                        value: "medium"
                    },
                    {
                        label: "Large size",
                        value: "large"
                    },
                ],
                required: true
            }
        ]
    }
}


export const sideMenuTypesForProject = [
    {
        icon: <Folders className='size-5' />,
        value: "categoryManager",
        label: "Category Management"
    },
]

export const sideMenuTypes = [
    {
        icon: <Layers className='size-5' />,
        value: "pageManager",
        label: "Page Management"
    },
    {
        icon: <NotebookPen className='size-5' />,
        value: "addText",
        label: "Add Text"
    }
]

export const initialSelectedCategories = {
    motor: {
        selectedCategory: "B3"
    },
    smiley: {
        selectedCategory: "small"
    }
}