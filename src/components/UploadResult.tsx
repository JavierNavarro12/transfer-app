'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Share2, CheckCircle } from 'lucide-react';
import { generateShareableLink } from '@/lib/qr';
import { config } from '@/lib/config';

interface UploadResultProps {
  sessionId: string;
  fileName: string;
  onReset: () => void;
}

const UploadResult: React.FC<UploadResultProps> = ({
  sessionId,
  fileName,
  onReset,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>('');

  useEffect(() => {
    const link = generateShareableLink(sessionId);
    setShareableLink(link);
  }, [sessionId]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadQRCode = () => {
    const svg = document.querySelector('#qr-code svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `transfer-${sessionId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'File Transfer',
          text: `Download ${fileName}`,
          url: shareableLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(shareableLink, 'link');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            File Uploaded Successfully!
          </h2>
          <p className="text-green-600">
            Share the code or QR code below to let others download your file
          </p>
        </div>

        {/* Session Code */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🔐</span>
            Session Code
          </h3>
          <div className="flex items-center space-x-3">
            <code className="text-2xl font-mono bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-2 rounded-lg border-2 border-slate-700 flex-1 text-center tracking-[0.25em] shadow-md font-bold">
              {sessionId}
            </code>
            <button
              onClick={() => copyToClipboard(sessionId, 'code')}
              className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              title="Copy code"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">📱</span>
              QR Code
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={downloadQRCode}
                className="p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Download QR code"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={shareLink}
                className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex justify-center" id="qr-code">
            <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-100">
              <QRCodeSVG
                value={shareableLink}
                size={240}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Shareable Link */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔗</span>
            Shareable Link
          </h3>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={shareableLink}
              readOnly
              className="flex-1 p-4 bg-gray-50 border-2 border-green-300 rounded-xl text-base font-mono text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={() => copyToClipboard(shareableLink, 'link')}
              className="p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Copy link"
            >
              <Copy className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Important Information</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Files expire after {config.expirationHours} hours</li>
            <li>• Files are automatically deleted after download</li>
            <li>• Keep this code safe - it&apos;s required for downloading</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Upload Another File
          </button>
        </div>

        {/* Copy notification */}
        {copiedText && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in duration-300">
            {copiedText} copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResult;
