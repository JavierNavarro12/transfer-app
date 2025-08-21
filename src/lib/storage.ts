import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, type UploadMetadata } from 'firebase/storage';

export const uploadEncryptedFile = async (
  sessionId: string,
  encryptedFile: ArrayBuffer,
  fileName: string,
  metadata?: UploadMetadata
): Promise<string> => {
  try {
    const storageRef = ref(storage, `transfers/${sessionId}/${fileName}.encrypted`);

    // Upload the encrypted file with metadata
    await uploadBytes(storageRef, encryptedFile, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading encrypted file:', error);
    throw new Error('Failed to upload file');
  }
};

export const downloadEncryptedFile = async (downloadURL: string): Promise<string> => {
  try {
    const response = await fetch(downloadURL);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return await response.text();
  } catch (error) {
    console.error('Error downloading encrypted file:', error);
    throw new Error('Failed to download file');
  }
};

export const deleteEncryptedFile = async (sessionId: string, fileName: string): Promise<void> => {
  try {
    const storageRef = ref(storage, `transfers/${sessionId}/${fileName}.encrypted`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting encrypted file:', error);
    throw new Error('Failed to delete file');
  }
};
