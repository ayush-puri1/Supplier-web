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
}
