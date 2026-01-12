// js/storage.js
// =======================================
// Firestore Storage (no legacy migration)
// =======================================

import { db } from "./firebase.js";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function memosCol(uid) {
  return collection(db, "users", uid, "memos");
}

function memoRef(uid, memoId) {
  return doc(db, "users", uid, "memos", memoId);
}

// ✅ 互換性チェック：最低限 real/dummy/settings の形を見る
function isCompatibleMemoData(data) {
  if (!data || typeof data !== "object") return false;

  // real は文字列が期待値（無いなら空扱いにできるのでOK）
  if ("real" in data && typeof data.real !== "string") return false;

  // dummy は文字列が期待値（無いなら空扱いにできるのでOK）
  if ("dummy" in data && typeof data.dummy !== "string") return false;
  if ("dummyTitle" in data && data.dummyTitle != null && typeof data.dummyTitle !== "string") return false;

  // settings は object（無いならOK）
  if ("settings" in data && data.settings != null && typeof data.settings !== "object") return false;

  // createdAt/updatedAt は number（無いならOK）
  if ("createdAt" in data && data.createdAt != null && typeof data.createdAt !== "number") return false;
  if ("updatedAt" in data && data.updatedAt != null && typeof data.updatedAt !== "number") return false;

  // title は string（無いならOK）
  if ("title" in data && data.title != null && typeof data.title !== "string") return false;

  return true;
}

/**
 * メモ一覧（updatedAt 降順）
 */
export async function listMemos(uid, max = 50) {
  if (!uid) return [];
  const q = query(memosCol(uid), orderBy("updatedAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * メモ新規作成（空のメモを作って id を返す）
 */
export async function createMemo(uid) {
  if (!uid) return null;

  const now = Date.now();
  const ref = await addDoc(memosCol(uid), {
    title: "",
    real: "",
    dummyTitle: "",
    dummy: "",
    createdAt: now,
    updatedAt: now
  });
  return ref.id;
}

/**
 * メモ保存 saveMemo(uid, memoId, data)
 */
export async function saveMemo(uid, memoIdOrData, maybeData) {
  if (!uid) return;

  const memoId = typeof memoIdOrData === "string" ? memoIdOrData : "default";
  const data = typeof memoIdOrData === "string" ? (maybeData || {}) : (memoIdOrData || {});

  const now = Date.now();

  // createdAt が無い既存メモにも優しい
  const payload = {
    ...data,
    updatedAt: now
  };
  if (!("createdAt" in payload)) payload.createdAt = now;

  await setDoc(memoRef(uid, memoId), payload, { merge: true });
}

/**
 * メモ削除
 */
export async function deleteMemo(uid, memoId) {
  if (!uid || !memoId) return;
  await deleteDoc(memoRef(uid, memoId));
}

/**
 * メモ読込
 * - 互換性がない形なら { __incompatible: true } を返す
 * - 見つからなければ null
 */
export async function loadMemo(uid, memoId = "default") {
  if (!uid) return null;

  const snap = await getDoc(memoRef(uid, memoId));
  if (!snap.exists()) return null;

  const data = snap.data();

  if (!isCompatibleMemoData(data)) {
    return { __incompatible: true };
  }

  // 欠けているフィールドは安全なデフォルトに寄せて返す
  return {
    title: data.title || "",
    real: data.real || "",
    dummy: data.dummy || "",
    dummyTitle: data.dummyTitle || "",
    settings: data.settings || {},
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}
