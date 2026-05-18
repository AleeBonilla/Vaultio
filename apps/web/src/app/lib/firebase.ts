import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  type Auth,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps()[0] || initializeApp(firebaseConfig)
  : null;

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
if (firebaseAuth) void setPersistence(firebaseAuth, browserLocalPersistence);

function requireAuth(): Auth {
  if (!firebaseAuth) throw new Error("Firebase no esta configurado en el frontend");
  return firebaseAuth;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(requireAuth(), provider);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password);
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
  if (displayName) {
    try {
      await updateFirebaseProfile(credential.user, { displayName });
    } catch {
      /* non-fatal */
    }
  }
  return credential;
}

export async function sendResetEmail(email: string) {
  return sendPasswordResetEmail(requireAuth(), email);
}

export async function getFirebaseIdToken() {
  if (!firebaseAuth?.currentUser) return null;
  return firebaseAuth.currentUser.getIdToken();
}

export function onFirebaseUserChanged(callback: (user: User | null) => void) {
  if (!firebaseAuth) return () => undefined;
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function signOutFirebase() {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}

const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Ya existe una cuenta con este correo. Iniciá sesión.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/user-not-found": "No encontramos una cuenta con ese correo.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/invalid-credential": "Credenciales inválidas. Verificá correo y contraseña.",
  "auth/popup-closed-by-user": "Cancelaste el inicio de sesión con Google.",
  "auth/cancelled-popup-request": "Hay otro inicio de sesión en curso.",
  "auth/operation-not-allowed": "Este método de inicio de sesión no está habilitado en Firebase Auth.",
  "auth/too-many-requests": "Demasiados intentos. Esperá un momento e intentá de nuevo.",
  "auth/network-request-failed": "Sin conexión. Verificá tu red.",
};

export function translateFirebaseError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    if (code && FIREBASE_AUTH_ERROR_MESSAGES[code]) return FIREBASE_AUTH_ERROR_MESSAGES[code];
    return error.message;
  }
  return "Ocurrió un error inesperado";
}
