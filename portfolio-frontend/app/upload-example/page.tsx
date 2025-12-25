"use client";

import React, { useState } from "react";
import { FileUploader, UploadResult } from "@/components/upload";

export default function UploadExamplePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  const handleUploadSuccess = (result: UploadResult) => {
    console.log("✅ File uploaded successfully:", result);
    setUploadedFiles((prev) => [...prev, result]);
  };

  const handleUploadError = (error: Error) => {
    console.error("❌ Upload failed:", error);
    alert(`Upload failed: ${error.message}`);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>File Upload Test</h1>
      <p style={{ color: "#666" }}>
        Upload images or PDF documents to test the upload functionality
      </p>

      <FileUploader
        accept="image/*,application/pdf"
        maxSize={10 * 1024 * 1024}
        multiple={true}
        context={{
          type: "projects",
          subFolder: "documents",
        }}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2>Uploaded Files ({uploadedFiles.length})</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {uploadedFiles.map((file) => (
              <li
                key={file.id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  background: "#f0f0f0",
                  borderRadius: "4px",
                }}
              >
                <strong>{file.filename}</strong>
                <br />
                <small style={{ color: "#666" }}>Key: {file.key}</small>
                <br />
                <small style={{ color: "#666" }}>ID: {file.id}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
