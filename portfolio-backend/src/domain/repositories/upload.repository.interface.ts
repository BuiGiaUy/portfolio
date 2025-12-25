import { Upload } from '../entities/upload.entity';

export const UPLOAD_REPOSITORY = Symbol('UPLOAD_REPOSITORY');

export interface IUploadRepository {
  create(upload: Upload): Promise<Upload>;
  findById(id: string): Promise<Upload | null>;
  findByKey(key: string): Promise<Upload | null>;
  findByUser(userId: string): Promise<Upload[]>;
  delete(id: string): Promise<void>;
}
