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
                attributes: {}
            },
            B5: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                attributes: {}
            },
            B14: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                attributes: {}
            },
            B35: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                attributes: {}
            },
            V1: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                attributes: {}
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
                attributes: {}
            },
            medium: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                attributes: {}
            },
            large: {
                pages: {
                    gad: uuidv4()
                },
                baseDrawing: " ",
                attributes: {}
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

export const sideMenuTypes = [
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
        </svg>,
        value: "masterDrawing",
        label: "Master Drawing"
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
        ,
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