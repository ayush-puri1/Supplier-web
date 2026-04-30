import { Injectable, Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class StorageService {
  constructor(@InjectConnection() connection) {
    this.connection = connection;
    this.buckets = new Map();
  }

  getBucket(bucketName) {
    if (!this.buckets.has(bucketName)) {
      const bucket = new GridFSBucket(this.connection.db, { bucketName });
      this.buckets.set(bucketName, bucket);
    }
    return this.buckets.get(bucketName);
  }

  async uploadFile(file, bucketName) {
    try {
      const bucket = this.getBucket(bucketName);
      
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalname, {
          contentType: file.mimetype,
        });

        uploadStream.on('error', (error) => {
          reject(new InternalServerErrorException('Failed to upload file to GridFS'));
        });

        uploadStream.on('finish', () => {
          resolve(uploadStream.id.toString());
        });

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      throw new InternalServerErrorException('Error processing file upload');
    }
  }

  async getFileStream(fileId, bucketName) {
    try {
      const bucket = this.getBucket(bucketName);
      const id = new ObjectId(fileId);
      
      const files = await bucket.find({ _id: id }).toArray();
      if (!files || files.length === 0) {
        throw new NotFoundException('File not found in GridFS');
      }

      const stream = bucket.openDownloadStream(id);
      return { stream, metadata: files[0] };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error retrieving file from GridFS');
    }
  }

  async deleteFile(fileId, bucketName) {
    try {
      const bucket = this.getBucket(bucketName);
      const id = new ObjectId(fileId);
      await bucket.delete(id);
    } catch (error) {
      console.error(`GridFS Delete Error: ${error.message}`);
    }
  }
}
