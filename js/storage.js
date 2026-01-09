// js/storage.js
// =======================================
// Firestore Storage
// =======================================

import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * メモ保存
 * @param {string} uid
 * @param {{
 *   real: string,
 *   dummy: string,
 *   settings?: object
 * }} data
 */
export async function saveMemo(uid, data) {
  if (!uid) return;

  const ref = doc(db, "memos", uid);

  await setDoc(ref, {
    ...data,
    updated: Date.now()
  }, { merge: true });
}

/**
 * メモ読込
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function loadMemo(uid) {
  if (!uid) return null;

  const ref = doc(db, "memos", uid);
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : null;
}
