import { Fragment } from 'react';
import { createPortal } from 'react-dom';

function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-800 px-3 py-2 text-slate-300 hover:bg-slate-700">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
