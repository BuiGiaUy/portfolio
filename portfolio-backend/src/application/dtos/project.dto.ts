/**
 * Application Layer DTOs
 *
 * DTOs are used to transfer data between layers.
 * They have no business logic and no dependencies.
 */
import { IsString, IsArray, IsOptional, IsNotEmpty, IsUrl, ArrayMinSize } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  shortDescription!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  techStack!: string[];

  // userId is injected from auth, not from request body
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'githubUrl must be a valid URL' })
  githubUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'demoUrl must be a valid URL' })
  demoUrl?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'githubUrl must be a valid URL' })
  githubUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'demoUrl must be a valid URL' })
  demoUrl?: string;
}

export class ProjectResponseDto {
  id!: string;
  title!: string;
  slug!: string;
  shortDescription!: string;
  content!: string;
  techStack!: string[];
  userId!: string;
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;
  views?: number; // View count from ProjectStats
}

