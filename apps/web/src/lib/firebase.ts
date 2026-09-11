import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'],
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'],
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
  storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'],
  appId: import.meta.env['VITE_FIREBASE_APP_ID'],
}

const app = initializeApp(firebaseConfig)
export const firebaseAuthInstance = getAuth(app)

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

/**
 * Opens the Google sign-in popup and returns a fresh Firebase ID token.
 * This token is sent to our API once — the API verifies it and issues our own JWT.
 */
export async function signInWithGoogle(): Promise<string> {
  const result = await signInWithPopup(firebaseAuthInstance, googleProvider)
  const idToken = await result.user.getIdToken()
  return idToken
}

export async function firebaseSignOutUser(): Promise<void> {
  await firebaseSignOut(firebaseAuthInstance)
}
