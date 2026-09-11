import admin from 'firebase-admin'
import { env } from '../config/env'

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Private key comes with literal \n that need to be real newlines
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
}

export const firebaseAuth = admin.auth()

export interface DecodedFirebaseToken {
  uid: string
  email: string
  name?: string
  picture?: string
  email_verified: boolean
}

/** Verifies a Firebase ID token sent from the frontend after Google sign-in */
export async function verifyFirebaseToken(idToken: string): Promise<DecodedFirebaseToken> {
  const decoded = await firebaseAuth.verifyIdToken(idToken)
  return {
    uid: decoded.uid,
    email: decoded.email ?? '',
    name: decoded.name,
    picture: decoded.picture,
    email_verified: decoded.email_verified ?? false,
  }
}
