import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, Auth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: any;
let db: Firestore;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
} catch (e) {
  console.error('Firebase init failed, running in offline mode:', e);
  // Create mock objects for offline mode
  db = null as any;
  auth = {
    currentUser: null,
    onAuthStateChanged: (cb: any) => {
      cb(null);
      return () => {};
    },
    signInWithPopup: () => Promise.reject('Firebase offline'),
    signOut: () => Promise.resolve(),
  } as any;
}

const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
export type { Auth, Firestore };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

import { toast } from 'sonner';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  toast.error(`Database Error: ${errInfo.error}`);
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  if (!db) {
    console.warn('Firestore offline, skipping connection test');
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();