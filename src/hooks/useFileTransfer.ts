import { useState } from 'react';
import { FileUploadResult, FileDownloadResult, TransferSession } from '@/types';
import { generateSessionId, generateEncryptionKey, config } from '@/lib/config';
import { encryptFile, decryptFile } from '@/lib/encryption';
import { uploadEncryptedFile, downloadEncryptedFile } from '@/lib/storage';
import { saveTransferSession, getTransferSession, markAsDownloaded } from '@/lib/firestore';

export const useFileTransfer = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const uploadFile = async (file: File): Promise<FileUploadResult> => {
    if (file.size > config.maxFileSize) {
      return {
        success: false,
        sessionId: '',
        encryptionKey: '',
        error: `File size exceeds maximum limit of ${config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate session ID and encryption key
      const sessionId = generateSessionId();
      const encryptionKey = generateEncryptionKey();

      setUploadProgress(20);

      // Encrypt the file
      const encryptedFile = await encryptFile(file, encryptionKey);

      setUploadProgress(60);

      // Upload encrypted file to Firebase Storage
      const downloadURL = await uploadEncryptedFile(sessionId, encryptedFile, file.name);

      setUploadProgress(80);

      // Create transfer session
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + config.expirationHours);

      const session: TransferSession = {
        id: sessionId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        encryptedFileUrl: downloadURL,
        encryptionKey,
        uploadDate: new Date(),
        expirationDate,
        downloaded: false,
        downloadCount: 0,
      };

      // Save session to Firestore
      await saveTransferSession(session);

      setUploadProgress(100);

      return {
        success: true,
        sessionId,
        encryptionKey,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        sessionId: '',
        encryptionKey: '',
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadFile = async (sessionId: string): Promise<FileDownloadResult> => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Get transfer session
      const session = await getTransferSession(sessionId);

      setDownloadProgress(25);

      if (!session) {
        throw new Error('Transfer session not found');
      }

      // Check if expired
      if (new Date() > session.expirationDate) {
        throw new Error('This transfer has expired');
      }

      // Check if already downloaded (optional - you can remove this check if you want multiple downloads)
      if (session.downloaded) {
        throw new Error('This file has already been downloaded');
      }

      setDownloadProgress(50);

      // Download encrypted file
      const encryptedContent = await downloadEncryptedFile(session.encryptedFileUrl);

      setDownloadProgress(75);

      // Decrypt file
      const decryptedBlob = decryptFile(encryptedContent, session.encryptionKey);

      setDownloadProgress(90);

      // Mark as downloaded
      await markAsDownloaded(sessionId);

      setDownloadProgress(100);

      return {
        success: true,
        fileName: session.fileName,
        fileBlob: decryptedBlob,
      };
    } catch (error) {
      console.error('Download error:', error);
      return {
        success: false,
        fileName: '',
        fileBlob: new Blob(),
        error: error instanceof Error ? error.message : 'Download failed',
      };
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const checkSession = async (sessionId: string): Promise<TransferSession | null> => {
    try {
      return await getTransferSession(sessionId);
    } catch (error) {
      console.error('Error checking session:', error);
      return null;
    }
  };

  return {
    uploadFile,
    downloadFile,
    checkSession,
    isUploading,
    isDownloading,
    uploadProgress,
    downloadProgress,
  };
};
