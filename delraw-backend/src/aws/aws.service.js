import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

/**
 * Service to handle operations with AWS S3, such as uploading and deleting files.
 * Used primarily for storing product images and legal documents.
 */
@Injectable()
export class AwsService {
  constructor() {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';

    if (!region || !accessKeyId || !secretAccessKey || !this.bucketName) {
      console.warn(
        'AWS credentials are not fully configured in the .env file.',
      );
    }

    this.s3Client = new S3Client({
      region: region || 'ap-south-1',
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  /**
   * Uploads a file buffer to an S3 bucket.
   * @param {Object} file - The file object from Multer (Express.Multer.File equivalent).
   * @param {string} folder - The target folder in the bucket (default: 'uploads').
   * @returns {Promise<{ url: string; key: string }>} - The URL and unique S3 key for the file.
   */
  async uploadFile(file, folder = 'uploads') {
    try {
      const fileId = randomUUID();
      const extension = file.originalname.split('.').pop();
      const key = `${folder}/${fileId}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
      return { url, key };
    } catch (error) {
      console.error('Error uploading file to S3', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Deletes a file from the S3 bucket using its key.
   * @param {string} key - The unique S3 key of the object to delete.
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3', error);
    }
  }
}
