import CryptoJS from 'crypto-js';

export const encryptFile = async (file: File, key: string): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(fileContent);

        // Encrypt the file content
        const encrypted = CryptoJS.AES.encrypt(wordArray, key);

        // Convert to ArrayBuffer for upload
        const encryptedStr = encrypted.toString();
        const encryptedBytes = new TextEncoder().encode(encryptedStr);
        const buffer: ArrayBufferLike = encryptedBytes.buffer;
        const arrayBuffer = buffer instanceof ArrayBuffer ? buffer : new ArrayBuffer((buffer as ArrayBufferLike).byteLength || 0);
        if (!(buffer instanceof ArrayBuffer)) {
          new Uint8Array(arrayBuffer).set(new Uint8Array(buffer));
        }
        resolve(arrayBuffer);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const decryptFile = (encryptedContent: string, key: string): Blob => {
  try {
    // Decrypt the content
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key);
    const decryptedBytes = decrypted.toString(CryptoJS.enc.Latin1);

    // Convert back to blob
    const bytes = new Uint8Array(decryptedBytes.length);
    for (let i = 0; i < decryptedBytes.length; i++) {
      bytes[i] = decryptedBytes.charCodeAt(i);
    }

    return new Blob([bytes]);
  } catch {
    throw new Error('Failed to decrypt file. Invalid key or corrupted file.');
  }
};

export const encryptMetadata = (data: unknown, key: string): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const decryptMetadata = (encryptedData: string, key: string): unknown => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch {
    throw new Error('Failed to decrypt metadata');
  }
};
