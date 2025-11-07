import { sendEmailSES } from "../utils/sesMailer.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Sends a contact email to customer service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendContactEmail = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ 
        error: "All fields (firstName, lastName, email, phone, message) are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const customerServiceEmail = process.env.CUSTOMER_SERVICE_EMAIL || "Customer.Service@FaulconEnterprises.com";
    const subject = `New Contact Message from ${firstName} ${lastName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #495057; margin-top: 0;">Contact Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
        </div>
        
        <div style="background-color: #fff; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #495057; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; color: #6c757d;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 10px; background-color: #e9f4ff; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #0066cc;">
            This message was sent through the ReferMe contact form. Please respond directly to the sender's email address: ${email}
          </p>
        </div>
      </div>
    `;

    await sendEmailSES(customerServiceEmail, subject, html);
    
    console.log(`Contact email sent successfully to ${customerServiceEmail} from ${firstName} ${lastName} (${email})`);
    
    res.status(200).json({ 
      success: true, 
      message: "Email sent successfully!" 
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ 
      error: "Internal server error. Please try again later." 
    });
  }
};