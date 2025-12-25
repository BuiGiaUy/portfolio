import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly presignedUrlExpiry: number;

  constructor(private configService: ConfigService) {
    const provider = this.configService.get('STORAGE_PROVIDER', 's3');
    this.presignedUrlExpiry = parseInt(
      this.configService.get('PRESIGNED_URL_EXPIRY', '60'),
      10,
    );

    if (provider === 'r2') {
      // Cloudflare R2 configuration
      const accountId = this.configService.get('R2_ACCOUNT_ID');
      this.bucket = this.configService.get('R2_BUCKET')!;

      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.configService.get('R2_ACCESS_KEY_ID')!,
          secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY')!,
        },
      });

      this.logger.log('Storage service initialized with Cloudflare R2');
    } else {
      // AWS S3 configuration
      this.bucket = this.configService.get('S3_BUCKET')!;

      this.s3Client = new S3Client({
        region: this.configService.get('AWS_REGION', 'us-east-1'),
        credentials: {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
        },
      });

      this.logger.log('Storage service initialized with AWS S3');
    }
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    contentLength: number,
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignedUrlExpiry,
    });

    this.logger.debug(`Generated presigned upload URL for key: ${key}`);

    return {
      uploadUrl,
      key,
      expiresIn: this.presignedUrlExpiry,
    };
  }

  async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    this.logger.debug(`Generated presigned download URL for key: ${key}`);

    return downloadUrl;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`Deleted file: ${key}`);
  }

  generateSafeKey(
    context: string,
    contextId: string,
    subFolder: string,
    originalFilename: string,
  ): string {
    const extension = this.extractExtension(originalFilename);
    const timestamp = Date.now();
    const uuid = uuidv4();

    const safeContext = this.sanitizePath(context);
    const safeContextId = this.sanitizePath(contextId);
    const safeSubFolder = this.sanitizePath(subFolder);

    const parts = [safeContext, safeContextId];
    if (safeSubFolder) {
      parts.push(safeSubFolder);
    }
    parts.push(`${timestamp}-${uuid}${extension}`);

    return parts.join('/');
  }

  private extractExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === filename.length - 1) {
      return '';
    }

    const ext = filename.substring(lastDot).toLowerCase();

    if (!/^\.[a-z0-9]+$/i.test(ext)) {
      return '';
    }

    return ext;
  }

  private sanitizePath(pathComponent: string): string {
    // Handle null or undefined
    if (!pathComponent) {
      return '';
    }
    
    return pathComponent
      .replace(/\.\./g, '')
      .replace(/\//g, '')
      .replace(/\\/g, '')
      .replace(/\0/g, '');
  }

}
