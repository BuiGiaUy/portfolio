import { Project } from 'src/domain/entities/project.entity';

describe('Project Entity', () => {
  const validProjectData = {
    id: 'project-123',
    title: 'My Project',
    description: 'This is a test project description',
    userId: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('Constructor Validation', () => {
    it('should create a valid project', () => {
      // Act
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );

      // Assert
      expect(project.id).toBe(validProjectData.id);
      expect(project.title).toBe(validProjectData.title);
      expect(project.description).toBe(validProjectData.description);
      expect(project.userId).toBe(validProjectData.userId);
      expect(project.createdAt).toBe(validProjectData.createdAt);
      expect(project.updatedAt).toBe(validProjectData.updatedAt);
    });

    it('should throw error when id is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          '',
          validProjectData.title,
          validProjectData.description,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project ID is required');
    });

    it('should throw error when title is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          '',
          validProjectData.description,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project title is required');
    });

    it('should throw error when title is too short (less than 3 chars)', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          'AB',
          validProjectData.description,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project title must be at least 3 characters long');
    });

    it('should throw error when title exceeds 100 characters', () => {
      // Act & Assert
      const longTitle = 'A'.repeat(101);
      expect(() => {
        new Project(
          validProjectData.id,
          longTitle,
          validProjectData.description,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project title must not exceed 100 characters');
    });

    it('should throw error when description is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          '',
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project description is required');
    });

    it('should throw error when userId is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          validProjectData.description,
          '',
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project userId is required');
    });

    it('should throw error when createdAt is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          validProjectData.description,
          validProjectData.userId,
          null as any,
          validProjectData.updatedAt,
        );
      }).toThrow('Project creation date is required');
    });

    it('should throw error when updatedAt is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          validProjectData.description,
          validProjectData.userId,
          validProjectData.createdAt,
          null as any,
        );
      }).toThrow('Project update date is required');
    });

    it('should accept title with exactly 3 characters (boundary)', () => {
      // Act
      const project = new Project(
        validProjectData.id,
        'ABC',
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );

      // Assert
      expect(project.title).toBe('ABC');
    });

    it('should accept title with exactly 100 characters (boundary)', () => {
      // Arrange
      const maxTitle = 'A'.repeat(100);

      // Act
      const project = new Project(
        validProjectData.id,
        maxTitle,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );

      // Assert
      expect(project.title).toBe(maxTitle);
    });
  });

  describe('updateTitle', () => {
    it('should update title and timestamp when valid', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );
      const originalUpdatedAt = project.updatedAt;
      const newTitle = 'Updated Project Title';

      // Wait to ensure timestamp changes
      setTimeout(() => {}, 1);

      // Act
      project.updateTitle(newTitle);

      // Assert
      expect(project.title).toBe(newTitle);
      expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when new title is too short', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        project.updateTitle('AB');
      }).toThrow('Project title must be at least 3 characters long');
    });

    it('should throw error when new title is empty', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        project.updateTitle('');
      }).toThrow('Project title must be at least 3 characters long');
    });

    it('should throw error when new title exceeds 100 characters', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );
      const longTitle = 'A'.repeat(101);

      // Act & Assert
      expect(() => {
        project.updateTitle(longTitle);
      }).toThrow('Project title must not exceed 100 characters');
    });
  });

  describe('updateDescription', () => {
    it('should update description and timestamp when valid', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );
      const originalUpdatedAt = project.updatedAt;
      const newDescription = 'This is an updated description for the project';

      // Wait to ensure timestamp changes
      setTimeout(() => {}, 1);

      // Act
      project.updateDescription(newDescription);

      // Assert
      expect(project.description).toBe(newDescription);
      expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when new description is empty', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.description,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        project.updateDescription('');
      }).toThrow('Project description is required');
    });
  });
});
