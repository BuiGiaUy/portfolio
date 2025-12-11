export class Comment {
  constructor(
    public readonly id: string,
    public content: string,
    public readonly userId: string,
    public readonly projectId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id) {
      throw new Error('Comment ID is required');
    }
    if (!this.content) {
      throw new Error('Comment content is required');
    }
    if (this.content.length < 1) {
      throw new Error('Comment content must be at least 1 character long');
    }
    if (this.content.length > 500) {
      throw new Error('Comment content must not exceed 500 characters');
    }
    if (!this.userId) {
      throw new Error('Comment userId is required');
    }
    if (!this.projectId) {
      throw new Error('Comment projectId is required');
    }
    if (!this.createdAt) {
      throw new Error('Comment creation date is required');
    }
    if (!this.updatedAt) {
      throw new Error('Comment update date is required');
    }
  }

  /**
   * Business logic: Update comment content
   */
  updateContent(content: string): void {
    if (!content || content.length < 1) {
      throw new Error('Comment content must be at least 1 character long');
    }
    if (content.length > 500) {
      throw new Error('Comment content must not exceed 500 characters');
    }
    this.content = content;
    this.updatedAt = new Date();
  }
}
