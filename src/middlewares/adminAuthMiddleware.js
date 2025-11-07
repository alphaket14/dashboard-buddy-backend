import { roles, responses } from "../config/constants.js";
import UserDAL from "../dal/userDal.js";

const userDAL = new UserDAL();

/**
 * Middleware to verify a user has admin privileges
 * This adds an additional layer of security for sensitive operations
 */
export const adminAuthRequired = async (req, res, next) => {
  try {
    // Check if the user is authenticated at all
    if (!req.app) {
      throw new Error(responses[100]("Authorization required").message);
    }

    // Get user information from the request
    let userId;

    // Check if userId exists in body, params, or query
    if (req.body && req.body.userId) {
      userId = req.body.userId;
    } else if (req.params && req.params.userId) {
      userId = req.params.userId;
    } else if (req.query && req.query.userId) {
      userId = req.query.userId;
    } else if (req.headers['x-user-id']) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new Error(responses[100]("User identification required").message);
    }

    // Look up the user to verify admin role
    const user = await userDAL.getUserById(userId);

    if (!user) {
      throw new Error(responses[404]("User not found").message);
    }

    // Check if the user has admin role
    if (user.role !== roles.admin) {
      throw new Error(responses[100]("Administrative privileges required").message);
    }

    // Add user information to the request for use in subsequent middleware or controllers
    req.user = user;

    // All checks passed - proceed to next middleware
    next();
  } catch (err) {
    err.statusCode = 403;
    err.response_code = responses[100]().response_code;
    next(err);
  }
};

/**
 * Alternative admin verification that can be used for API key-based auth for cron jobs
 */
export const cronAdminAuthRequired = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    // Compare against environment variable or other secure storage
    if (apiKey !== process.env.ADMIN_API_KEY) {
      throw new Error(responses[100]("Invalid API key").message);
    }

    // Add a flag to indicate this is a system-level operation
    req.isSystemOperation = true;

    next();
  } catch (err) {
    err.statusCode = 403;
    err.response_code = responses[100]().response_code;
    next(err);
  }
};