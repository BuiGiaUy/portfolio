export class Project {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public views: number = 0,
    public version: number = 1,
    public status?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id) {
      throw new Error('Project ID is required');
    }
    if (!this.title) {
      throw new Error('Project title is required');
    }
    if (this.title.length < 3) {
      throw new Error('Project title must be at least 3 characters long');
    }
    if (this.title.length > 100) {
      throw new Error('Project title must not exceed 100 characters');
    }
    if (!this.description) {
      throw new Error('Project description is required');
    }
    if (!this.userId) {
      throw new Error('Project userId is required');
    }
    if (!this.createdAt) {
      throw new Error('Project creation date is required');
    }
    if (!this.updatedAt) {
      throw new Error('Project update date is required');
    }
  }

  /**
   * Business logic: Update project title
   */
  updateTitle(title: string): void {
    if (!title || title.length < 3) {
      throw new Error('Project title must be at least 3 characters long');
    }
    if (title.length > 100) {
      throw new Error('Project title must not exceed 100 characters');
    }
    this.title = title;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Update project description
   */
  updateDescription(description: string): void {
    if (!description) {
      throw new Error('Project description is required');
    }
    this.description = description;
    this.updatedAt = new Date();
  }
}
