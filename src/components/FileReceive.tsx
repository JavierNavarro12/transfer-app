'use client';

import React, { useState, useRef, useCallback } from 'react';
import { QrCode, Download, File, AlertCircle, CheckCircle } from 'lucide-react';
import { useFileTransfer } from '@/hooks/useFileTransfer';

interface FileReceiveProps {
  onDownloadSuccess: () => void;
  onDownloadError: (error: string) => void;
}

const FileReceive: React.FC<FileReceiveProps> = ({ onDownloadSuccess, onDownloadError }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [downloadedFile, setDownloadedFile] = useState<{ name: string; blob: Blob } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { downloadFile, isDownloading, downloadProgress, checkSession } = useFileTransfer();

  const handleCodeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionCode.trim()) {
      onDownloadError('Please enter a session code');
      return;
    }

    try {
      // Check if session exists and is valid
      const session = await checkSession(sessionCode.toUpperCase());
      if (!session) {
        onDownloadError('Invalid or expired session code');
        return;
      }

      // Download the file
      const result = await downloadFile(sessionCode.toUpperCase());

      if (result.success) {
        setDownloadedFile({ name: result.fileName, blob: result.fileBlob });
        onDownloadSuccess();
      } else {
        onDownloadError(result.error || 'Download failed');
      }
    } catch (error) {
      onDownloadError(error instanceof Error ? error.message : 'Download failed');
    }
  }, [sessionCode, downloadFile, checkSession, onDownloadSuccess, onDownloadError]);

  const handleQRScan = useCallback((data: string) => {
    // Extract session code from URL if it's a full URL
    const urlMatch = data.match(/\/receive\/([A-Z0-9]{6})/);
    if (urlMatch) {
      setSessionCode(urlMatch[1]);
    } else if (data.length === 6 && /^[A-Z0-9]+$/.test(data)) {
      setSessionCode(data);
    } else {
      onDownloadError('Invalid QR code format');
    }
    setShowQRScanner(false);
  }, [onDownloadError]);

  const downloadFileToDevice = useCallback(() => {
    if (!downloadedFile) return;

    const url = URL.createObjectURL(downloadedFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [downloadedFile]);

  const resetForm = useCallback(() => {
    setSessionCode('');
    setDownloadedFile(null);
    setShowQRScanner(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!downloadedFile ? (
        <div className="bg-white border rounded-xl p-6 space-y-6">
          <div className="text-center">
            <Download className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Download File
            </h2>
            <p className="text-gray-600">
              Enter the 6-digit code or scan the QR code to download your file
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700 mb-2">
                Session Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="sessionCode"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="flex-1 p-4 text-2xl font-mono text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest"
                  maxLength={6}
                  pattern="[A-Z0-9]{6}"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowQRScanner(!showQRScanner)}
                  className={`p-4 border rounded-lg transition-colors ${
                    showQRScanner
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                  title="Scan QR code"
                >
                  <QrCode className="w-6 h-6" />
                </button>
              </div>
            </div>

            {showQRScanner && (
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">QR Scanner would be implemented here</p>
                <p className="text-xs text-gray-500">
                  In a production app, you'd integrate a QR scanner library like @zxing/browser
                </p>
                <button
                  type="button"
                  onClick={() => handleQRScan('ABC123')} // Mock QR scan for demo
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Simulate QR Scan (Demo)
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isDownloading || sessionCode.length !== 6}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </>
              )}
            </button>
          </form>

          {isDownloading && downloadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              File Downloaded Successfully!
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <File className="w-6 h-6 text-green-600" />
              <span className="text-lg font-medium text-green-800">
                {downloadedFile.name}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-gray-600 mb-4">
              Your file has been decrypted and is ready to save to your device.
            </p>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={downloadFileToDevice}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device</span>
              </button>

              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Download Another File
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Security Notice</h4>
            <p className="text-sm text-blue-700">
              This file was encrypted during transfer and has been decrypted locally on your device.
              The original encrypted file has been deleted from our servers for your privacy and security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileReceive;
