export interface TransferSession {
  id: string; // 6-digit code
  fileName: string;
  fileSize: number;
  fileType: string;
  encryptedFileUrl: string;
  encryptionKey: string; // AES key for decryption
  uploadDate: Date;
  expirationDate: Date;
  downloaded: boolean;
  downloadCount: number;
  ownerId: string; // Firebase Auth UID
  // Compression fields
  wasCompressed?: boolean;
  compressionRatio?: number;
  compressionAlgorithm?: string;
  originalFileName?: string;
  originalFileSize?: number;
}

export interface FileUploadResult {
  success: boolean;
  sessionId: string;
  encryptionKey: string;
  error?: string;
}

export interface FileDownloadResult {
  success: boolean;
  fileName: string;
  fileBlob: Blob;
  error?: string;
}

export interface AppConfig {
  maxFileSize: number;
  expirationHours: number;
  appName: string;
}
