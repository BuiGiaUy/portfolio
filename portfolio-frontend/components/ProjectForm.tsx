"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";
import { useCreateProject, useUpdateProject } from "@/lib/query";
import { useToast } from "@/components/Toast";
import { FileUploader, UploadResult } from "@/components/upload";

export interface ProjectFormProps {
  project?: Project | null;
  mode: "create" | "edit";
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  techStack: string[];
  thumbnailUrl: string;
  githubUrl: string;
  demoUrl: string;
}

const initialFormData: FormData = {
  title: "",
  slug: "",
  shortDescription: "",
  content: "",
  techStack: [],
  thumbnailUrl: "",
  githubUrl: "",
  demoUrl: "",
};

export function ProjectForm({
  project,
  mode,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [techInput, setTechInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && project) {
      setFormData({
        title: project.title || "",
        slug: project.slug || "",
        shortDescription: project.shortDescription || "",
        content: project.content || "",
        techStack: project.techStack || [],
        thumbnailUrl: project.thumbnailUrl || "",
        githubUrl: project.githubUrl || "",
        demoUrl: project.demoUrl || "",
      });
    }
  }, [mode, project]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: mode === "create" ? generateSlug(value) : prev.slug,
    }));
  };

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddTech = () => {
    const tech = techInput.trim();
    if (tech && !formData.techStack.includes(tech)) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, tech],
      }));
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleUploadSuccess = (result: UploadResult) => {
    // Construct the URL from the key
    const uploadUrl = `/api/uploads/${result.key}`;
    setFormData((prev) => ({ ...prev, thumbnailUrl: uploadUrl }));
    success("Thumbnail uploaded", result.filename);
  };

  const handleUploadError = (err: Error) => {
    showError("Upload failed", err.message);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }
    if (formData.techStack.length === 0) {
      newErrors.techStack = "At least one technology is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showError("Validation Error", "Please fix the errors below");
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        title: formData.title,
        slug: formData.slug,
        shortDescription: formData.shortDescription,
        content: formData.content,
        techStack: formData.techStack,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        demoUrl: formData.demoUrl || undefined,
      };

      let savedProject: Project;

      if (mode === "create") {
        savedProject = await createProject.mutateAsync(projectData);
        success(
          "Project Created",
          `"${savedProject.title}" has been created successfully`
        );
      } else {
        if (!project?.id) throw new Error("Project ID is required for update");
        savedProject = await updateProject.mutateAsync({
          id: project.id,
          data: projectData,
        });
        success(
          "Project Updated",
          `"${savedProject.title}" has been updated successfully`
        );
      }

      if (onSuccess) {
        onSuccess(savedProject);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      showError(mode === "create" ? "Create Failed" : "Update Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = {
    background: "var(--glass-bg)",
    borderColor: errors.title ? "#ef4444" : "var(--border-default)",
    color: "var(--foreground)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="animate-fade-in-up animation-delay-100">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--neutral-300)" }}
        >
          Project Title <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="My Awesome Project"
          className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
          style={{
            ...inputStyles,
            borderColor: errors.title ? "#ef4444" : "var(--border-default)",
          }}
        />
        {errors.title && (
          <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
            {errors.title}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className="animate-fade-in-up animation-delay-150">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--neutral-300)" }}
        >
          URL Slug <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => handleChange("slug", e.target.value.toLowerCase())}
          placeholder="my-awesome-project"
          className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
          style={{
            ...inputStyles,
            borderColor: errors.slug ? "#ef4444" : "var(--border-default)",
          }}
        />
        {errors.slug && (
          <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
            {errors.slug}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: "var(--neutral-500)" }}>
          URL: /projects/{formData.slug || "your-slug"}
        </p>
      </div>

      {/* Short Description */}
      <div className="animate-fade-in-up animation-delay-200">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--neutral-300)" }}
        >
          Short Description <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => handleChange("shortDescription", e.target.value)}
          placeholder="A brief description of your project (shown in cards)"
          rows={2}
          className="w-full px-4 py-3 rounded-lg border transition-all duration-300 resize-none"
          style={{
            ...inputStyles,
            borderColor: errors.shortDescription
              ? "#ef4444"
              : "var(--border-default)",
          }}
        />
        {errors.shortDescription && (
          <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
            {errors.shortDescription}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="animate-fade-in-up animation-delay-250">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--neutral-300)" }}
        >
          Full Content <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          placeholder="Detailed description of your project. You can use Markdown."
          rows={6}
          className="w-full px-4 py-3 rounded-lg border transition-all duration-300 resize-y"
          style={{
            ...inputStyles,
            borderColor: errors.content ? "#ef4444" : "var(--border-default)",
          }}
        />
        {errors.content && (
          <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
            {errors.content}
          </p>
        )}
      </div>

      {/* Tech Stack */}
      <div className="animate-fade-in-up animation-delay-300">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--neutral-300)" }}
        >
          Tech Stack <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechKeyDown}
            placeholder="Add technology (press Enter)"
            className="flex-1 px-4 py-3 rounded-lg border transition-all duration-300"
            style={inputStyles}
          />
          <button
            type="button"
            onClick={handleAddTech}
            className="btn-outline-premium px-4 py-2"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Add
          </button>
        </div>
        {errors.techStack && (
          <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
            {errors.techStack}
          </p>
        )}

        {/* Tech Tags */}
        {formData.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.techStack.map((tech) => (
              <span
                key={tech}
                className="project-tag-premium flex items-center gap-1"
                style={{ paddingRight: "0.5rem" }}
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="ml-1 hover:text-red-400 transition-colors"
                  style={{ color: "var(--neutral-400)" }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="animate-fade-in-up animation-delay-350">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--neutral-300)" }}
        >
          Thumbnail Image
        </label>

        {/* URL Input Option */}
        <div className="mb-3">
          <input
            type="url"
            value={formData.thumbnailUrl}
            onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
            className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
            style={inputStyles}
          />
          <p className="text-xs mt-1" style={{ color: "var(--neutral-500)" }}>
            Enter a direct image URL, or upload a file below
          </p>
        </div>

        {/* File Upload (optional - requires S3/R2 configuration) */}
        <div
          className="p-3 rounded-lg border"
          style={{
            borderColor: "var(--border-subtle)",
            background: "rgba(0,0,0,0.1)",
          }}
        >
          <p className="text-xs mb-2" style={{ color: "var(--neutral-500)" }}>
            Or upload from your device:
          </p>
          <FileUploader
            accept="image/jpeg,image/png,image/webp"
            maxSize={5 * 1024 * 1024}
            context={{ type: "project", subFolder: "thumbnails" }}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Preview */}
        {formData.thumbnailUrl && (
          <div
            className="mt-3 p-3 rounded-lg border"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--neutral-400)" }}>
              Preview:
            </p>
            <div className="flex items-center gap-3">
              <img
                src={formData.thumbnailUrl}
                alt="Thumbnail preview"
                className="w-20 h-20 object-cover rounded"
                style={{ border: "1px solid var(--border-default)" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => handleChange("thumbnailUrl", "")}
                className="text-sm"
                style={{ color: "#ef4444" }}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animation-delay-400">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--neutral-300)" }}
          >
            GitHub URL
          </label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={(e) => handleChange("githubUrl", e.target.value)}
            placeholder="https://github.com/..."
            className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
            style={inputStyles}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--neutral-300)" }}
          >
            Demo URL
          </label>
          <input
            type="url"
            value={formData.demoUrl}
            onChange={(e) => handleChange("demoUrl", e.target.value)}
            placeholder="https://demo.example.com"
            className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
            style={inputStyles}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 animate-fade-in-up animation-delay-450">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-glow flex-1 py-3 font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {mode === "create" ? "Creating..." : "Updating..."}
            </span>
          ) : mode === "create" ? (
            "Create Project"
          ) : (
            "Update Project"
          )}
        </button>

        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="btn-outline-premium px-6 py-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;
