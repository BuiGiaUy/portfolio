import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';
import { Role } from 'src/domain/enums/role.enum';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('projects')
  @Roles(Role.OWNER, Role.VIEWER)
  getProjects() {
    return {
      message: 'List of projects',
      data: [
        { id: '1', title: 'Project 1', status: 'active' },
        { id: '2', title: 'Project 2', status: 'completed' },
      ],
    };
  }

  @Post('projects')
  @Roles(Role.OWNER)
  createProject() {
    return {
      message: 'Project created successfully',
      data: { id: '3', title: 'New Project', status: 'active' },
    };
  }

  @Patch('projects/:id')
  @Roles(Role.OWNER)
  updateProject(@Param('id') id: string) {
    return {
      message: `Project ${id} updated successfully`,
      data: { id, title: 'Updated Project', status: 'active' },
    };
  }

  @Delete('projects/:id')
  @Roles(Role.OWNER)
  deleteProject(@Param('id') id: string) {
    return {
      message: `Project ${id} deleted successfully`,
    };
  }
}
