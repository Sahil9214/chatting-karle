/**
 * @file auth.middleware.ts
 * @description Authentication middleware using JSON Web Tokens (JWT)
 *
 * This middleware handles JWT validation for protected routes, implementing
 * token extraction from headers, verification, and user authentication.
 * It provides robust error handling and typing support for Express.js
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { User } from "../models/User";
import dotenv from "dotenv";
dotenv.config();
/**
 * Extended Express Request interface to include user property
 * This allows TypeScript to recognize the user object added by the middleware
 */
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        username: string;
        email: string;
      };
    }
  }
}

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  id: string;
}

/**
 * Authentication middleware for protecting routes
 *
 * @async
 * @function auth
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * @throws {Error} If token is invalid or missing
 *
 * Features:
 * 1. Token extraction from Authorization header
 * 2. JWT verification
 * 3. User attachment to request object
 * 4. Comprehensive error handling
 *
 * Usage Example:
 * router.get('/protected', auth, protectedController);
 */
export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No authentication token, access denied",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

/**
 * Production Considerations:
 *
 * 1. Token Management:
 * - Implement token blacklisting for logged-out tokens
 * - Use refresh tokens for better security
 * - Consider token rotation
 *
 * 2. Security Headers:
 * app.use(helmet()) // Adds security headers
 *
 * 3. Rate Limiting:
 * const rateLimit = require('express-rate-limit')
 * app.use('/api/', rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100 // limit each IP to 100 requests per windowMs
 * }));
 */

/**
 * Common Usage Patterns:
 *
 * 1. Basic Protected Route:
 * router.get('/profile', auth, profileController);
 *
 * 2. With Role-Based Access:
 * const roleCheck = (roles: string[]) => (req, res, next) => {
 *   if (!roles.includes(req.user.role)) {
 *     return res.status(403).json({message: 'Forbidden'});
 *   }
 *   next();
 * };
 * router.get('/admin', auth, roleCheck(['admin']), adminController);
 *
 * 3. With Optional Authentication:
 * const optionalAuth = async (req, res, next) => {
 *   try {
 *     await auth(req, res, next);
 *   } catch {
 *     next();
 *   }
 * };
 */

/**
 * Troubleshooting Tips:
 * 1. Verify JWT_SECRET environment variable
 * 2. Check token format in Authorization header
 * 3. Validate token expiration
 * 4. Confirm user exists in database
 * 5. Monitor token blacklist (if implemented)
 */
