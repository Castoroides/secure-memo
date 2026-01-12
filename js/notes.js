// notes.js
// =======================================
// Notes Screen (list / create / delete)
// =======================================

import { listMemos, createMemo, loadMemo, deleteMemo } from "./storage.js";
import { getCurrentUser } from "./auth.js";
import { applyIcons } from "./theme.js";
import { showToast } from "./toast.js";

export function initNotesScreen({ onSelectMemo } = {}) {
  const notesBtn = document.getElementById("notesBtn");
  const homeBtn  = document.getElementById("homeBtn");

  const screen = document.getElementById("notesScreen");
  const backBtn = document.getElementById("notesBackBtn");
  const newBtn = document.getElementById("newMemoBtn");
  const listEl = document.getElementById("notesList");

  if (!notesBtn || !screen || !listEl) return;

  function openScreen() {
    if (document.body.classList.contains("show-notes")) return;
    document.body.classList.add("show-notes");
    screen.classList.remove("hidden");
    screen.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    history.pushState({ screen: "notes" }, "");
  }

  function closeScreen() {
    document.body.classList.remove("show-notes");
    screen.classList.add("hidden");
    screen.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // ブラウザ戻るでも閉じる
  window.addEventListener("popstate", (e) => {
    if (!e.state || e.state.screen !== "notes") closeScreen();
  });

  function getTitleFromReal(realText) {
    const firstLine = String(realText ?? "").split("\n")[0] ?? "";
    const t = firstLine.trim();
    return t || "無題";
  }

  async function refreshList() {
    const user = getCurrentUser();
    if (!user) return;

    const memos = await listMemos(user.uid);
    listEl.innerHTML = "";

    if (!memos.length) {
      listEl.innerHTML = `<div style="opacity:.7;font-size:14px;">メモがありません（＋で作成）</div>`;
      return;
    }

    // ✅ main.js で保存している updatedAt に合わせて降順
    memos.sort((a, b) => (b.updatedAt || b.updated || 0) - (a.updatedAt || a.updated || 0));

    for (const m of memos) {
      const item = document.createElement("div");
      item.className = "note-item";

      // ✅ title が無い/空なら real の1行目を使う（超重要）
      const rawTitle =
        (m.title && String(m.title).trim())
          ? m.title
          : getTitleFromReal(m.real);

      const title = escapeHtml(String(rawTitle).slice(0, 40));

      // ✅ updatedAt を優先。古いデータなら updated も見る
      const ts = m.updatedAt || m.updated || m.createdAt || m.created || null;
      const updated = ts ? new Date(ts).toLocaleString() : "";

      // ✅ 削除ボタン付き（クリックを分離）
      item.innerHTML = `
        <button class="note-open" type="button" data-id="${escapeHtml(m.id)}">
          <div class="title">${title}</div>
          <div class="meta">${escapeHtml(updated)}</div>
        </button>

        <button class="note-del" type="button"
          data-id="${escapeHtml(m.id)}"
          data-icon="trash"
          aria-label="削除">
        </button>
      `;

      // note-item を相対配置に（delボタンの絶対配置用）
      item.style.position = "relative";
      item.style.paddingRight = "40px";

      // 開く
      item.querySelector(".note-open").addEventListener("click", async () => {
        const user = getCurrentUser();
        if (!user) return;

        const data = await loadMemo(user.uid, m.id);
        onSelectMemo?.(m.id, data);
        closeScreen();
        if (history.state?.screen === "notes") history.back();
      });

      // 削除
      item.querySelector(".note-del").addEventListener("click", async (e) => {
        e.stopPropagation(); // 親クリックで開くのを防ぐ

        const user = getCurrentUser();
        if (!user) return;

        const ok = window.confirm("このメモを削除します。\n削除すると復元できません。よろしいですか？");
        if (!ok) return;

        try {
          await deleteMemo(user.uid, m.id);
          showToast("削除しました");
          await refreshList();
        } catch (err) {
          console.error(err);
          showToast("削除に失敗しました");
        }
      });

      listEl.appendChild(item);
    }
    applyIcons(listEl); // ✅ 追加した行の trash アイコンも差し込む
  }

  async function openNotes() {
    const user = getCurrentUser();
    if (!user) {
      showToast("ログインが必要です");
      return;
    }
    await refreshList();
    openScreen();
  }

  notesBtn.addEventListener("click", openNotes);
  homeBtn?.addEventListener("click", openNotes);

  backBtn?.addEventListener("click", () => {
    closeScreen();
    if (history.state?.screen === "notes") history.back();
  });

  newBtn?.addEventListener("click", async () => {
    const user = getCurrentUser();
    if (!user) return;

    const id = await createMemo(user.uid);
    const data = await loadMemo(user.uid, id);

    // isNew を渡す（editor側で yyyy/mm/dd 新しいメモ を入れる）
    onSelectMemo?.(id, data, { isNew: true });
    showToast("新規メモを作成しました");

    closeScreen();
    if (history.state?.screen === "notes") history.back();
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
