// ═══════════════════════════════════════════════════════════════════
// Savoy FOH — Firebase Auth & Access Logging
// ═══════════════════════════════════════════════════════════════════
// Firebase config — replace with your actual Savoy project credentials
// from Firebase Console > Project Settings > Your apps > Config.
// NOTE: This currently reuses the Petrus project config. Create a new
// Firebase project for Savoy and paste its config here to keep the
// data separate from Petrus.

const firebaseConfig = {
  apiKey: "AIzaSyAZSXeztJmLCTlaTYYPqjhpAEJTNaWg6so",
  authDomain: "petrus-foh.firebaseapp.com",
  projectId: "petrus-foh",
  storageBucket: "petrus-foh.firebasestorage.app",
  messagingSenderId: "757004948096",
  appId: "1:757004948096:web:7172cd15aaf80b35410c65"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── Guest Guard (auto-redirect guests away from restricted pages) ──
(function() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  var guestAllowed = ['training.html', 'winelist.html', 'index.html'];
  var sommPages = ['sommeliers.html','somm-stocktake.html'];
  var sommAllowed = ['christian@savoy.local','milena@savoy.local','fiorella@savoy.local'];
  if (guestAllowed.indexOf(page) < 0) {
    auth.onAuthStateChanged(function(user) {
      if (!user) return;
      // Guest: only training
      if (user.email && user.email.startsWith('guest')) {
        window.location.href = 'training.html';
        return;
      }
      // Somm pages: only somm team
      if (sommPages.indexOf(page) >= 0 && sommAllowed.indexOf(user.email) < 0) {
        window.location.href = 'index.html';
      }
    });
  }
})();

// ── Auth Functions ────────────────────────────────────────────────

/**
 * Login with display name and personal code.
 * Internally uses email: name@savoy.local / password: code
 */
async function savoyLogin(name, code) {
  const email = name.toLowerCase().replace(/\s+/g, '.') + '@savoy.local';
  try {
    const cred = await auth.signInWithEmailAndPassword(email, code);
    await logAccess(cred.user, 'login');
    return { success: true, user: cred.user };
  } catch (err) {
    console.error('Login error:', err.code);
    return { success: false, error: getErrorMessage(err.code) };
  }
}

/**
 * Logout current user
 */
async function savoyLogout() {
  const user = auth.currentUser;
  if (user) {
    await logAccess(user, 'logout');
  }
  await auth.signOut();
}

/**
 * Log access event to Firestore
 */
async function logAccess(user, action, page) {
  try {
    await db.collection('savoy_access_logs').add({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0].replace(/\./g, ' '),
      action: action,
      page: page || window.location.pathname.split('/').pop() || 'index.html',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent
    });
  } catch (err) {
    console.error('Log error:', err);
  }
}

/**
 * Check if user is authenticated. If not, redirect to index.
 */
function requireAuth() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        logAccess(user, 'page_view');
        resolve(user);
      } else {
        window.location.href = 'index.html';
      }
    });
  });
}

/**
 * Get current auth state (non-blocking)
 */
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// ── Helper Functions ──────────────────────────────────────────────

function getErrorMessage(code) {
  switch (code) {
    case 'auth/user-not-found':
      return 'User not found. Check your name.';
    case 'auth/wrong-password':
      return 'Incorrect code. Try again.';
    case 'auth/invalid-email':
      return 'Invalid name format.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/invalid-credential':
      return 'Incorrect name or code.';
    default:
      return 'Login failed. Please try again.';
  }
}
