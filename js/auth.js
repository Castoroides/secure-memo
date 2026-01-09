// js/auth.js
// =======================================
// Firebase Authentication（UI非依存）
// =======================================

import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser; // undefined = 判定中

// -----------------------------
// 認証操作
// -----------------------------
export async function login() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}

// -----------------------------
// 認証初期化
// -----------------------------
export function initAuth({ onLogin, onLogout, onReady } = {}) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user ?? null;

    if (user) {
      onLogin?.(user);
    } else {
      onLogout?.();
    }

    onReady?.(currentUser);
  });
}

// -----------------------------
// 状態取得
// -----------------------------
export function getCurrentUser() {
  return currentUser;
}
