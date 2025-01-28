/**
 * @file logger.ts
 * @description Custom logger utility for consistent application logging
 *
 * This file provides a standardized logging interface with different log levels.
 * Helps in debugging, monitoring and maintaining the application.
 *
 * Benefits of custom logger:
 * 1. Consistent log format across application
 * 2. Easy to extend with additional logging services (e.g., Winston, Pino)
 * 3. Centralized control over log levels and formats
 */

/**
 * Logger Object with typed methods for different log levels
 *
 * @exports logger
 * @type {Object}
 *
 * Usage Examples:
 * logger.info("Server started on port", 3000)
 * logger.error("Database connection failed", error)
 * logger.warn("Deprecated function called", { function: 'oldMethod' })
 */
export const logger = {
  /**
   * Info level logging for general application information
   *
   * @param {string} message - Primary log message
   * @param {...any[]} args - Additional arguments to log
   *
   * Example Usage:
   * logger.info("User logged in", { userId: 123 })
   * Output: [INFO] User logged in { userId: 123 }
   */
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },

  /**
   * Error level logging for application errors and exceptions
   *
   * @param {string} message - Error description
   * @param {...any[]} args - Additional error details
   *
   * Example Usage:
   * logger.error("Failed to connect to database", error)
   * Output: [ERROR] Failed to connect to database Error: connection refused
   */
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },

  /**
   * Warning level logging for potential issues
   *
   * @param {string} message - Warning description
   * @param {...any[]} args - Additional warning context
   *
   * Example Usage:
   * logger.warn("High memory usage", { memoryUsed: "85%" })
   * Output: [WARN] High memory usage { memoryUsed: "85%" }
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
};

/**
 * Common Usage Patterns:
 *
 * 1. API Request Logging:
 * logger.info("API Request", {
 *   method: 'GET',
 *   path: '/users',
 *   duration: '123ms'
 * });
 *
 * 2. Error Handling:
 * try {
 *   // some code
 * } catch (error) {
 *   logger.error("Operation failed", error);
 * }
 *
 * 3. Deprecation Warnings:
 * logger.warn("This feature will be removed", {
 *   feature: 'oldAPI',
 *   removeDate: '2024-12-31'
 * });
 *
 * Production Considerations:
 * 1. Consider replacing console.* with proper logging library
 * 2. Add log rotation and persistence
 * 3. Add log levels (DEBUG, TRACE, etc.)
 * 4. Add timestamp to log entries
 * 5. Add request ID for request tracking
 */

// Alternative Implementation using Winston:
/**
 * import winston from 'winston';
 *
 * export const logger = winston.createLogger({
 *   level: 'info',
 *   format: winston.format.json(),
 *   transports: [
 *     new winston.transports.File({ filename: 'error.log', level: 'error' }),
 *     new winston.transports.File({ filename: 'combined.log' })
 *   ]
 * });
 */
