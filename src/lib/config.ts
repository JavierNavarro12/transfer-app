import { AppConfig } from '@/types';

export const config: AppConfig = {
  maxFileSize: Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 104857600, // 100MB
  expirationHours: Number(process.env.NEXT_PUBLIC_EXPIRATION_HOURS) || 24,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'TransferApp',
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateSessionId = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateEncryptionKey = (): string => {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};
