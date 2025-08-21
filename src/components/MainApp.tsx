'use client';

import React, { useState } from 'react';
import { Upload, Download, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import FileReceive from './FileReceive';
import UploadResult from './UploadResult';

type AppMode = 'home' | 'upload' | 'receive' | 'upload-success';

const MainApp: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('home');
  const [uploadResult, setUploadResult] = useState<{
    sessionId: string;
    encryptionKey: string;
    fileName: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadSuccess = (sessionId: string, encryptionKey: string) => {
    setUploadResult({ sessionId, encryptionKey, fileName: 'Uploaded file' });
    setMode('upload-success');
    showNotification('success', 'File uploaded successfully!');
  };

  const handleUploadError = (error: string) => {
    showNotification('error', error);
  };

  const handleDownloadSuccess = () => {
    showNotification('success', 'File downloaded successfully!');
  };

  const handleDownloadError = (error: string) => {
    showNotification('error', error);
  };

  const resetToHome = () => {
    setMode('home');
    setUploadResult(null);
  };

  const goBack = () => {
    if (mode === 'upload-success') {
      resetToHome();
    } else {
      setMode('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TransferApp</h1>
          <p className="text-gray-600">Transfer files securely and quickly</p>
        </div>
      </div>

      {/* Navigation */}
      {mode !== 'home' && (
        <div className="max-w-4xl mx-auto mb-6">
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {mode === 'home' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Send File Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Send File</h2>
              <p className="text-gray-600 mb-6">
                Upload a file and get a unique code and QR code to share with others.
                Your files are encrypted before upload for maximum security.
              </p>
              <button
                onClick={() => setMode('upload')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-visible"
              >
                Upload File
              </button>
            </div>

            {/* Receive File Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Receive File</h2>
              <p className="text-gray-600 mb-6">
                Enter a 6-digit code or scan a QR code to download a shared file.
                Files are automatically decrypted on your device.
              </p>
              <button
                onClick={() => setMode('receive')}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus-visible"
              >
                Download File
              </button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {mode === 'receive' && (
          <FileReceive
            onDownloadSuccess={handleDownloadSuccess}
            onDownloadError={handleDownloadError}
          />
        )}

        {mode === 'upload-success' && uploadResult && (
          <UploadResult
            sessionId={uploadResult.sessionId}
            encryptionKey={uploadResult.encryptionKey}
            fileName={uploadResult.fileName}
            onReset={resetToHome}
          />
        )}
      </div>

      {/* Features Section */}
      {mode === 'home' && (
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose TransferApp?</h2>
            <p className="text-gray-600">Fast, secure, and reliable file transfers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600">Files are encrypted on your device before upload and decrypted only on the recipient's device.</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Optimized for speed with direct downloads and minimal latency.</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">PWA Support</h3>
              <p className="text-gray-600">Install as an app on your phone or desktop for the best experience.</p>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md animate-in fade-in duration-300 ${
          notification.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainApp;
