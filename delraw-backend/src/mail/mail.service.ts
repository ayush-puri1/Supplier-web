import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
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

  async sendSupplierApproved(email: string, businessName: string) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Account Verified - Supplier Portal',
      text: `Hello ${businessName},\n\nYour supplier account has been verified. You can now log in and start adding products to the portal.\n\nBest regards,\nSupplier Portal Team`,
    });
  }

  async sendSupplierRejected(email: string, businessName: string, reason: string) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Account Application Rejected - Supplier Portal',
      text: `Hello ${businessName},\n\nUnfortunately, your supplier application has been rejected for the following reason:\n\n${reason}\n\nPlease contact support if you have any questions.\n\nBest regards,\nSupplier Portal Team`,
    });
  }

  async sendProductApproved(email: string, productName: string) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Product Approved - Supplier Portal',
      text: `Hello,\n\nYour product "${productName}" has been approved and is now live on the portal.\n\nBest regards,\nSupplier Portal Team`,
    });
  }

  async sendProductRejected(email: string, productName: string, reason: string) {
    await this.transporter.sendMail({
      from: `"Supplier Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Product Rejected - Supplier Portal',
      text: `Hello,\n\nYour product "${productName}" has been rejected for the following reason:\n\n${reason}\n\nBest regards,\nSupplier Portal Team`,
    });
  }
}
