import { useEffect } from 'react';

export default function Modal({ title, onClose, children, wide = false, footer = null }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal-box${wide ? ' modal-box-wide' : ''}`} role="dialog" aria-modal="true">
        {title && (
          <div className="modal-header-row">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="Fechar">
              ✕
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer}
      </div>
    </div>
  );
}
