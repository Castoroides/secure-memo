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
    if (user) {
      userLabel.textContent = "ログイン中";
      accountEmail.textContent = user.email;
      loginBtn.style.display = "none";
    } else {
      userLabel.textContent = "ログインしていません";
      accountEmail.textContent = "ログインしていません";
      loginBtn.style.display = "flex";
    }
  });
}

/**
 * 現在のユーザー取得
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * ログアウト＆アカウント変更
 */
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

logoutBtn.onclick = async () => {
  await signOut(auth);
  location.reload(); // 状態リセット
};