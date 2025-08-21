'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FileReceive from '@/components/FileReceive';
import { ArrowLeft } from 'lucide-react';

const ReceivePage: React.FC = () => {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleDownloadSuccess = () => {
    setNotification({ type: 'success', message: 'File downloaded successfully!' });
  };

  const handleDownloadError = (error: string) => {
    setNotification({ type: 'error', message: error });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">TransferApp</h1>
            <p className="text-gray-600">Download your file</p>
          </div>
          <button
            onClick={goHome}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>

      {/* Session Info */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600 mb-2">Session Code:</p>
          <code className="text-2xl font-mono bg-gray-100 px-4 py-2 rounded border">
            {sessionId}
          </code>
        </div>
      </div>

      {/* File Receive Component */}
      <FileReceive
        onDownloadSuccess={handleDownloadSuccess}
        onDownloadError={handleDownloadError}
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md animate-in fade-in duration-300 ${
          notification.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivePage;
