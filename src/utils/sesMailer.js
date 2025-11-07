import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
dotenv.config();

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET_KEY,
  },
});

/**
 * Send an email using Amazon SES
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
export const sendEmailSES = async (to, subject, html) => {
  const params = {
    Source: process.env.AWS_SES_SENDER,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log("SES email sent to:", to);
  } catch (error) {
    console.error("SES email error:", error);
    throw new Error("Failed to send email via SES");
  }
};