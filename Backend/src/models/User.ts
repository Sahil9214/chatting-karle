/**
 * @file User.ts
 * @description User model for the chat application
 *
 * This file defines the MongoDB User schema and model with TypeScript integration.
 * It includes password hashing, validation, and authentication methods.
 */

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Interface Definition
 * @extends mongoose.Document to inherit MongoDB document functionality
 *
 * Key Benefits of extending Document:
 * 1. Provides MongoDB's built-in methods (_id, save(), etc.)
 * 2. Enables TypeScript type checking for MongoDB operations
 * 3. Supports IDE autocompletion for development efficiency
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string; // Optional field (?) for user profile picture
  isOnline: boolean;
  lastSeen: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * MongoDB Schema Definition for User
 *
 * @param {Schema<IUser>} defines type-safe schema structure
 * Contains fields, validations, and indexes for the User collection
 */
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Please add a username"],
      unique: true, // Creates a MongoDB unique index
      trim: true, // Automatically removes whitespace
      minlength: [3, "Username must be at least 3 characters long"],
      // Example: " john " → "john"
    },

    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true, // Ensures email uniqueness in database
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
      // Validates email format using regex
      // Example valid emails: user@domain.com, user.name@domain.co.uk
    },

    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Security: Excludes password from query results
      // To include password in query: User.findById(id).select('+password')
    },

    avatar: {
      type: String,
      default: "default-avatar.png",
      // Production Considerations:
      // 1. Use CDN URLs for better performance
      // 2. Implement Cloudinary/S3 for storage
      // 3. Add image validation (size, type, dimensions)
    },

    isOnline: {
      type: Boolean,
      default: false,
      // Used for real-time user presence feature
      // Updated via Socket.IO connection events
    },

    lastSeen: {
      type: Date,
      default: Date.now,
      // Tracks user's last activity timestamp
      // Updated on disconnect/logout events
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

/**
 * Password Hashing Middleware
 * Automatically runs before saving user document
 *
 * @important Uses regular function instead of arrow function
 * because 'this' context needs to refer to the user document
 *
 * Security Features:
 * 1. Only hashes modified passwords
 * 2. Uses industry-standard salt rounds (10)
 * 3. Prevents double-hashing of passwords
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    console.log("*** salt ***", salt);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("*** this.password ***", this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Password Comparison Method
 * Securely compares user-entered password with stored hash
 *
 * @param {string} candidatePassword - The password to verify
 * @returns {Promise<boolean>} True if passwords match
 *
 * Security Features:
 * 1. Uses bcrypt's timing-safe comparison
 * 2. Automatically handles salt extraction
 * 3. Prevents timing attacks
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

/**
 * Create and export the User model
 *
 * Usage Examples:
 * 1. Create user: await User.create({ username, email, password })
 * 2. Find user: await User.findOne({ email })
 * 3. Update user: await User.findByIdAndUpdate(id, { isOnline: true })
 */
export const User = mongoose.model<IUser>("User", userSchema);

/**
 * Common Queries Reference:
 *
 * Find user by ID:
 * const user = await User.findById(id);
 *
 * Find user with password:
 * const user = await User.findById(id).select('+password');
 *
 * Update online status:
 * await User.findByIdAndUpdate(id, { isOnline: true, lastSeen: new Date() });
 *
 * Find by email (for authentication):
 * const user = await User.findOne({ email }).select('+password');
 */
