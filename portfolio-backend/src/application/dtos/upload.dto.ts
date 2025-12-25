import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UploadContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string; // 'users', 'projects', etc.

  @IsOptional()
  @IsString()
  @MaxLength(100)
  id?: string; // userId, projectId, etc.

  @IsOptional()
  @IsString()
  @MaxLength(50)
  subFolder?: string; // 'avatars', 'documents', etc.
}

export class RequestPresignedUrlDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @Matches(/^[a-z]+\/[a-z0-9+.-]+$/, {
    message: 'Invalid content type format',
  })
  contentType!: string;

  @IsNumber()
  @Min(1)
  @Max(52428800) // 50MB absolute maximum
  size!: number;

  @IsOptional()
  @IsObject()
  @Type(() => UploadContextDto)
  context?: UploadContextDto;
}

export class ConfirmUploadDto {
  @IsString()
  @MaxLength(500)
  key!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  contentType!: string;

  @IsNumber()
  @Min(1)
  size!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  context?: string;
}
