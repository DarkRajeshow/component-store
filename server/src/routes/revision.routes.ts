import express from "express";
import { createRevision, getRevisionsByDesign } from "../controllers/revision.controller";

const router = express.Router();

router.post("/", createRevision);
router.get("/design/:designId", getRevisionsByDesign);

export default router;
