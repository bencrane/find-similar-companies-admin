"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const MODAL_ENDPOINT = "https://bencrane--hq-master-data-ingest-ingest-linkedin-job-video.modal.run";

export default function LinkedInJobsVideoPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setUploadStatus(null);
    }
  };

  const handleSubmit = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      if (searchQuery) formData.append("search_query", searchQuery);
      if (date) formData.append("date", date);
      if (linkedinUrl) formData.append("linkedin_url", linkedinUrl);

      const response = await fetch(MODAL_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus({ success: true, message: data.message || "Video uploaded successfully!" });
        setVideoFile(null);
        setSearchQuery("");
        setDate("");
        setLinkedinUrl("");
      } else {
        setUploadStatus({ success: false, message: data.error || data.detail || "Upload failed" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({ success: false, message: "Network error - failed to upload video" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <Link
          href="/admin/data-ingest"
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span className="font-semibold">LinkedIn Jobs Feed Video Upload</span>
        </Link>
      </header>

      {/* Content */}
      <main className="p-8 max-w-2xl">
        <div className="space-y-6">
          {/* Video Upload */}
          <div
            className="p-8 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 text-center cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {videoFile ? (
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-green-400 mb-4"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-white font-medium">{videoFile.name}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                  }}
                  className="text-red-400 text-sm mt-2 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-gray-500 mb-4"
                >
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                </svg>
                <p className="text-white font-medium">
                  Drop video here or click to upload
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Supports MP4, MOV, WebM
                </p>
              </div>
            )}
          </div>

          {/* Optional Fields */}
          <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 space-y-4">
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Optional metadata
            </p>

            {/* Search Query */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Search Query
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Software Engineer San Francisco"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                LinkedIn Search URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/search/..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!videoFile || isUploading}
            className="w-full px-6 py-3 bg-white text-black rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>

          {/* Upload Status */}
          {uploadStatus && (
            <div
              className={`p-4 rounded-lg ${
                uploadStatus.success
                  ? "bg-green-900/50 border border-green-700 text-green-400"
                  : "bg-red-900/50 border border-red-700 text-red-400"
              }`}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
