// Mock Firebase configuration for testing
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
} as any;

export const getFirebaseAuthErrorMessage = (errorCode: string): string => {
  return 'Firebase error';
};

export default {
  auth,
  getFirebaseAuthErrorMessage,
};
