# TransferApp - File Transfer Application

A secure, fast, and universal file transfer application built with Next.js, Firebase, and end-to-end encryption.

## 🚀 Features

- **Secure File Transfer**: End-to-end AES-256 encryption
- **Universal Access**: Works on any device with a modern browser
- **PWA Support**: Install as a mobile/desktop app
- **QR Code Sharing**: Easy sharing via QR codes
- **Drag & Drop**: Intuitive file upload interface
- **Auto Expiration**: Files automatically expire after 24 hours
- **Real-time Progress**: Upload/download progress indicators

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Firebase (Firestore, Cloud Storage)
- **Encryption**: CryptoJS (AES-256)
- **QR Codes**: qrcode.react
- **PWA**: next-pwa
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account and project

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/transfer-app.git
   cd transfer-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Cloud Storage
   - Get your Firebase configuration

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   NEXT_PUBLIC_MAX_FILE_SIZE=104857600  # 100MB
   NEXT_PUBLIC_EXPIRATION_HOURS=24  # Files expire after 24 hours
   NEXT_PUBLIC_APP_NAME=TransferApp
   ```

5. **Configure Firebase Security Rules**

   **Firestore Rules** (firestore.rules):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /transfers/{transferId} {
         allow read, write: if true; // In production, add proper authentication
       }
     }
   }
   ```

   **Storage Rules** (storage.rules):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /transfers/{allPaths=**} {
         allow read, write: if true; // In production, add proper authentication
       }
     }
   }
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 PWA Installation

The app can be installed as a PWA on mobile devices and desktop:

- **Android**: Open in Chrome → Tap "Add to Home Screen"
- **iOS**: Open in Safari → Tap Share → "Add to Home Screen"
- **Desktop**: Click the install button in Chrome/Edge address bar

## 🔐 Security Features

- **Client-side encryption**: Files are encrypted in the browser before upload
- **Unique keys**: Each file gets its own encryption key
- **No plain text storage**: Firebase only stores encrypted files
- **Auto cleanup**: Files and metadata are deleted after expiration
- **Secure sharing**: Keys are shared separately from encrypted files

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── receive/[sessionId]/ # Dynamic route for receiving files
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── MainApp.tsx        # Main application component
│   ├── FileUpload.tsx     # File upload with drag & drop
│   ├── FileReceive.tsx    # File download interface
│   └── UploadResult.tsx   # Upload success page
├── hooks/                 # Custom React hooks
│   └── useFileTransfer.ts # File transfer logic
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   ├── firestore.ts       # Firestore operations
│   ├── storage.ts         # Cloud Storage operations
│   ├── encryption.ts      # AES encryption utilities
│   ├── qr.ts              # QR code generation
│   └── config.ts          # App configuration
└── types/                 # TypeScript type definitions
    └── index.ts           # Shared types
```

## 🔄 How It Works

1. **Upload Flow**:
   - User selects/drops a file
   - File is encrypted client-side with AES-256
   - Encrypted file is uploaded to Firebase Storage
   - Metadata is stored in Firestore
   - Unique 6-digit code is generated
   - QR code and shareable link are created

2. **Download Flow**:
   - Recipient enters 6-digit code or scans QR
   - App retrieves encrypted file from Storage
   - File is decrypted client-side using the encryption key
   - Decrypted file is downloaded to user's device

3. **Cleanup**:
   - Files expire after 24 hours (configurable)
   - Both encrypted files and metadata are deleted
   - One-time download prevents multiple access

## ⚙️ Configuration

Key configuration options in `src/lib/config.ts`:

- `maxFileSize`: Maximum file size (default: 100MB)
- `expirationHours`: File expiration time (default: 24 hours)
- `appName`: Application name

## 🚧 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   ```bash
   vercel --prod
   ```

3. **Set up Firebase Functions** (optional)
   For automatic cleanup of expired files, set up Firebase Functions:
   ```javascript
   // functions/index.js
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');

   exports.cleanupExpiredFiles = functions.pubsub
     .schedule('every 24 hours')
     .onRun(async (context) => {
       // Cleanup logic
     });
   ```

## 🐛 Troubleshooting

**Firebase Connection Issues**:
- Verify your Firebase configuration in `.env.local`
- Check that Firestore and Storage are enabled in your Firebase project
- Ensure proper security rules are set

**PWA Not Installing**:
- Ensure the site is served over HTTPS
- Check that the manifest.json is properly configured
- Verify service worker is registered correctly

**Encryption Errors**:
- Check that CryptoJS is properly installed
- Ensure the encryption key is correctly shared
- Verify file integrity during upload/download

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Firebase, and modern web technologies.