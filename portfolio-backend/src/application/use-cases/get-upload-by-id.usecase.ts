import { Injectable, Inject } from '@nestjs/common';
import {
  UPLOAD_REPOSITORY,
  IUploadRepository,
} from '../../domain/repositories/upload.repository.interface';
import { Upload } from '../../domain/entities/upload.entity';

@Injectable()
export class GetUploadByIdUseCase {
  constructor(
    @Inject(UPLOAD_REPOSITORY)
    private uploadRepository: IUploadRepository,
  ) {}

  async execute(id: string): Promise<Upload | null> {
    return this.uploadRepository.findById(id);
  }
}
