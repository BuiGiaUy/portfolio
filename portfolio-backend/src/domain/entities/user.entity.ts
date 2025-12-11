import { Role } from '../enums/role.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public passwordHash: string,
    public role: Role,
    public refreshTokenHash: string | null,
    public active: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id) {
      throw new Error('User ID is required');
    }
    if (!this.email) {
      throw new Error('User email is required');
    }
    if (!this.validateEmail(this.email)) {
      throw new Error('Invalid email format');
    }
    if (!this.passwordHash) {
      throw new Error('User password hash is required');
    }
    if (!this.role) {
      throw new Error('User role is required');
    }
    if (this.active === undefined || this.active === null) {
      throw new Error('User active status is required');
    }
    if (!this.createdAt) {
      throw new Error('User creation date is required');
    }
    if (!this.updatedAt) {
      throw new Error('User update date is required');
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Business logic: Update refresh token
   */
  updateRefreshToken(refreshTokenHash: string | null): void {
    this.refreshTokenHash = refreshTokenHash;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Deactivate user
   */
  deactivate(): void {
    this.active = false;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Activate user
   */
  activate(): void {
    this.active = true;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Verify password
   */
  verifyPassword(hash: string): boolean {
    return this.passwordHash === hash;
  }

  /**
   * Business logic: Change password
   */
  changePassword(newPasswordHash: string): void {
    if (!newPasswordHash) {
      throw new Error('User password hash is required');
    }
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }
}
