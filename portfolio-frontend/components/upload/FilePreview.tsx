"use client";

import React from "react";
import styles from "./FilePreview.module.css";

interface FilePreviewProps {
  file: File;
  preview?: string;
  status: "pending" | "uploading" | "success" | "error";
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  preview,
  status,
}) => {
  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  return (
    <div className={`${styles.preview} ${styles[status]}`}>
      {preview ? (
        <img src={preview} alt={file.name} className={styles.image} />
      ) : isImage ? (
        <div className={styles.iconPlaceholder}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : isPDF ? (
        <div className={styles.iconPlaceholder}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <path d="M14 2v6h6" />
            <path d="M10 12h4v6h-4z" fill="white" />
          </svg>
        </div>
      ) : (
        <div className={styles.iconPlaceholder}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
