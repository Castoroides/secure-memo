// js/firebase.js
// =======================================
// Firebase 初期化
// =======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// 🔑 Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyBPeOPcaf1WOsnbKA1I5FlrjAXm6tTkGy0",
  authDomain: "memo-bycastoroides.firebaseapp.com",
  projectId: "memo-bycastoroides",
  storageBucket: "memo-bycastoroides.firebasestorage.app",
  messagingSenderId: "833306576570",
  appId: "1:833306576570:web:18122e2541d061e2912483",
  measurementId: "G-3KE0Z8M5DD"
};

// ---------------------------------------
// Firebase App 初期化
// ---------------------------------------
export const app = initializeApp(firebaseConfig);

// ---------------------------------------
// サービス取得
// ---------------------------------------
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics は GitHub Pages 等で
// サポートされていない場合があるためガード
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
}).catch(() => {
  // 何もしない（安全）
});
