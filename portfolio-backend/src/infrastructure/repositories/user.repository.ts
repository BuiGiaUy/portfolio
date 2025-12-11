import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../database/prisma.service';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return UserPersistenceMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return UserPersistenceMapper.toDomain(user);
  }

  async save(user: User): Promise<User> {
    const savedUser = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        passwordHash: user.passwordHash,
        role: user.role,
        refreshTokenHash: user.refreshTokenHash,
        active: user.active,
        updatedAt: user.updatedAt,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        refreshTokenHash: user.refreshTokenHash,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    return UserPersistenceMapper.toDomain(savedUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return UserPersistenceMapper.toDomainList(users);
  }

  async updateRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
}
