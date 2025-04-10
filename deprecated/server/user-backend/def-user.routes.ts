import express from "express";
import {
    getUserData,
    getUserId,
    loginUser,
    logoutUser,
    registerUser
} from "../controllers/user.controller";
import { getUserDesigns } from "../controllers/design.controller";

const router = express.Router();

router.get("/", getUserData);
router.get("/id", getUserId);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/designs", getUserDesigns);

export default router;