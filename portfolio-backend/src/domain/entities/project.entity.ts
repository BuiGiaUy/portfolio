export class Project {
  constructor(
    public readonly id: string,
    public title: string,
    public slug: string,
    public shortDescription: string,
    public content: string,
    public techStack: string[],
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public thumbnailUrl?: string,
    public githubUrl?: string,
    public demoUrl?: string,
    public views?: number, // Computed from ProjectStats
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
    if (!this.slug) {
      throw new Error('Project slug is required');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(this.slug)) {
      throw new Error(
        'Project slug must be URL-friendly (lowercase letters, numbers, and hyphens)',
      );
    }
    if (!this.shortDescription) {
      throw new Error('Project short description is required');
    }
    if (this.shortDescription.length > 200) {
      throw new Error(
        'Project short description must not exceed 200 characters',
      );
    }
    if (!this.content) {
      throw new Error('Project content is required');
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
   * Business logic: Update project slug
   */
  updateSlug(slug: string): void {
    if (!slug) {
      throw new Error('Project slug is required');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(
        'Project slug must be URL-friendly (lowercase letters, numbers, and hyphens)',
      );
    }
    this.slug = slug;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Update project short description
   */
  updateShortDescription(shortDescription: string): void {
    if (!shortDescription) {
      throw new Error('Project short description is required');
    }
    if (shortDescription.length > 200) {
      throw new Error(
        'Project short description must not exceed 200 characters',
      );
    }
    this.shortDescription = shortDescription;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Update project content
   */
  updateContent(content: string): void {
    if (!content) {
      throw new Error('Project content is required');
    }
    this.content = content;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Update tech stack
   */
  updateTechStack(techStack: string[]): void {
    this.techStack = techStack;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Update thumbnail URL
   */
  updateThumbnailUrl(thumbnailUrl?: string): void {
    this.thumbnailUrl = thumbnailUrl;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Update GitHub URL
   */
  updateGithubUrl(githubUrl?: string): void {
    this.githubUrl = githubUrl;
    this.updatedAt = new Date();
  }

  /**
   * Business logic: Update demo URL
   */
  updateDemoUrl(demoUrl?: string): void {
    this.demoUrl = demoUrl;
    this.updatedAt = new Date();
  }

  /**
   * Helper: Generate slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
  }
}
