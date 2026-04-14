import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Service to handle all email-related tasks, such as sending OTPs and notifications.
 * It uses Nodemailer with Gmail SMTP.
 */
@Injectable()
export class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  /**
   * Sends a one-time password to a user's email for registration or password reset.
   * @param {string} to - The recipient's email address.
   * @param {string} otp - The 6-digit one-time password.
   */
  async sendOtpEmail(to, otp) {
    try {
      await this.transporter.sendMail({
        from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Your Supplier Portal Registration OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Supplier Registration</h2>
            <p>Your one-time password (OTP) to register as a supplier is:</p>
            <h1 style="color: #4CAF50;">${otp}</h1>
            <p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  /**
   * Notifies a supplier that their account has been verified.
   * @param {string} email
   * @param {string} businessName
   */
  async sendSupplierApproved(email, businessName) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Account Verified - Supplier Portal',
      text: `Hello ${businessName},\n\nYour supplier account has been verified. You can now log in and start adding products to the portal.\n\nBest regards,\nSupplier Portal Team`,
    });
  }

  /**
   * Notifies a supplier that their application was rejected.
   * @param {string} email
   * @param {string} businessName
   * @param {string} reason
   */
  async sendSupplierRejected(email, businessName, reason) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Account Application Rejected - Supplier Portal',
      text: `Hello ${businessName},\n\nUnfortunately, your supplier application has been rejected for the following reason:\n\n${reason}\n\nPlease contact support if you have any questions.\n\nBest regards,\nSupplier Portal Team`,
    });
  }

  /**
   * Notifies a supplier that their product has been approved.
   * @param {string} email
   * @param {string} productName
   */
  async sendProductApproved(email, productName) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Product Approved - Supplier Portal',
      text: `Hello,\n\nYour product "${productName}" has been approved and is now live on the portal.\n\nBest regards,\nSupplier Portal Team`,
    });
  }

  /**
   * Notifies a supplier that their product was rejected.
   * @param {string} email
   * @param {string} productName
   * @param {string} reason
   */
  async sendProductRejected(email, productName, reason) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Product Rejected - Supplier Portal',
      text: `Hello,\n\nYour product "${productName}" has been rejected for the following reason:\n\n${reason}\n\nBest regards,\nSupplier Portal Team`,
    });
  }

  /**
   * Sends an admin invitation email with login instructions.
   * @param {string} email  - The new admin's email address.
   * @param {string} role   - The role being assigned (ADMIN or SUPER_ADMIN).
   */
  async sendAdminInvite(email, role = 'ADMIN') {
    const loginUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/login`
      : 'https://delraw.com/login';

    await this.transporter.sendMail({
      from: `"Delraw Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'You have been invited as a Delraw Admin',
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F1F5F9; padding: 40px; border-radius: 16px;">
          <div style="margin-bottom: 32px;">
            <div style="display: inline-block; background: #2563EB; color: white; font-weight: 700; font-size: 16px; padding: 8px 16px; border-radius: 8px;">Delraw</div>
          </div>
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #fff;">You're invited to the Admin Team</h2>
          <p style="font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px;">
            A Super Admin has granted you access to the Delraw platform with the role of 
            <strong style="color: #60A5FA;">${role.replace('_', ' ')}</strong>.
          </p>
          <p style="font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 32px;">
            Use your email address <strong style="color: #F1F5F9;">${email}</strong> to log in. 
            You will be prompted to set your password on first login.
          </p>
          <a href="${loginUrl}" style="display: inline-block; background: #2563EB; color: white; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
            Access Admin Portal →
          </a>
          <p style="font-size: 11px; color: #475569; margin-top: 32px;">
            If you did not expect this invitation, please ignore this email or contact support@delraw.com.
          </p>
        </div>
      `,
    });
  }
}
