// import express from "express";
// import {
//     addNewComponent,
//     addNewPage,
//     addNewParentComponent,
//     createEmptyDesign,
//     deleteconponents,
//     deleteDesignById,
//     getDesignById,
//     getRecentDesigns,
//     getUserDesigns,
//     renameconponents,
//     shiftToSelectedCategory,
//     updateUnParsedconponents,
//     uploadBaseDrawing
// } from "../controllers/design.controller";
// import upload from "../utils/multer";
// import optimizeSVG from '../middleware/optimizeSVG'
// import { handlePDFConversion } from "../middleware/handlePDFConversion";


// const router = express.Router();

// // ---- >>>> POST requests
// router.post("/", createEmptyDesign);


// // --- >>>> put requests

// //component operations 
// //1. add conponents
// //optimized 2
// router.put("/:id/conponents/add", upload.array('files'), handlePDFConversion, optimizeSVG, addNewComponent);
// router.put("/:id/conponents/add-parent", addNewParentComponent);


// router.put("/:id/conponents/base", upload.array('files'), handlePDFConversion, optimizeSVG, uploadBaseDrawing);
// router.put("/:id/conponents/shift", shiftToSelectedCategory);


// router.put("/:id/pages/add", addNewPage)

// //2. update conponents
// router.put("/:id/conponents/rename", renameconponents);

// //optimized 1
// router.put("/:id/conponents/update", upload.array('files'), handlePDFConversion, optimizeSVG, updateUnParsedconponents);
// router.put("/:id/conponents/delete", deleteconponents);



// // --- >>>> GET request
// router.get("/", getUserDesigns);
// router.get("/recent", getRecentDesigns);
// router.get("/:id", getDesignById);


// // ---- >>> DELETE requests
// router.delete('/:id', deleteDesignById);


// export default router;
