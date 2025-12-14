// Authentication Logic
import { auth, database } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updatePassword,
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, get, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Check authentication state and redirect if needed
export function checkAuth(requiredRole = null) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in
        if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('/')) {
          window.location.href = '/index.html';
        }
        reject('Not authenticated');
      } else {
        // User is logged in, check role
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            
            if (requiredRole && userData.role !== requiredRole) {
              // Wrong role
              window.location.href = '/index.html';
              reject('Insufficient permissions');
            } else {
              resolve({ user, userData });
            }
          } else {
            // User data not found
            await signOut(auth);
            window.location.href = '/index.html';
            reject('User data not found');
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          reject(error);
        }
      }
    });
  });
}

// Login function
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return { success: true, role: userData.role, user };
    } else {
      throw new Error('User data not found');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    await signOut(auth);
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Change password function
export async function changePassword(newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Create user (admin only)
export async function createUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user data in database
    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      username: username,
      email: email,
      role: 'user',
      createdAt: new Date().toISOString()
    });
    
    return { success: true, userId: user.uid };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}
