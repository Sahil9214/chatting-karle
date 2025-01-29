// src/controllers/user.controller.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import { logger } from "../utils/logger";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Exclude the current user and password field
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("_id username avatar isOnline lastSeen")
      .lean();

    logger.info(`Found ${users.length} users`);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Error in getUserProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};
