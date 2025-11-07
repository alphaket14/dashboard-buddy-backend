import User from "../models/user.js";
import { enhanceUserWithProfileImage } from "../utils/userUtils.js";
import { uploadFileToS3, getSignedFileUrl, getPublicFileUrl } from "../utils/s3Utils.js";
import StripeAccount from "../models/stripeAccount.js";
import EarningHistory from "../models/earningHistory.js";

const UserController = {
  getAllUsers: async (req, res) => {
    try {
      // Parse query parameters with default values
      const page = parseInt(req.query.page) || 1; // default to page 1
      const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
      const offset = (page - 1) * limit;

      // Find users with pagination using Sequelize
      const { count, rows: users } = await User.findAndCountAll({
        offset,
        limit,
      });

      // Calculate total pages
      const totalPages = Math.ceil(count / limit);

      // Return response with pagination metadata
      const usersWithType = users.map(user => ({
        ...user.get({ plain: true }),
        userType: user.payoneerEmail ? "Payoneer" : user.stripeAccount ? "Stripe" : "-",
      }));

      res.status(200).json({
        data: usersWithType,
        pagination: {
          total: count,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getUserById: async (req, res) => {
    try {
      const id = req.user.id;
      const userDb = await User.findByPk(id, {
        include: [{ model: StripeAccount, as: "stripeAccount" }],
      });

      if (!userDb) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log({ userDb });
      // Convert to plain object
      const user = userDb.get({ plain: true });

      // Enhance with profile image signed URL
      const enhancedUser = await enhanceUserWithProfileImage(user);

      res.status(200).json(enhancedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserForAdmin: async (req, res) => {
    const userId = req.params.id;

    try {
      const userDb = await User.findByPk(userId, {
        include: [
          {
            model: EarningHistory,
            as: "earnings",
            where: {
              paymentStatus: "paid",
            },
            required: false,
          },
        ],
      });

      if (!userDb) {
        return res.status(404).json({ message: "User not found" });
      }

      // Convert to plain object
      const user = userDb.get({ plain: true });

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, payoneerEmail } = req.body;

      // Fetch the existing user
      const existingUser = await User.findByPk(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the email is being updated
      if (email && email !== existingUser.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      let profilePictureUrl = existingUser.profilePictureUrl;

      // Check if a new profile picture is uploaded
      if (req.file) {
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const mimeType = req.file.mimetype;

        try {
          // Upload to S3
          const s3Key = await uploadFileToS3(
            fileBuffer,
            fileName,
            mimeType,
            "user-profile-pictures"
          );
          // Generate permanent public URL instead of temporary signed URL
          profilePictureUrl = getPublicFileUrl(s3Key);
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          return res
            .status(500)
            .json({ error: "Failed to upload profile picture" });
        }
      }

      // Update user details
      existingUser.firstName = firstName || existingUser.firstName;
      existingUser.lastName = lastName || existingUser.lastName;
      existingUser.email = email || existingUser.email;
      existingUser.payoneerEmail = payoneerEmail || existingUser.payoneerEmail;
      existingUser.profilePictureUrl =
        profilePictureUrl || "https://v0.dev/placeholder.svg"; // Default placeholder

      // Save the updated user
      await existingUser.save();

      res.status(200).json({
        message: profilePictureUrl
          ? "User updated with profile picture"
          : "User updated successfully",
        user: {
          id: existingUser.id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          profilePictureUrl: existingUser.profilePictureUrl,
          payoneerEmail: existingUser.payoneerEmail,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await User.destroy({ where: { id: id } });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteAllUsers: async (req, res) => {
    try {
      await User.destroy({ where: {}, truncate: true });
      res.wstatus(200).json({ message: "All users deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default UserController;
