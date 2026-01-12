// edit_memo.js
// =======================================
// memo customize (draft -> save button apply)
// =======================================

import { getDummy, setDummy, getDummyTitle, setDummyTitle } from "./editor.js";
import { showToast } from "./toast.js";
import { closeModal } from "./modal.js";

let inited = false;

export function initEditMemo() {
  if (inited) return;
  inited = true;

  const editModal       = document.getElementById("editModal");
  const dummyTitleInput = document.getElementById("dummyTitleInput");
  const dummyBodyInput  = document.getElementById("dummyBodyInput");
  const saveBtn         = document.getElementById("saveEdit");
  const closeBtn        = document.getElementById("closeEdit");
  const backdrop        = editModal?.querySelector(".modal-backdrop");

  if (!editModal || !dummyTitleInput || !dummyBodyInput || !saveBtn || !closeBtn) return;

  let draftTitle = "";
  let draftBody  = "";
  let dirty = false;

  const setDirty = (v) => {
    dirty = v;
    saveBtn.disabled = !dirty;
    saveBtn.classList.toggle("is-active", dirty);
  };

  const syncFromState = () => {
    draftTitle = getDummyTitle() || "";
    draftBody  = getDummy() || "";
    dummyTitleInput.value = draftTitle;
    dummyBodyInput.value  = draftBody;
    setDirty(false);
  };

  const confirmCloseIfDirty = () => {
    if (!dirty) return true;
    return window.confirm("未保存の変更があります。閉じますか？");
  };

  const requestClose = () => {
    if (!confirmCloseIfDirty()) return;
    closeModal(editModal);
  };

  // モーダルが開いたらフォームへ同期
  const obs = new MutationObserver(() => {
    if (!editModal.classList.contains("hidden")) {
      syncFromState();
      dummyTitleInput.focus();
    }
  });
  obs.observe(editModal, { attributes: true, attributeFilter: ["class"] });

  // 入力は draft のみ更新
  dummyTitleInput.addEventListener("input", () => {
    draftTitle = dummyTitleInput.value;
    setDirty(true);
  });
  dummyBodyInput.addEventListener("input", () => {
    draftBody = dummyBodyInput.value;
    setDirty(true);
  });

  // 保存で反映
  saveBtn.addEventListener("click", () => {
    setDummyTitle(draftTitle);
    setDummy(draftBody);

    window.requestSave?.();
    showToast("保存しました");
    setDirty(false);

    closeModal(editModal);
  });

  closeBtn.addEventListener("click", (e) => {
    // 他の click リスナー（bindModal など）があっても後続を止める
    if (!confirmCloseIfDirty()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    closeModal(editModal);
  });

  // editモーダルは「背景クリックで閉じない」(誤タップ防止)
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      e.stopPropagation();
      // 何もしない（閉じない）
    });
  }

  // Esc で閉じたい場合：dirtyならconfirm
  document.addEventListener("keydown", (e) => {
    if (editModal.classList.contains("hidden")) return;
    if (e.key !== "Escape") return;
    e.preventDefault();
    requestClose();
  });

  setDirty(false);
}
