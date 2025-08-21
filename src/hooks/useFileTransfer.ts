import { useState } from 'react';
import { FileUploadResult, FileDownloadResult, TransferSession } from '@/types';
import { generateSessionId, generateEncryptionKey, config } from '@/lib/config';
import { encryptFile, decryptFile } from '@/lib/encryption';
import { uploadEncryptedFile, downloadEncryptedFile } from '@/lib/storage';
import { saveTransferSession, getTransferSession, markAsDownloaded } from '@/lib/firestore';
import { initializeAuth } from '@/lib/firebase';
import { smartCompressFile, decompressFile, type CompressionResult } from '@/lib/compression';
import type { UploadMetadata } from 'firebase/storage';

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
      // Initialize authentication
      const currentUser = await initializeAuth();

      // Generate session ID and encryption key
      const sessionId = generateSessionId();
      const encryptionKey = generateEncryptionKey();

      setUploadProgress(10);

      // Compress file intelligently
      const { file: processedFile, compressionResult } = await smartCompressFile(file);

      setUploadProgress(30);

      // Ensure we have a File object for encryption
      const fileToEncrypt = processedFile instanceof File ? processedFile :
        new File([processedFile], file.name, {
          type: file.type,
          lastModified: file.lastModified
        });

      // Encrypt the file (compressed or original)
      const encryptedFile = await encryptFile(fileToEncrypt, encryptionKey);

      setUploadProgress(60);

      // Upload encrypted file to Firebase Storage with metadata
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + config.expirationHours);

      const metadata: UploadMetadata = {
        customMetadata: {
          ownerId: currentUser.uid,
          expirationDate: expirationDate.toISOString(),
          originalFileName: file.name,
          originalFileSize: file.size.toString(),
          wasCompressed: compressionResult.compressed.toString(),
          compressionRatio: compressionResult.compressionRatio.toString(),
          compressionAlgorithm: compressionResult.algorithm
        }
      };

      const downloadURL = await uploadEncryptedFile(sessionId, encryptedFile, file.name, metadata);

      setUploadProgress(80);

      // Create transfer session
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
        ownerId: currentUser.uid, // Add owner ID
        // Add compression info
        wasCompressed: compressionResult.compressed,
        compressionRatio: compressionResult.compressionRatio,
        compressionAlgorithm: compressionResult.algorithm,
        originalFileName: file.name,
        originalFileSize: file.size,
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

      setDownloadProgress(85);

      // Decompress if needed
      let finalBlob = decryptedBlob;
      if (session.wasCompressed) {
        try {
          const arrayBuffer = await decryptedBlob.arrayBuffer();
          const decompressedBuffer = decompressFile(arrayBuffer);
          finalBlob = new Blob([decompressedBuffer], {
            type: session.fileType || 'application/octet-stream'
          });
        } catch (error) {
          console.error('Error decompressing file:', error);
          // Fallback to original blob if decompression fails
          finalBlob = decryptedBlob;
        }
      }

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
