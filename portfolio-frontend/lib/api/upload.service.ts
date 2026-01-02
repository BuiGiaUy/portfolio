import { apiClient } from './index';

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
  context?: {
    type?: string;
    id?: string;
    subFolder?: string;
  };
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface ConfirmUploadRequest {
  key: string;
  filename: string;
  contentType: string;
  size: number;
  context?: string;
}

export interface UploadRecord {
  id: string;
  key: string;
  filename: string;
  contentType: string;
  size: number;
  context: string | null;
  createdAt: string;
}

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class UploadService {
  static async requestPresignedUrl(
    request: PresignedUrlRequest,
  ): Promise<PresignedUrlResponse> {
    // apiClient.post already returns response.data, which is { success, data }
    const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
      '/upload/presigned-url',
      request,
    );
    return response.data;
  }

static async uploadToStorage(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round(
          (event.loaded / event.total) * 100,
        );
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        console.error('Upload failed:', xhr.status, xhr.responseText);
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', (e) => {
      console.error('XHR Error:', e);
      reject(new Error('Upload failed due to network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    xhr.open('PUT', uploadUrl);
    
    // CHỈ set Content-Type header
    xhr.setRequestHeader('Content-Type', file.type);
    
    // Send file directly as binary
    xhr.send(file);
  });
}

  static async confirmUpload(
    request: ConfirmUploadRequest,
  ): Promise<UploadRecord> {
    // apiClient.post already returns response.data, which is { success, data }
    const response = await apiClient.post<ApiResponse<UploadRecord>>(
      '/upload/confirm',
      request,
    );
    return response.data;
  }

  static async uploadFile(
    file: File,
    context?: PresignedUrlRequest['context'],
    onProgress?: (progress: number) => void,
  ): Promise<UploadRecord> {
    try {
      const presignedData = await this.requestPresignedUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        context,
      });

      console.log('Presigned URL response:', presignedData);

      if (!presignedData || !presignedData.uploadUrl) {
        throw new Error('Invalid presigned URL response from server');
      }

      await this.uploadToStorage(file, presignedData.uploadUrl, onProgress);


    const uploadRecord = await this.confirmUpload({
      key: presignedData.key,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      context: context ? JSON.stringify(context) : undefined,
    });

    return uploadRecord;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  static async getDownloadUrl(uploadId: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ downloadUrl: string; expiresIn: number }>>(
      `/upload/${uploadId}/download-url`
    );
    return response.data.downloadUrl;
  }

  static async deleteUpload(uploadId: string): Promise<void> {
    await apiClient.delete(`/upload/${uploadId}`);
  }
}
