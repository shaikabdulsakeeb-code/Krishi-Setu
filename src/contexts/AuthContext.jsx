import { useEffect, useState } from 'react';
import { AuthContext } from './authStateContext';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import { get, ref, set } from 'firebase/database';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileIssue, setProfileIssue] = useState('');

  function cacheKey(user) {
    return `harvie-profile-${user.uid}`;
  }

  function saveCachedProfile(user, profile) {
    sessionStorage.setItem(cacheKey(user), JSON.stringify(profile));
  }

  function getCachedProfile(user) {
    try {
      const cached = sessionStorage.getItem(cacheKey(user));
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  function buildStarterProfile(user, role) {
    return {
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'Harvie user',
      profilePic: user.photoURL || '',
      role,
      createdAt: new Date().toISOString(),
      profileCompleted: false,
    };
  }

  async function register(email, password, role) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const profile = buildStarterProfile(user, role);
    const userDocRef = ref(db, `users/${user.uid}`);
    await set(userDocRef, profile);
    saveCachedProfile(user, profile);
    setUserData(profile);
    
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle(role = 'buyer') {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const userDocRef = ref(db, `users/${user.uid}`);
    const userDoc = await get(userDocRef);

    const profile = userDoc.exists() ? userDoc.val() : buildStarterProfile(user, role);
    if (!userDoc.exists()) await set(userDocRef, profile);
    saveCachedProfile(user, profile);
    setUserData(profile);

    return { user, profile };
  }

  function logout() {
    return signOut(auth);
  }

  function updateProfileData(profile) {
    if (currentUser) saveCachedProfile(currentUser, profile);
    setUserData(profile);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);
      setProfileIssue('');
      const cachedProfile = user ? getCachedProfile(user) : null;
      setUserData(cachedProfile);
      if (user) {
        try {
          const docRef = ref(db, `users/${user.uid}`);
          let profile = null;
          for (let attempt = 0; attempt < 3; attempt += 1) {
            const docSnap = await get(docRef);
            if (docSnap.exists()) {
              profile = docSnap.val();
              break;
            }
            if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 200));
          }
          if (!profile) {
            profile = buildStarterProfile(user, 'buyer');
            await set(docRef, profile);
          }
          saveCachedProfile(user, profile);
          setUserData(profile);
        } catch (error) {
          console.error('Could not load the user profile.', error);
          const fallbackProfile = cachedProfile || buildStarterProfile(user, 'buyer');
          saveCachedProfile(user, fallbackProfile);
          setUserData(fallbackProfile);
          setProfileIssue('Your dashboard is open, but the profile could not be synced to Realtime Database. Check your database URL and security rules.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfileData,
    loading,
    profileIssue
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
