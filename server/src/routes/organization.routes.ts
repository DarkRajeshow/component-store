import express from "express";
import { createOrganization, getOrganizations } from "../controllers/organization.controller";

const router = express.Router();

router.post("/", createOrganization);
router.get("/", getOrganizations);

export default router;
