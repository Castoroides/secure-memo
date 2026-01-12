// js/auth.js
// =======================================
// Firebase Authentication（UI非依存）
// iPhone対策: popup -> redirect
// 初回 user=null で onLogout を呼ばない（「ログアウトしました」抑制）
// =======================================

import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser; // undefined = 判定中 / null = 未ログイン / user = ログイン中

function isIOSLike() {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua);
}

// -----------------------------
// 認証操作
// -----------------------------
export async function login() {
  const provider = new GoogleAuthProvider();

  // iPhone系はredirect（popupが死にやすい）
  if (isIOSLike()) {
    await signInWithRedirect(auth, provider);
    return;
  }

  // それ以外はpopup（失敗したらredirectに逃がす）
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    const code = err?.code || "";
    if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, provider);
      return;
    }
    console.error("Login failed:", err);
    throw err;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout failed:", err);
    throw err;
  }
}

// -----------------------------
// 認証初期化
// -----------------------------
export function initAuth({ onLogin, onLogout, onReady } = {}) {
  let initialized = false;

  // redirect戻りを回収（失敗しても致命ではない）
  // ※ここをawaitしない：onAuthStateChangedが最終状態を通知するため
  getRedirectResult(auth).catch((err) => {
    console.warn("getRedirectResult failed:", err);
  });

  onAuthStateChanged(auth, (user) => {
    const prev = currentUser;          // undefined / null / user
    currentUser = user ?? null;

    // 初回だけ特別扱い：未ログインは「ログアウト扱い」にしない
    if (!initialized) {
      initialized = true;
      if (user) onLogin?.(user);
      onReady?.(currentUser);
      return;
    }

    // 2回目以降の遷移
    if (user) {
      onLogin?.(user);
    } else {
      // 直前がログイン中だった時だけ logout 扱い
      if (prev) onLogout?.();
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
