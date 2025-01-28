import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { getAllUsers, getUserProfile } from "../controllers/user.controller";

const router = express.Router();

// Get all users - this will be available at /api/v1/users
router.get("/", auth, getAllUsers);

// Get user profile - this will be available at /api/v1/users/profile
router.get("/profile", auth, getUserProfile);

export default router;
