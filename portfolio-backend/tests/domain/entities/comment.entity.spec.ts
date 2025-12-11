import { Comment } from 'src/domain/entities/comment.entity';

describe('Comment Entity', () => {
  const validCommentData = {
    id: 'comment-123',
    content: 'This is a test comment',
    userId: 'user-123',
    projectId: 'project-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('Constructor Validation', () => {
    it('should create a valid comment', () => {
      // Act
      const comment = new Comment(
        validCommentData.id,
        validCommentData.content,
        validCommentData.userId,
        validCommentData.projectId,
        validCommentData.createdAt,
        validCommentData.updatedAt,
      );

      // Assert
      expect(comment.id).toBe(validCommentData.id);
      expect(comment.content).toBe(validCommentData.content);
      expect(comment.userId).toBe(validCommentData.userId);
      expect(comment.projectId).toBe(validCommentData.projectId);
      expect(comment.createdAt).toBe(validCommentData.createdAt);
      expect(comment.updatedAt).toBe(validCommentData.updatedAt);
    });

    it('should throw error when id is missing', () => {
      // Act & Assert
      expect(() => {
        new Comment(
          '',
          validCommentData.content,
          validCommentData.userId,
          validCommentData.projectId,
          validCommentData.createdAt,
          validCommentData.updatedAt,
        );
      }).toThrow('Comment ID is required');
    });

    it('should throw error when content is missing', () => {
      // Act & Assert
      expect(() => {
        new Comment(
          validCommentData.id,
          '',
          validCommentData.userId,
          validCommentData.projectId,
          validCommentData.createdAt,
          validCommentData.updatedAt,
        );
      }).toThrow('Comment content is required');
    });

    it('should throw error when content exceeds 500 characters', () => {
      // Arrange
      const longContent = 'A'.repeat(501);

      // Act & Assert
      expect(() => {
        new Comment(
          validCommentData.id,
          longContent,
          validCommentData.userId,
          validCommentData.projectId,
          validCommentData.createdAt,
          validCommentData.updatedAt,
        );
      }).toThrow('Comment content must not exceed 500 characters');
    });

    it('should throw error when userId is missing', () => {
      // Act & Assert
      expect(() => {
        new Comment(
          validCommentData.id,
          validCommentData.content,
          '',
          validCommentData.projectId,
          validCommentData.createdAt,
          validCommentData.updatedAt,
        );
      }).toThrow('Comment userId is required');
    });

    it('should throw error when projectId is missing', () => {
      // Act & Assert
      expect(() => {
        new Comment(
          validCommentData.id,
          validCommentData.content,
          validCommentData.userId,
          '',
          validCommentData.createdAt,
          validCommentData.updatedAt,
        );
      }).toThrow('Comment projectId is required');
    });

    it('should throw error when createdAt is missing', () => {
      // Act & Assert
      expect(() => {
        new Comment(
          validCommentData.id,
          validCommentData.content,
          validCommentData.userId,
          validCommentData.projectId,
          null as any,
          validCommentData.updatedAt,
        );
      }).toThrow('Comment creation date is required');
    });

    it('should throw error when updatedAt is missing', () => {
      // Act & Assert
      expect(() => {
        new Comment(
          validCommentData.id,
          validCommentData.content,
          validCommentData.userId,
          validCommentData.projectId,
          validCommentData.createdAt,
          null as any,
        );
      }).toThrow('Comment update date is required');
    });

    it('should accept content with exactly 1 character (boundary)', () => {
      // Act
      const comment = new Comment(
        validCommentData.id,
        'A',
        validCommentData.userId,
        validCommentData.projectId,
        validCommentData.createdAt,
        validCommentData.updatedAt,
      );

      // Assert
      expect(comment.content).toBe('A');
    });

    it('should accept content with exactly 500 characters (boundary)', () => {
      // Arrange
      const maxContent = 'A'.repeat(500);

      // Act
      const comment = new Comment(
        validCommentData.id,
        maxContent,
        validCommentData.userId,
        validCommentData.projectId,
        validCommentData.createdAt,
        validCommentData.updatedAt,
      );

      // Assert
      expect(comment.content).toBe(maxContent);
    });
  });

  describe('updateContent', () => {
    it('should update content and timestamp when valid', () => {
      // Arrange
      const comment = new Comment(
        validCommentData.id,
        validCommentData.content,
        validCommentData.userId,
        validCommentData.projectId,
        validCommentData.createdAt,
        validCommentData.updatedAt,
      );
      const originalUpdatedAt = comment.updatedAt;
      const newContent = 'This is an updated comment content';

      // Wait to ensure timestamp changes
      setTimeout(() => {}, 1);

      // Act
      comment.updateContent(newContent);

      // Assert
      expect(comment.content).toBe(newContent);
      expect(comment.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when new content is empty', () => {
      // Arrange
      const comment = new Comment(
        validCommentData.id,
        validCommentData.content,
        validCommentData.userId,
        validCommentData.projectId,
        validCommentData.createdAt,
        validCommentData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        comment.updateContent('');
      }).toThrow('Comment content must be at least 1 character long');
    });

    it('should throw error when new content exceeds 500 characters', () => {
      // Arrange
      const comment = new Comment(
        validCommentData.id,
        validCommentData.content,
        validCommentData.userId,
        validCommentData.projectId,
        validCommentData.createdAt,
        validCommentData.updatedAt,
      );
      const longContent = 'A'.repeat(501);

      // Act & Assert
      expect(() => {
        comment.updateContent(longContent);
      }).toThrow('Comment content must not exceed 500 characters');
    });
  });
});
