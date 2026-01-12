// modal.js
// =======================================
// modal Common Processing
// =======================================
export function openModal(modalEl) {
  modalEl?.classList.remove("hidden");
}

export function closeModal(modalEl) {
  modalEl?.classList.add("hidden");
}

export function bindModal({
  openBtn,
  modal,
  closeBtn,
  closeOnBackdrop = false,
  guard = null,
}) {
  if (!openBtn || !modal) return;

  const doOpen = () => {
    if (guard && guard() === false) return;
    openModal(modal);
  };

  const doClose = () => closeModal(modal);

  openBtn.addEventListener("click", doOpen);
  closeBtn?.addEventListener("click", doClose);

  if (closeOnBackdrop) {
    modal.querySelector(".modal-backdrop")?.addEventListener("click", doClose);
  }

  return { open: doOpen, close: doClose };
}
