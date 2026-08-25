import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  department: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Map Firebase Auth error codes to friendly Spanish messages
export function formatAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'El correo electrónico ya se encuentra registrado.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/operation-not-allowed':
      return 'La operación no está permitida.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido deshabilitada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos. Revisa tus datos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por favor, intentalo más tarde.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Comprueba tu red de internet.';
    default:
      return error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
  }
}

// Fetch user profile document from Firestore users/{uid}
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Register new user & store profile in Firestore users/{uid} with default role: 'user'
export async function registerUser(data: RegisterData): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName: data.displayName.trim() });
  } catch {
    // Profile update is non-critical; proceed even if it fails
  }

  const profileData: Omit<UserProfile, 'uid'> = {
    email: data.email.trim().toLowerCase(),
    displayName: data.displayName.trim(),
    role: 'user', // Default role MUST be 'user'
    department: data.department.trim(),
    phone: data.phone.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', user.uid), profileData);
  } catch {
    // Firestore write may fail due to security rules; the user is already
    // authenticated via Firebase Auth, so the AuthContext will fetch
    // whatever profile exists (or null) on auth state change.
  }

  return {
    uid: user.uid,
    ...profileData,
  };
}

// Login user
export async function loginUser(data: LoginData): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, data.email.trim(), data.password);
  return userCredential.user;
}

// Logout user
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Reset password email
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

// Helper to update user profile details (not role!)
export async function updateUserProfileDetails(
  uid: string,
  details: Partial<Pick<UserProfile, 'displayName' | 'department' | 'phone'>>
): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...details,
    updatedAt: serverTimestamp(),
  });
}
