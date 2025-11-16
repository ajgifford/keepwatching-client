import { FirebaseError, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function getFirebaseAuthErrorMessage(error: FirebaseError, defaultMessage: string) {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Invalid credentials were entered. Check your email & password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/wrong-password':
      return 'The password you entered is incorrect.';
    case 'auth/user-disabled':
      return 'Your account has been disabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/operation-not-allowed':
      return 'Sign-in is currently disabled. Contact support.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists, sign in or use another email.';
    case 'auth/requires-recent-login':
      return 'You need to reauthenticate before updating your account.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in cancelled.';
    default:
      console.error('An unknown error occurred:', error.message);
      return defaultMessage;
  }
}
