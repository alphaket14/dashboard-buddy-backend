import bcrypt from "bcryptjs";
import { sendEmailSES } from "./sesMailer.js";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Sends a verification email to the specified email address
 * @param {string} email - The recipient's email address
 * @param {string} verificationCode - The verification code to include in the email
 */
export const sendVerificationEmail = async (email, verificationCode) => {
  const subject = "Email Verification";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Thank you for registering with our service. Please use the code below to verify your email address:</p>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; margin: 20px 0; border-radius: 3px;">
        <h3 style="margin: 0; font-size: 24px; letter-spacing: 2px;">${verificationCode}</h3>
      </div>
      <p>This code will expire in 24 hours.</p>
      <p>If you didn't request this verification, please ignore this email.</p>
      <p>Best regards,<br>The ReferMe Team</p>
    </div>
  `;

  try {
    await sendEmailSES(email, subject, html);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Sends a password reset email to the specified email address
 * @param {string} email - The recipient's email address
 * @param {string} resetToken - The reset token to include in the email
 */
export const sendResetPasswordEmail = async (email, resetToken) => {
  const subject = "Password Reset";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>We received a request to reset your password. Please use the code below to reset your password:</p>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; margin: 20px 0; border-radius: 3px;">
        <h3 style="margin: 0; font-size: 24px; letter-spacing: 2px;">${resetToken}</h3>
      </div>
      <p>This code will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Best regards,<br>The ReferMe Team</p>
    </div>
  `;

  try {
    await sendEmailSES(email, subject, html);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Sends a welcome email to the user after successful email verification
 * @param {string} email - The recipient's email address
 * @param {string} firstName - The user's first name
 */
export const sendWelcomeEmail = async (email, firstName) => {
  const subject = "Welcome to ReferMe 🚀 Your journey starts now";
  const html = `
    <div style="font-family: 'Urbanist', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
      <!-- Header with Logo -->
      <div style="text-align: center; padding: 40px 20px 30px; background: linear-gradient(135deg, #00D066 0%, #00B57A 100%);">
        <img src="https://referme-production.s3.eu-north-1.amazonaws.com/images/Logo.png" 
             alt="ReferMe Logo" 
             style="max-width: 120px; height: auto; margin-bottom: 20px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          Welcome to ReferMe 🚀
        </h1>
        <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">
          Your journey starts now
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 40px 30px;">
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px; font-weight: 600;">
            Hi ${firstName},
          </h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Welcome to ReferMe — you're officially part of a movement reshaping how money flows in our economy.
          </p>
        </div>
        
        <!-- Action Steps -->
        <div style="background-color: #f7fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #00D066;">
          <h3 style="color: #1a1a1a; margin: 0 0 20px; font-size: 18px; font-weight: 600;">
            Here's what happens next:
          </h3>
          <div style="margin-bottom: 15px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="color: #00D066; font-size: 18px; margin-right: 12px;">✅</span>
              <span style="color: #4a5568; font-size: 16px;">Log in to your dashboard</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="color: #00D066; font-size: 18px; margin-right: 12px;">✅</span>
              <span style="color: #4a5568; font-size: 16px;">Add your first trusted business</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="color: #00D066; font-size: 18px; margin-right: 12px;">✅</span>
              <span style="color: #4a5568; font-size: 16px;">Join our BPM Community Group</span>
            </div>
          </div>
        </div>
        
        <!-- Call to Action -->
        <div style="background: linear-gradient(135deg, #00D066 0%, #00B57A 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px; font-weight: 500;">
            The sooner you add your first business, the sooner you'll see your portfolio come alive.
          </p>
          <a href="https://web.facebook.com/share/g/17JzmfDbZy/" 
             style="display: inline-block; background-color: #ffffff; color: #00D066; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 10px;">
            Join BPM Community Group
          </a>
        </div>
        
        <!-- Pro Tip -->
        <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f56565;">
          <div style="display: flex; align-items: flex-start;">
            <span style="color: #f56565; font-size: 20px; margin-right: 12px; margin-top: 2px;">💡</span>
            <div>
              <p style="color: #4a5568; font-size: 16px; margin: 0; font-weight: 500;">
                Pro tip: Start with 3–5 businesses you already know personally.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Closing -->
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
          <p style="color: #4a5568; font-size: 16px; margin: 0 0 10px; font-weight: 500;">
            Let's build your future, together.
          </p>
          <p style="color: #718096; font-size: 14px; margin: 0;">
            — Team ReferMe
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmailSES(email, subject, html);
    console.log("Welcome email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendWeeklyPayoutEmail = async ({
  email,
  bpmName,
  startDate,
  endDate,
  totalAmountEarned,
  completedReferrals,
  totalPaid,
}) => {
  const subject = "Your Weekly Earnings Summary";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333;">Hi ${bpmName},</h2>
      <p>We are pleased to provide you with your weekly earnings summary for the period from ${startDate} to ${endDate}.</p>
      
      <h3 style="color: #444; margin-top: 25px;">Here's a breakdown of your earnings:</h3>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Total Earnings:</strong> $${totalAmountEarned.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Total Referrals:</strong> ${completedReferrals}</p>
        <p style="margin: 5px 0;"><strong>Total Paid This Week:</strong> $${totalPaid.toFixed(2)}</p>
      </div>
      
      <p>If you have any questions regarding your earnings or need further details, please feel free to reach out to our support team.</p>
      
      <p>Thank you for being a valued part of Referme. We appreciate your continued dedication and look forward to another successful week!</p>
      
      <p>Best regards,<br>The Referme Team</p>
    </div>
  `;

  try {
    await sendEmail(email, subject, html);
    console.log("Weekly payout email sent successfully to BPM");
  } catch (error) {
    console.error("Error sending weekly payout email:", error);
    throw new Error("Failed to send weekly payout email");
  }
};
