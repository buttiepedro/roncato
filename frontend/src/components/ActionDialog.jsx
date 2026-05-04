import React from 'react';

export default function ActionDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
  hideCancel = false,
  confirmVariant = 'primary',
}) {
  if (!open) return null;

  const confirmClass = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600'
    : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600';

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="action-dialog-title" className="text-lg font-semibold text-slate-800">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          {!hideCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
