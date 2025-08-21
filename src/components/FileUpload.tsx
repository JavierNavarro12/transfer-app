'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import { config, formatFileSize } from '@/lib/config';

interface FileUploadProps {
  onUploadSuccess: (sessionId: string, encryptionKey: string) => void;
  onUploadError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, uploadProgress } = useFileTransfer();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > config.maxFileSize) {
      onUploadError(`File size exceeds maximum limit of ${formatFileSize(config.maxFileSize)}`);
      return;
    }
    setSelectedFile(file);
  }, [onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadFile(selectedFile);

      if (result.success) {
        onUploadSuccess(result.sessionId, result.encryptionKey);
        setSelectedFile(null);
      } else {
        onUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [selectedFile, uploadFile, onUploadSuccess, onUploadError]);

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`drop-zone relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'drag-over border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${selectedFile ? 'bg-green-50 border-green-400' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          accept="*/*"
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <File className="w-8 h-8 text-green-600" />
              <span className="text-lg font-medium text-green-800">
                {selectedFile.name}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Size: {formatFileSize(selectedFile.size)}
            </p>

            <div className="flex space-x-2 justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </>
                )}
              </button>

              <button
                onClick={clearSelectedFile}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="w-16 h-16 text-gray-400" />
            </div>
            <div>
              <p className="text-xl font-medium text-gray-700 mb-2">
                Drop your file here
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse from your device
              </p>
              <button
                onClick={openFileDialog}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-visible"
              >
                Select File
              </button>
            </div>
            <div className="text-xs text-gray-400">
              Maximum file size: {formatFileSize(config.maxFileSize)}
            </div>
          </div>
        )}

        {isUploading && uploadProgress > 0 && (
          <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
            <div className="w-full max-w-xs space-y-2">
              <div className="text-sm text-gray-600">Uploading...</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {uploadProgress}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
