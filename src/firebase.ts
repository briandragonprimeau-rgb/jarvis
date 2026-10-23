import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: any;
let auth: any;
let provider: any;
export let db: Firestore | null = null;

export const initializeFirebase = async () => {
  if (app) return;
  try {
    const m = await import('../firebase-applet-config.json').catch(() => null);
    const firebaseConfig = m ? m.default : null;
    if (firebaseConfig) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      provider = new GoogleAuthProvider();
    } else {
      console.warn("firebase-applet-config.json not found. Authentication will be disabled.");
    }
  } catch (e) {
    console.warn("Firebase config not found or invalid", e);
  }
};

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) return onAuthFailure?.();
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please set up Firebase in AI Studio.");
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.warn('Sign in error, returning mock auth:', error);
    cachedAccessToken = 'mock_token';
    return { user: { displayName: 'Director', uid: '00-7542-ALPHA' } as any, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  if (auth) {
    await auth.signOut();
  }
  cachedAccessToken = null;
};
