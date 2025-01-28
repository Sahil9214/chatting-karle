/**
 * @file auth.routes.ts
 * @description Authentication routes configuration
 *
 * This file defines the routes for authentication endpoints including
 * registration, login, and protected routes. It uses the auth middleware
 * for protected routes and connects the routes to their respective controllers.
 */

import express from "express";
import { register, login } from "../controllers/auth.controller";
import { auth } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * Authentication Routes
 *
 * Base path: /api/auth
 * Available routes:
 * - POST /register: User registration
 * - POST /login: User authentication
 * - GET /me: Get current user (protected)
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    {username, email, password}
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 * @body    {email, password}
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get("/me", auth, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export default router;

/**
 * Route Integration:
 *
 * In your main app.ts:
 * import authRoutes from './routes/auth.routes';
 * app.use('/api/auth', authRoutes);
 *
 * API Usage:
 * 1. Register: POST /api/auth/register
 * 2. Login: POST /api/auth/login
 * 3. Get Profile: GET /api/auth/me
 */
