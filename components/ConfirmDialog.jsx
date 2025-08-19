import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    setTimeout(() => cardRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="lt-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="lt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lt-modal-title"
        aria-describedby="lt-modal-message"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={cardRef}
      >
        <h3 id="lt-modal-title" className="lt-modal-title">{title}</h3>
        {message && (
          <p id="lt-modal-message" className="lt-modal-message">{message}</p>
        )}

        <div className="lt-modal-actions">
          <button className="lt-btn lt-btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="lt-btn lt-btn-primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
