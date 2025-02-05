import { getAnalytics } from 'firebase/analytics';
import { FirebaseError, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

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
