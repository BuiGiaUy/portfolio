import { Project } from 'src/domain/entities/project.entity';

describe('Project Entity', () => {
  const validProjectData = {
    id: 'project-123',
    title: 'My Project',
    slug: 'my-project',
    shortDescription: 'A short description',
    content: 'This is the full content of the project',
    techStack: ['NestJS', 'PostgreSQL'],
    userId: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    githubUrl: 'https://github.com/user/project',
    demoUrl: 'https://demo.example.com',
  };

  describe('Constructor Validation', () => {
    it('should create a valid project', () => {
      // Act
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
        validProjectData.thumbnailUrl,
        validProjectData.githubUrl,
        validProjectData.demoUrl,
      );

      // Assert
      expect(project.id).toBe(validProjectData.id);
      expect(project.title).toBe(validProjectData.title);
      expect(project.slug).toBe(validProjectData.slug);
      expect(project.shortDescription).toBe(validProjectData.shortDescription);
      expect(project.content).toBe(validProjectData.content);
      expect(project.techStack).toEqual(validProjectData.techStack);
      expect(project.userId).toBe(validProjectData.userId);
      expect(project.createdAt).toBe(validProjectData.createdAt);
      expect(project.updatedAt).toBe(validProjectData.updatedAt);
      expect(project.thumbnailUrl).toBe(validProjectData.thumbnailUrl);
      expect(project.githubUrl).toBe(validProjectData.githubUrl);
      expect(project.demoUrl).toBe(validProjectData.demoUrl);
    });

    it('should throw error when id is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          '',
          validProjectData.title,
          validProjectData.slug,
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
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
          validProjectData.slug,
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
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
          validProjectData.slug,
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
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
          validProjectData.slug,
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project title must not exceed 100 characters');
    });

    it('should throw error when slug is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          '',
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project slug is required');
    });

    it('should throw error when slug is not URL-friendly', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          'Invalid Slug With Spaces',
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project slug must be URL-friendly');
    });

    it('should throw error when shortDescription is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          validProjectData.slug,
          '',
          validProjectData.content,
          validProjectData.techStack,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project short description is required');
    });

    it('should throw error when shortDescription exceeds 200 characters', () => {
      // Act & Assert
      const longDesc = 'A'.repeat(201);
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          validProjectData.slug,
          longDesc,
          validProjectData.content,
          validProjectData.techStack,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project short description must not exceed 200 characters');
    });

    it('should throw error when content is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          validProjectData.slug,
          validProjectData.shortDescription,
          '',
          validProjectData.techStack,
          validProjectData.userId,
          validProjectData.createdAt,
          validProjectData.updatedAt,
        );
      }).toThrow('Project content is required');
    });

    it('should throw error when userId is missing', () => {
      // Act & Assert
      expect(() => {
        new Project(
          validProjectData.id,
          validProjectData.title,
          validProjectData.slug,
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
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
          validProjectData.slug,
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
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
          validProjectData.slug,
          validProjectData.shortDescription,
          validProjectData.content,
          validProjectData.techStack,
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
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
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
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
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
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
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
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
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
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
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
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
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

  describe('updateContent', () => {
    it('should update content and timestamp when valid', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );
      const originalUpdatedAt = project.updatedAt;
      const newContent = 'This is an updated content for the project';

      // Wait to ensure timestamp changes
      setTimeout(() => {}, 1);

      // Act
      project.updateContent(newContent);

      // Assert
      expect(project.content).toBe(newContent);
      expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when new content is empty', () => {
      // Arrange
      const project = new Project(
        validProjectData.id,
        validProjectData.title,
        validProjectData.slug,
        validProjectData.shortDescription,
        validProjectData.content,
        validProjectData.techStack,
        validProjectData.userId,
        validProjectData.createdAt,
        validProjectData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        project.updateContent('');
      }).toThrow('Project content is required');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      expect(Project.generateSlug('My First Project')).toBe('my-first-project');
    });

    it('should handle diacritics', () => {
      expect(Project.generateSlug('Dự án Việt Nam')).toBe('du-an-viet-nam');
    });

    it('should remove special characters', () => {
      expect(Project.generateSlug('Project@2024!')).toBe('project2024');
    });
  });
});
