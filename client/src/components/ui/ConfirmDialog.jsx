import { useEffect } from 'react';
import { LogOut } from 'lucide-react';

const ConfirmDialog = ({
  open,
  title = 'Do you want to log out?',
  message = 'You will need to log in again to see your profile and orders.',
  confirmLabel = 'Log out',
  cancelLabel = 'Stay logged in',
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/50 px-4 backdrop-blur-sm"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-message"
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <LogOut className="h-5 w-5" />
          </span>
          <h2 id="logout-confirm-title" className="text-lg font-bold text-charcoal">
            {title}
          </h2>
        </div>
        <p id="logout-confirm-message" className="mt-3 text-sm leading-relaxed text-muted">
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-beige px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
