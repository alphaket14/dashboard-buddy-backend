import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeEmail } from "../utils/emailUtils.js";
import { generateReferralCode } from "../utils/referralUtils.js";
import StripeAccount from "../models/stripeAccount.js";
import sequelize from "../config/database.js";

export const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { firstName, lastName, email, password, isTermsAccepted } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!isTermsAccepted) {
      return res.status(400).json({ message: "You must accept the terms and conditions" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isTermsAccepted,
      verificationCode,
      referralCode: generateReferralCode(),
    }, { transaction: t });

    await sendVerificationEmail(email, verificationCode);

    await t.commit();
    res.status(201).json({ message: "User registered. Please verify email!" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: [{ model: StripeAccount, as: "stripeAccount" }] });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const user = await User.findOne({ where: { email, verificationCode } });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    // Send welcome email after successful verification
    try {
      await sendWelcomeEmail(email, user.firstName);
      console.log(`Welcome email sent to ${email} after successful verification`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the verification if welcome email fails
    }

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit number
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();
    await sendResetPasswordEmail(email, resetToken);
    console.log
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyForgotPassword = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({
      where: {
        email,
        resetPasswordToken: token,
        resetPasswordExpiry: { [Op.gt]: Date.now() }, // Check that the token is still valid (not expired)
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      where: {
        email,
        resetPasswordToken: token,
        resetPasswordExpiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "Cannot use the previous password" });
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Define request limits
    const MAX_REQUESTS = 5;
    const TIME_WINDOW = 15 * 60 * 1000;

    // Check if user has exceeded the limit
    if (
      user.verificationRequestCount >= MAX_REQUESTS &&
      Date.now() - user.lastVerificationRequestTime < TIME_WINDOW
    ) {
      return res.status(429).json({ message: "Too many requests. Try again after 15 minutes." });
    }

    // Generate a new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
    user.verificationCode = newVerificationCode;

    if (Date.now() - user.lastVerificationRequestTime > TIME_WINDOW) {
      user.verificationRequestCount = 1;
    } else {
      user.verificationRequestCount += 1;
    }
    user.lastVerificationRequestTime = Date.now();

    await user.save();


    await sendVerificationEmail(email, newVerificationCode);

    res.status(200).json({ message: "Verification email resent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
