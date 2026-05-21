import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

let app;
let db = null;
let auth = null;
let firebaseEnabled = false;

// Check if config is a placeholder (stub)
const isPlaceholder = !firebaseConfig || 
  firebaseConfig.apiKey.includes("placeholder") || 
  firebaseConfig.projectId === "placeholder-project";

if (!isPlaceholder) {
  try {
    app = initializeApp(firebaseConfig);
    // Use the default database if they switched to their custom project (which will use "(default)")
    const dbId = (firebaseConfig.projectId && firebaseConfig.projectId !== "alex-portfolio-2d5be" && firebaseConfig.firestoreDatabaseId?.startsWith("ai-studio-"))
      ? "(default)"
      : (firebaseConfig.firestoreDatabaseId || "(default)");
    db = getFirestore(app, dbId);
    auth = getAuth(app);
    firebaseEnabled = true;
    console.log("🔥 Firebase initialized successfully with configuration:", firebaseConfig.projectId, "DB:", dbId);
    
    // Validate connection to Firestore on initialization (Phase 0 of skill)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error && error.message && error.message.includes('offline')) {
          console.error("Please check your Firebase configuration or network connection.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("❌ Failed to initialize Firebase:", err);
  }
} else {
  console.log("ℹ️ Running in Local Fallback mode. Configure Firebase in the side panel for secure cloud storage!");
}

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

// Error Handler conformant with FirestoreErrorInfo schema from SKILL.md
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
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
  throw new Error(JSON.stringify(errInfo));
}

// Auth operations
export const signInWithGoogle = async () => {
  if (!firebaseEnabled || !auth) {
    throw new Error("Firebase Auth is not configured. Falling back to offline mode.");
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (auth) {
    await signOut(auth);
  }
};

export { app, db, auth, firebaseEnabled, firebaseConfig };
