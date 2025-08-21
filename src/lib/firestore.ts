import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { TransferSession } from '@/types';

export const saveTransferSession = async (session: TransferSession): Promise<void> => {
  try {
    await setDoc(doc(db, 'transfers', session.id), {
      ...session,
      uploadDate: session.uploadDate.toISOString(),
      expirationDate: session.expirationDate.toISOString(),
    });
  } catch (error) {
    console.error('Error saving transfer session:', error);
    throw new Error('Failed to save transfer session');
  }
};

export const getTransferSession = async (sessionId: string): Promise<TransferSession | null> => {
  try {
    const docRef = doc(db, 'transfers', sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        uploadDate: new Date(data.uploadDate),
        expirationDate: new Date(data.expirationDate),
      } as TransferSession;
    }

    return null;
  } catch (error) {
    console.error('Error getting transfer session:', error);
    throw new Error('Failed to get transfer session');
  }
};

export const markAsDownloaded = async (sessionId: string): Promise<void> => {
  try {
    const session = await getTransferSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check if expired
    if (new Date() > session.expirationDate) {
      throw new Error('Session has expired');
    }

    await updateDoc(doc(db, 'transfers', sessionId), {
      downloaded: true,
      downloadCount: session.downloadCount + 1,
    });
  } catch (error) {
    console.error('Error marking as downloaded:', error);
    throw error;
  }
};

export const deleteTransferSession = async (sessionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'transfers', sessionId));
  } catch (error) {
    console.error('Error deleting transfer session:', error);
    throw new Error('Failed to delete transfer session');
  }
};

export const cleanupExpiredSessions = async (): Promise<void> => {
  // This would typically be handled by Firebase Functions
  // For now, we'll implement client-side cleanup when accessing expired sessions
  try {
    // Note: In production, use Firebase Functions for server-side cleanup

  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
