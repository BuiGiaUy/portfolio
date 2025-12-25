import { Injectable, Inject } from '@nestjs/common';
import {
  UPLOAD_REPOSITORY,
  IUploadRepository,
} from '../../domain/repositories/upload.repository.interface';

@Injectable()
export class DeleteUploadUseCase {
  constructor(
    @Inject(UPLOAD_REPOSITORY)
    private uploadRepository: IUploadRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.uploadRepository.delete(id);
  }
}
