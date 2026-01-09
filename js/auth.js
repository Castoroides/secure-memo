// js/auth.js
// =======================================
// Firebase Authentication
// =======================================

import { auth } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
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
  const loginBtn = document.getElementById("loginBtn");
  const userLabel = document.getElementById("userLabel");

  // ログインボタン
  loginBtn?.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  });

  // ログイン状態監視
  onAuthStateChanged(auth, (user) => {
    currentUser = user || null;

    if (user) {
      userLabel.textContent = user.email;
      loginBtn.style.display = "none";
      onLogin?.(user);
    } else {
      userLabel.textContent =
        "ログインすることで、入力したデータを保持させることができます。（現在 未ログイン）";
      loginBtn.style.display = "";
      onLogout?.();
    }
  });
}

/**
 * 現在のユーザー取得
 */
export function getCurrentUser() {
  return currentUser;
}
