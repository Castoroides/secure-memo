// js/share.js
// =======================================
// Share Popover Menu
// =======================================

import { getEditorState } from "./editor.js";
import { showToast } from "./toast.js";

export function initShare() {
  const shareBtn = document.getElementById("shareBtn");
  const menu = document.getElementById("shareMenu");

  if (!shareBtn || !menu) return;

  // -----------------------------
  // 開閉制御
  // -----------------------------

  const openMenu = () => {
    menu.classList.remove("hidden");
    document.body.classList.add("share-open");
  };

  const closeMenu = () => {
    menu.classList.add("hidden");
    document.body.classList.remove("share-open");
  };

  // シェアボタン押下
  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu.classList.contains("hidden")) openMenu();
    else closeMenu();
  });

  // メニュー外クリックで閉じる
  document.addEventListener("click", () => {
    closeMenu();
  });

  // -----------------------------
  // メニュー内アクション
  // -----------------------------
  menu.addEventListener("click", async (e) => {
    e.stopPropagation();

    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const { real } = getEditorState();

    try {
      switch (action) {
        // テキストコピー
        case "copyText": {
          if (!real) {
            showToast("コピーするテキストがありません");
            break;
          }
          await navigator.clipboard.writeText(real);
          showToast(`テキスト（${real.length}文字）をコピーしました`);
          break;
        }

        // アプリURLコピー
        case "copyLink": {
          await navigator.clipboard.writeText(location.href);
          showToast("リンクをコピーしました");
          break;
        }

        // Xへ投稿
        case "shareX": {
          const text = encodeURIComponent(real.slice(0, 280));
          const url = encodeURIComponent(location.href);

          window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            "_blank",
            "noopener"
          );
          break;
        }
      }
    } catch (err) {
      console.error(err);
      showToast("操作に失敗しました");
    }

    closeMenu();
  });
}
