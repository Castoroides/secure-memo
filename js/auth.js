// js/auth.js
// =======================================
// Firebase Authentication（UI非依存）
// =======================================

import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;

/**
 * 認証初期化
 * @param {Object} options
 * @param {(user: any) => void} options.onLogin
 * @param {() => void} options.onLogout
 */
export function initAuth({ onLogin, onLogout } = {}) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      onLogin?.(user);
    } else {
      currentUser = null;
      onLogout?.();
    }
  });
}

/**
 * Googleログイン
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

/**
 * ログアウト（アカウント変更）
 */
export async function logout() {
  await signOut(auth);
}

/**
 * 現在のユーザー取得
 */
export function getCurrentUser() {
  return currentUser;
}
