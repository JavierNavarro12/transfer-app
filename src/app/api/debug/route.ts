import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Firebase Debug Info',
    env: {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      hasAllKeys: !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      )
    },
    partial: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 20) + '...'
    }
  });
}
