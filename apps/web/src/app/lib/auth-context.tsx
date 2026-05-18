import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  isFirebaseConfigured,
  onFirebaseUserChanged,
  sendResetEmail,
  signInWithEmail as firebaseSignInWithEmail,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutFirebase,
  signUpWithEmail as firebaseSignUpWithEmail,
  translateFirebaseError,
} from "./firebase";
import { authApi, setApiTokenProvider, usersApi, type User as VaultioUser } from "./api";

interface AuthContextValue {
  loading: boolean;
  firebaseUser: FirebaseUser | null;
  profile: VaultioUser | null;
  configError: string | null;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (input: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: Partial<Pick<VaultioUser, "firstName" | "lastName" | "bio" | "photoUrl">> & { careerIds?: number[] }) => Promise<VaultioUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface PendingSignupProfile {
  firstName: string;
  lastName: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<VaultioUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const currentUserRef = useRef<FirebaseUser | null>(null);
  const pendingProfileRef = useRef<PendingSignupProfile | null>(null);

  useEffect(() => {
    setApiTokenProvider(async () => {
      const user = currentUserRef.current;
      if (!user) return null;
      try {
        return await user.getIdToken();
      } catch {
        return null;
      }
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setConfigError(
        "Firebase no está configurado. Copia apps/web/.env.example a apps/web/.env.local y completá las variables VITE_FIREBASE_*.",
      );
      setLoading(false);
      return;
    }

    const unsubscribe = onFirebaseUserChanged(async (user) => {
      try {
        if (!user) {
          currentUserRef.current = null;
          setFirebaseUser(null);
          setProfile(null);
          return;
        }

        currentUserRef.current = user;
        setFirebaseUser(user);

        let synced = (await authApi.me()).user;

        const pending = pendingProfileRef.current;
        if (pending && (synced.firstName !== pending.firstName || synced.lastName !== pending.lastName)) {
          synced = await usersApi.updateMe({
            firstName: pending.firstName,
            lastName: pending.lastName,
          });
        }
        pendingProfileRef.current = null;

        setProfile(synced);
        setError(null);
      } catch (authError) {
        const message = translateFirebaseError(authError);
        setError(message);
        try {
          await signOutFirebase();
        } catch {
          /* ignore */
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSignInWithGoogle();
    } catch (signInError) {
      setLoading(false);
      const message = translateFirebaseError(signInError);
      setError(message);
      throw signInError;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSignInWithEmail(email, password);
    } catch (signInError) {
      setLoading(false);
      const message = translateFirebaseError(signInError);
      setError(message);
      throw signInError;
    }
  }, []);

  const signUpWithEmail = useCallback(
    async ({ email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string }) => {
      setError(null);
      setLoading(true);
      try {
        pendingProfileRef.current = { firstName, lastName };
        await firebaseSignUpWithEmail(email, password, `${firstName} ${lastName}`.trim());
      } catch (signUpError) {
        pendingProfileRef.current = null;
        setLoading(false);
        const message = translateFirebaseError(signUpError);
        setError(message);
        throw signUpError;
      }
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    setError(null);
    try {
      await sendResetEmail(email);
    } catch (resetError) {
      const message = translateFirebaseError(resetError);
      setError(message);
      throw resetError;
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutFirebase();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!currentUserRef.current) return;
    const { user } = await authApi.me();
    setProfile(user);
  }, []);

  const updateProfile = useCallback(
    async (input: Partial<Pick<VaultioUser, "firstName" | "lastName" | "bio" | "photoUrl">> & { careerIds?: number[] }) => {
      const updated = await usersApi.updateMe(input);
      setProfile(updated);
      return updated;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      firebaseUser,
      profile,
      configError,
      error,
      clearError,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [
      loading,
      firebaseUser,
      profile,
      configError,
      error,
      clearError,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      signOut,
      refreshProfile,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
