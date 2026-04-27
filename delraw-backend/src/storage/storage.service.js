import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { randomUUID } from 'crypto';

/**
 * Service that handles binary file storage using MongoDB GridFS.
 * Replaces the previous AWS S3 integration.
 * Files are stored in named GridFS buckets (e.g., 'products', 'documents').
 * Access files via the StorageController at GET /files/:bucket/:id
 */
@Injectable()
export class StorageService {
  constructor(@InjectConnection() connection) {
    this.connection = connection;
  }

  /**
   * Returns a GridFSBucket instance for the specified bucket name.
   * @param {string} bucketName - The logical bucket (e.g., 'products', 'documents')
   */
  getBucket(bucketName = 'uploads') {
    return new GridFSBucket(this.connection.db, { bucketName });
  }

  /**
   * Uploads a file buffer to GridFS.
   * @param {Express.Multer.File} file - The Multer file object (uses memoryStorage).
   * @param {string} folder - The GridFS bucket name to store in.
   * @returns {Promise<{ url: string; key: string }>} The access URL and GridFS ObjectId key.
   */
  async uploadFile(file, folder = 'uploads') {
    const bucket = this.getBucket(folder);
    const fileId = new ObjectId();
    const ext = file.originalname.split('.').pop();
    const filename = `${randomUUID()}.${ext}`;

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStreamWithId(fileId, filename, {
        contentType: file.mimetype,
        metadata: {
          folder,
          originalName: file.originalname,
          uploadedAt: new Date(),
        },
      });

      uploadStream.on('finish', () => {
        resolve({
          url: `/files/${folder}/${fileId.toString()}`,
          key: fileId.toString(),
        });
      });

      uploadStream.on('error', (err) => {
        console.error('[StorageService] GridFS upload error:', err);
        reject(err);
      });

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Deletes a file from GridFS by its ObjectId key.
   * @param {string} key - The GridFS ObjectId string.
   * @param {string} bucketName - The bucket the file lives in.
   */
  async deleteFile(key, bucketName = 'uploads') {
    try {
      const bucket = this.getBucket(bucketName);
      await bucket.delete(new ObjectId(key));
    } catch (err) {
      // Log but don't throw — file may have already been removed
      console.warn('[StorageService] GridFS delete warning:', err?.message);
    }
  }

  /**
   * Streams a file from GridFS directly into an HTTP response.
   * Used by StorageController to serve files to the browser.
   * @param {string} key - The GridFS ObjectId string.
   * @param {string} bucketName - The bucket the file lives in.
   * @param {Response} res - The Express response object.
   */
  async streamFile(key, bucketName, res) {
    const bucket = this.getBucket(bucketName);
    let fileId;
    try {
      fileId = new ObjectId(key);
    } catch {
      throw new NotFoundException('Invalid file ID');
    }

    // Fetch metadata to set Content-Type header
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      throw new NotFoundException('File not found');
    }

    const fileMeta = files[0];
    res.setHeader('Content-Type', fileMeta.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', fileMeta.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () => {
      res.status(404).json({ message: 'File not found' });
    });
    downloadStream.pipe(res);
  }
}
