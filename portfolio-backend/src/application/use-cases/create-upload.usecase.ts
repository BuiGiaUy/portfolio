import { Injectable, Inject } from '@nestjs/common';
import {
  UPLOAD_REPOSITORY,
  IUploadRepository,
} from '../../domain/repositories/upload.repository.interface';
import { Upload } from '../../domain/entities/upload.entity';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUploadData {
  key: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedById: string;
  context?: string;
}

@Injectable()
export class CreateUploadUseCase {
  constructor(
    @Inject(UPLOAD_REPOSITORY)
    private uploadRepository: IUploadRepository,
  ) {}

  async execute(data: CreateUploadData): Promise<Upload> {
    const upload = new Upload(
      uuidv4(),
      data.key,
      data.filename,
      data.contentType,
      data.size,
      data.uploadedById,
      data.context || null,
      new Date(),
      new Date(),
    );

    return this.uploadRepository.create(upload);
  }
}
