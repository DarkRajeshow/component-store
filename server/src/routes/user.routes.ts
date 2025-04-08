import express from "express";
import userController from "../controllers/user.controller";
import designController from "../controllers/design.controller";


const router = express.Router();

// User authentication routes
router.post("/register", userController.registerUser.bind(userController));
router.post("/login", userController.loginUser.bind(userController));
router.post("/logout", userController.logoutUser.bind(userController));

// User data routes
router.get("/", userController.getUserData.bind(userController));
router.get("/id", userController.getUserId.bind(userController));
router.get("/designs", designController.getUserDesigns);

// User preferences
router.put("/preferences", userController.updateUserPreferences.bind(userController));

export default router;