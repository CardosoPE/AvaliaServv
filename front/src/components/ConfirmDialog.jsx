import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, description, confirmLabel, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="confirm-body">
        <div className="confirm-icon">⚠️</div>
        <p className="confirm-text">{description}</p>
      </div>
      <div className="confirm-actions">
        <button className="btn-secondary w-full" onClick={onClose}>Cancelar</button>
        <button className="btn-danger w-full" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
