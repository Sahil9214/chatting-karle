/**
 * @file auth.routes.ts
 * @description Authentication routes configuration
 *
 * This file defines the routes for authentication endpoints including
 * registration, login, and protected routes. It uses the auth middleware
 * for protected routes and connects the routes to their respective controllers.
 */

import express from "express";
import { register, login, logout } from "../controllers/auth.controller";
import { auth } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * Authentication Routes
 *
 * Base path: /api/v1/auth
 * Available routes:
 * - POST /register: User registration
 * - POST /login: User authentication
 * - POST /logout: User logout
 * - GET /me: Get current user (protected)
 */

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    {username, email, password}
 */
router.post("/register", register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 * @body    {email, password}
 */
router.post("/login", login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post("/logout", auth, logout);

/**
 * @route   GET /api/v1/auth/me
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
 * app.use('/api/v1/auth', authRoutes);
 *
 * API Usage:
 * 1. Register: POST /api/v1/auth/register
 * 2. Login: POST /api/v1/auth/login
 * 3. Logout: POST /api/v1/auth/logout
 * 4. Get Profile: GET /api/v1/auth/me
 */
