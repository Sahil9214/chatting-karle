import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import cloudinary from "../utils/cloudinary";
import { logger } from "../utils/logger";

const router = express.Router();

// Extend Request type to include file from multer
interface MulterRequest extends Request {
  file?: any; // Using any since Express.Multer type is not available
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (
    _req: Request,
    file: any, // Using any since Express.Multer type is not available
    cb: FileFilterCallback
  ) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG files are allowed"));
    }
  },
});

// Upload route handler
router.post(
  "/",
  upload.single("avatar"),
  async (req: MulterRequest, res: Response): Promise<Response> => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Convert buffer to base64
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      // Upload to Cloudinary with optimized settings
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: "avatars",
        resource_type: "auto",
        allowed_formats: ["jpg", "png", "jpeg"],
        quality: "auto",
        fetch_format: "auto",
        width: 500,
        height: 500,
        crop: "fill",
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
        ],
      });

      logger.info("File uploaded to Cloudinary:", {
        publicId: uploadResponse.public_id,
        url: uploadResponse.secure_url,
      });

      return res.status(200).json({
        success: true,
        url: uploadResponse.secure_url,
      });
    } catch (error) {
      logger.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

export default router;
