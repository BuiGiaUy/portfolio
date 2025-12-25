"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadService } from "@/lib/api/upload.service";
import { FilePreview } from "./FilePreview";
import { UploadProgress } from "./UploadProgress";
import styles from "./FileUploader.module.css";

export interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  context?: {
    type?: string;
    id?: string;
    subFolder?: string;
  };
  onUploadSuccess?: (result: UploadResult) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

export interface UploadResult {
  id: string;
  key: string;
  filename: string;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  preview?: string;
  result?: UploadResult;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  context,
  onUploadSuccess,
  onUploadError,
  className = "",
}) => {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = accept.split(",").map((t) => t.trim());

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds maximum allowed size of ${formatFileSize(
        maxSize
      )}`;
    }

    const isTypeAllowed = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith("/*")) {
        const category = type.split("/")[0];
        return file.type.startsWith(category + "/");
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      return `File type '${file.type}' is not allowed. Allowed types: ${accept}`;
    }

    return null;
  };

  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        resolve(undefined);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file: File, index: number) => {
    try {
      setUploads((prev) => {
        const newUploads = [...prev];
        newUploads[index] = { ...newUploads[index], status: "uploading" };
        return newUploads;
      });

      const result = await UploadService.uploadFile(
        file,
        context,
        (progress) => {
          setUploads((prev) => {
            const newUploads = [...prev];
            newUploads[index] = { ...newUploads[index], progress };
            return newUploads;
          });
        }
      );

      setUploads((prev) => {
        const newUploads = [...prev];
        newUploads[index] = {
          ...newUploads[index],
          status: "success",
          progress: 100,
          result: {
            id: result.id,
            key: result.key,
            filename: result.filename,
          },
        };
        return newUploads;
      });

      if (onUploadSuccess) {
        onUploadSuccess({
          id: result.id,
          key: result.key,
          filename: result.filename,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      setUploads((prev) => {
        const newUploads = [...prev];
        newUploads[index] = {
          ...newUploads[index],
          status: "error",
          error: errorMessage,
        };
        return newUploads;
      });

      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newUploads: FileUploadState[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);

      if (validationError) {
        newUploads.push({
          file,
          progress: 0,
          status: "error",
          error: validationError,
        });
      } else {
        const preview = await generatePreview(file);
        newUploads.push({
          file,
          progress: 0,
          status: "pending",
          preview,
        });
      }

      if (!multiple) break;
    }

    setUploads((prev) => (multiple ? [...prev, ...newUploads] : newUploads));

    const startIndex = multiple ? uploads.length : 0;
    newUploads.forEach((upload, index) => {
      if (upload.status === "pending") {
        uploadFile(upload.file, startIndex + index);
      }
    });
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRetry = (index: number) => {
    uploadFile(uploads[index].file, index);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className={styles.fileInput}
          aria-label="File upload input"
        />

        <div className={styles.dropzoneContent}>
          <svg
            className={styles.uploadIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className={styles.dropzoneText}>
            <span className={styles.dropzoneAction}>Click to upload</span> or
            drag and drop
          </p>
          <p className={styles.dropzoneHint}>
            {acceptedTypes.join(", ")} (max {formatFileSize(maxSize)})
          </p>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className={styles.uploadList}>
          {uploads.map((upload, index) => (
            <div key={index} className={styles.uploadItem}>
              <FilePreview
                file={upload.file}
                preview={upload.preview}
                status={upload.status}
              />

              <div className={styles.uploadInfo}>
                <div className={styles.uploadHeader}>
                  <span className={styles.filename}>{upload.file.name}</span>
                  <span className={styles.filesize}>
                    {formatFileSize(upload.file.size)}
                  </span>
                </div>

                {upload.status === "uploading" && (
                  <UploadProgress progress={upload.progress} />
                )}

                {upload.status === "error" && (
                  <div className={styles.error}>
                    <span>{upload.error}</span>
                    <button
                      onClick={() => handleRetry(index)}
                      className={styles.retryButton}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {upload.status === "success" && (
                  <div className={styles.success}>
                    <svg className={styles.successIcon} viewBox="0 0 20 20">
                      <path
                        fill="currentColor"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      />
                    </svg>
                    Upload complete
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRemove(index)}
                className={styles.removeButton}
                aria-label="Remove file"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
