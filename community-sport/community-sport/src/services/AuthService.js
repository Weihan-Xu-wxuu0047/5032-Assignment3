import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../firebase.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentRole = null;
    this.authStateListeners = [];
    
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        try {
          // Get role from Firestore
          const userDoc = await getDoc(doc(db, 'user-information', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Use last login role or default to first available role
            this.currentRole = userData.lastLoginRole || 
                             (userData.roles && userData.roles[0]) || 
                             userData.role || null;
          } else {
            // No user document found
            this.currentRole = null;
          }
        } catch (error) {
          console.error('Error getting user role from Firestore:', error);
          this.currentRole = null;
        }
      } else {
        this.currentRole = null;
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(callback => {
        callback(this.currentUser, this.currentRole);
      });
    });
  }

  // Register a new user with role (supports multiple roles)
  async register(userName, email, password, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user document already exists in Firestore
      const userDocRef = doc(db, 'user-information', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userRoles = [];
      
      if (userDoc.exists()) {
        // User document exists, get existing roles
        const userData = userDoc.data();
        userRoles = userData.roles || (userData.role ? [userData.role] : []);
        
        // Add new role if not already present
        if (!userRoles.includes(role)) {
          userRoles.push(role);
          
          // Update existing document with new role
          await updateDoc(userDocRef, {
            userName: userName, // Update userName if provided
            roles: userRoles,
            lastLoginRole: role,
            lastUpdated: new Date().toISOString()
          });
        } else {
          // Role already exists, just update last login role and userName
          await updateDoc(userDocRef, {
            userName: userName, // Update userName if provided
            lastLoginRole: role,
            lastUpdated: new Date().toISOString()
          });
        }
      } else {
        // Create new user document
        userRoles = [role];
        const userRoleData = {
          uid: user.uid,
          userName: userName,
          email: email,
          roles: userRoles,
          role: role, // Keep for backward compatibility
          lastLoginRole: role,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        await setDoc(userDocRef, userRoleData);
        console.log('User document created successfully:', userRoleData);
      }
      
      // Set current role immediately for the auth state listener
      this.currentRole = role;
      
      return {
        user: user,
        role: role,
        availableRoles: userRoles
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Login user with role validation (supports multiple roles)
  async login(email, password, expectedRole) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user document from Firestore
      const userDocRef = doc(db, 'user-information', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // User exists in Auth but not in Firestore
        console.warn('User exists in Auth but not in Firestore. Creating user document...');
        try {
        const defaultUserData = {
          uid: user.uid,
          userName: user.email.split('@')[0], // Default userName from email
          email: user.email,
          roles: [expectedRole],
          role: expectedRole, // Keep for backward compatibility
          lastLoginRole: expectedRole,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          recoveredFromAuth: true // Flag to indicate this was recovered
        };
          
          await setDoc(userDocRef, defaultUserData);
          console.log(' User document created during login recovery');
          this.currentRole = expectedRole;
          
          return {
            user: user,
            role: expectedRole,
            availableRoles: [expectedRole]
          };
        } catch (firestoreError) {
          console.error(' Failed to create user document during login:', firestoreError);
          throw new Error('Unable to create user profile. Please check Firestore permissions or try registering again.');
        }
      }
      
      const userData = userDoc.data();
      
      // Handle both old single role format and new multiple roles format
      let userRoles = [];
      if (userData.roles && Array.isArray(userData.roles)) {
        userRoles = userData.roles;
      } else if (userData.role) {
        userRoles = [userData.role];
        // Upgrade old format to new format
        await updateDoc(userDocRef, {
          roles: userRoles,
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Check if user has the expected role
      if (!this.hasRole(userRoles, expectedRole)) {
        const availableRoles = userRoles.join(', ');
        throw new Error(`This account does not have ${expectedRole} access. Available roles: ${availableRoles}. Please use the correct login portal or register for this role.`);
      }
      
      // Update last login role
      await updateDoc(userDocRef, {
        lastLoginRole: expectedRole,
        lastLoginAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      this.currentRole = expectedRole;
      
      return {
        user: user,
        role: expectedRole,
        availableRoles: userRoles
      };
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Check if user has a specific role (supports multiple roles)
  hasRole(userRoles, requiredRole) {
    if (typeof userRoles === 'string') {
      return userRoles === requiredRole;
    }
    if (Array.isArray(userRoles)) {
      return userRoles.includes(requiredRole);
    }
    return false;
  }

  // Logout user (preserve role data for future logins)
  // Don't clear role data from localStorage - preserve for future logins
  // Only clear current session data
  async logout() {
    try {
      
      
      await signOut(auth);
      this.currentUser = null;
      this.currentRole = null;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get current user info with available roles
  async getCurrentUser() {
    let availableRoles = [];
    let userName = null;
    if (this.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'user-information', this.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          availableRoles = userData.roles || (userData.role ? [userData.role] : []);
          userName = userData.userName || null;
        }
      } catch (error) {
        console.error('Error getting user roles from Firestore:', error);
        availableRoles = [];
      }
    }
    
    return {
      user: this.currentUser,
      role: this.currentRole,
      availableRoles: availableRoles,
      userName: userName
    };
  }

  // Get current user info synchronously
  getCurrentUserSync() {
    return {
      user: this.currentUser,
      role: this.currentRole,
      availableRoles: [] 
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Check if user has specific role
  hasCurrentRole(role) {
    return this.currentRole === role;
  }

  // switch user's current role , if they have multiple roles
  async switchRole(newRole) {
    if (this.currentUser) {
      try {
        const userDocRef = doc(db, 'user-information', this.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRoles = userData.roles || (userData.role ? [userData.role] : []);
          
          if (userRoles.includes(newRole)) {
            this.currentRole = newRole;
            
            // Update last login role in Firestore
            await updateDoc(userDocRef, {
              lastLoginRole: newRole,
              lastRoleSwitchAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            });
            
            // Notify all listeners of the role change
            this.authStateListeners.forEach(callback => {
              callback(this.currentUser, this.currentRole);
            });
            
            return true;
          }
        }
      } catch (error) {
        console.error('Error switching role:', error);
      }
    }
    return false;
  }

  // Add a new role to existing user
  async addRoleToUser(newRole) {
    if (this.currentUser) {
      try {
        const userDocRef = doc(db, 'user-information', this.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          let userRoles = userData.roles || (userData.role ? [userData.role] : []);
          
          if (!userRoles.includes(newRole)) {
            userRoles.push(newRole);
            
            await updateDoc(userDocRef, {
              roles: userRoles,
              lastUpdated: new Date().toISOString()
            });
            
            return true;
          }
        }
      } catch (error) {
        console.error('Error adding role to user:', error);
      }
    }
    return false;
  }

  //auth state listener
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  }

  // Get user-friendly error messages
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'permission-denied':
        return 'Permission denied. Please check your Firestore security rules or contact support.';
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again later.';
      case 'failed-precondition':
        return 'Database operation failed. Please try again.';
      default:
        console.error('Full error details:', error);
        return error.message || 'An error occurred. Please try again.';
    }
  }

}

// Create singleton instance
export const authService = new AuthService();
export default authService;
