/**
 * Upload entity - Domain model for file uploads
 */
export class Upload {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly filename: string,
    public readonly contentType: string,
    public readonly size: number,
    public readonly uploadedById: string,
    public readonly context: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
