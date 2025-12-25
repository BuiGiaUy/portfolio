import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IUploadRepository } from '../../domain/repositories/upload.repository.interface';
import { Upload } from '../../domain/entities/upload.entity';

@Injectable()
export class PrismaUploadRepository implements IUploadRepository {
  constructor(private prisma: PrismaService) {}

  async create(upload: Upload): Promise<Upload> {
    const created = await this.prisma.upload.create({
      data: {
        id: upload.id,
        key: upload.key,
        filename: upload.filename,
        contentType: upload.contentType,
        size: upload.size,
        uploadedById: upload.uploadedById,
        context: upload.context,
      },
    });

    return new Upload(
      created.id,
      created.key,
      created.filename,
      created.contentType,
      Number(created.size),
      created.uploadedById,
      created.context,
      created.createdAt,
      created.updatedAt,
    );
  }

  async findById(id: string): Promise<Upload | null> {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) return null;

    return new Upload(
      upload.id,
      upload.key,
      upload.filename,
      upload.contentType,
      Number(upload.size),
      upload.uploadedById,
      upload.context,
      upload.createdAt,
      upload.updatedAt,
    );
  }

  async findByKey(key: string): Promise<Upload | null> {
    const upload = await this.prisma.upload.findUnique({
      where: { key },
    });

    if (!upload) return null;

    return new Upload(
      upload.id,
      upload.key,
      upload.filename,
      upload.contentType,
      Number(upload.size),
      upload.uploadedById,
      upload.context,
      upload.createdAt,
      upload.updatedAt,
    );
  }

  async findByUser(userId: string): Promise<Upload[]> {
    const uploads = await this.prisma.upload.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
    });

    return uploads.map(
      (upload) =>
        new Upload(
          upload.id,
          upload.key,
          upload.filename,
          upload.contentType,
          Number(upload.size),
          upload.uploadedById,
          upload.context,
          upload.createdAt,
          upload.updatedAt,
        ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.upload.delete({
      where: { id },
    });
  }
}
