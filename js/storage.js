// js/storage.js
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getCurrentUser } from "./auth.js";
import { setEditorContent, setDummySource } from "./editor.js";
import { applyAllSettings } from "./settings.js";

const db = getFirestore();

export async function saveToStorage(data) {
  const user = getCurrentUser();

  if (user) {
    await setDoc(doc(db, "memos", user.uid), data);
  } else {
    localStorage.setItem("secureMemo", JSON.stringify(data));
  }
}

export async function loadFromStorage(uid) {
  if (uid) {
    const snap = await getDoc(doc(db, "memos", uid));
    if (snap.exists()) applyLoadedData(snap.data());
  } else {
    const raw = localStorage.getItem("secureMemo");
    if (raw) applyLoadedData(JSON.parse(raw));
  }
}

function applyLoadedData(data) {
  if (data.real) setEditorContent(data.real);
  if (data.dummy) setDummySource(data.dummy);
  if (data.settings) applyAllSettings(data.settings);
}
