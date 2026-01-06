import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Request,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { Role } from '../../domain/enums/role.enum';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { CreateUploadUseCase } from '../../application/use-cases/create-upload.usecase';
import { GetUploadByIdUseCase } from '../../application/use-cases/get-upload-by-id.usecase';
import { DeleteUploadUseCase } from '../../application/use-cases/delete-upload.usecase';
import {
  RequestPresignedUrlDto,
  ConfirmUploadDto,
} from '../../application/dtos/upload.dto';
import { ConfigService } from '@nestjs/config';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
export class UploadController {
  constructor(
    private readonly storageService: StorageService,
    private readonly createUploadUseCase: CreateUploadUseCase,
    private readonly getUploadByIdUseCase: GetUploadByIdUseCase,
    private readonly deleteUploadUseCase: DeleteUploadUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('presigned-url')
  @HttpCode(HttpStatus.OK)
  async requestPresignedUrl(
    @Body() dto: RequestPresignedUrlDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    // Validate file size
    const maxFileSize = parseInt(
      this.configService.get('MAX_FILE_SIZE', '10485760'),
      10,
    );
    if (dto.size > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxFileSize} bytes`,
      );
    }

    // Validate MIME type
    const allowedMimeTypes = this.configService
      .get(
        'ALLOWED_MIME_TYPES',
        'image/jpeg,image/png,image/webp,application/pdf',
      )
      .split(',');
    if (!allowedMimeTypes.includes(dto.contentType)) {
      throw new BadRequestException(
        `Content type '${dto.contentType}' is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Generate safe object key with proper defaults
    const context = dto.context?.type || 'users';
    const contextId = (dto.context?.id || userId) ?? 'default';
    const subFolder = dto.context?.subFolder || 'documents';

    const key = this.storageService.generateSafeKey(
      context,
      contextId,
      subFolder,
      dto.filename,
    );

    // Generate presigned URL
    const result = await this.storageService.generatePresignedUploadUrl(
      key,
      dto.contentType,
      dto.size,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post('confirm')
  @HttpCode(HttpStatus.CREATED)
  async confirmUpload(@Body() dto: ConfirmUploadDto, @Request() req: any) {
    const userId = req.user.id;

    // Save upload metadata to database
    const upload = await this.createUploadUseCase.execute({
      key: dto.key,
      filename: dto.filename,
      contentType: dto.contentType,
      size: dto.size,
      uploadedById: userId,
      context: dto.context,
    });

    return {
      success: true,
      data: upload,
    };
  }

  @Get(':id/download-url')
  async getDownloadUrl(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;

    // Get upload record
    const upload = await this.getUploadByIdUseCase.execute(id);
    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    // Verify user has access to this file
    if (upload.uploadedById !== userId) {
      throw new BadRequestException('Unauthorized access to this file');
    }

    // Generate presigned download URL (valid for 1 hour)
    const downloadUrl = await this.storageService.generatePresignedDownloadUrl(
      upload.key,
      3600,
    );

    return {
      success: true,
      data: {
        downloadUrl,
        expiresIn: 3600,
      },
    };
  }

  @Delete(':id')
  async deleteUpload(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;

    // Get upload record
    const upload = await this.getUploadByIdUseCase.execute(id);
    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    // Verify user has access to delete this file
    if (upload.uploadedById !== userId) {
      throw new BadRequestException('Unauthorized to delete this file');
    }

    // Delete from storage
    await this.storageService.deleteFile(upload.key);

    // Delete from database
    await this.deleteUploadUseCase.execute(id);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}
