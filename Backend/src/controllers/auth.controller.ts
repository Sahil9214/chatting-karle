/**
 * @file auth.controller.ts
 * @description Authentication controller handling user registration and login
 *
 * This controller implements the core authentication logic including
 * user registration, login, and token generation. It integrates with
 * the User model and implements secure password handling.
 */

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();
/**
 * User registration controller
 *
 * @async
 * @function register
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 *
 * Expected request body:
 * {
 *   "username": string,
 *   "email": string,
 *   "password": string
 * }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, avatar } = req.body;

    // Input validation
    if (!username || !email || !password) {
      logger.warn("Registration failed: Missing required fields", {
        provided: {
          username: !!username,
          email: !!email,
          password: !!password,
        },
      });

      res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      logger.warn("Registration failed: User already exists", {
        email,
        username,
      });

      res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
      return;
    }

    // Create new user with avatar if provided
    const user = new User({
      username,
      email,
      password,
      ...(avatar && { avatar }), // Only include avatar if it's provided
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    logger.info("User registered successfully", {
      userId: user._id,
      username: user.username,
    });

    // Return success without password
    const userWithoutPassword = user.toObject();
    const { password: _, ...userResponse } = userWithoutPassword;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
    });
  }
};

/**
 * User login controller
 *
 * @async
 * @function login
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 *
 * Expected request body:
 * {
 *   "email": string,
 *   "password": string
 * }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log("*** email ***", email);
    console.log("*** password ***", password);
    // Input validation

    if (!email || !password) {
      logger.warn("Login failed: Missing credentials", {
        provided: { email: !!email, password: !!password },
      });

      res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
      return;
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      logger.warn("Login failed: User not found", { email });
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn("Login failed: Invalid password", { userId: user._id });
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    logger.info("User logged in successfully", {
      userId: user._id,
      username: user.username,
    });

    // Return success without password
    const userWithoutPassword = user.toObject();
    const { password: _, ...userResponse } = userWithoutPassword;

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Update user's online status
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    logger.info("User logged out successfully:", { userId });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

/**
 * Production Considerations:
 * ... [rest of the comments remain the same]
 */
