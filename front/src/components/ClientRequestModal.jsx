import Avatar from './Avatar.jsx';
import { estimateDistance, formatDate, formatMoney } from '../api/format.js';

export default function ClientRequestModal({ request, onClose, onChat, viewerLocation }) {
  const distance = estimateDistance(viewerLocation, request.clientCity);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-wide">
        <div className="modal-header-row">
          <h2>👤 Perfil do cliente</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="prof-modal-header client">
          <Avatar name={request.clientName} photo={request.clientPhoto} className="prof-modal-avatar" />
          <div className="prof-modal-info">
            <h3>{request.clientName}</h3>
            <div className="specialty">{request.clientCity || 'Localização não informada'}</div>
            {distance && <div className="distance-line">📏 {distance} de você</div>}
          </div>
        </div>

        <div className="prof-modal-content">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-label">📍 Cidade</div>
              <div className="info-card-value">{request.clientCity || '—'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">📏 Distância</div>
              <div className="info-card-value">{distance || '—'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">📂 Categoria</div>
              <div className="info-card-value">{request.category || 'Geral'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">💰 Orçamento</div>
              <div className="info-card-value">{formatMoney(request.budget) || 'A combinar'}</div>
            </div>
          </div>

          <section>
            <div className="prof-section-title">🔧 O que o cliente precisa</div>
            <div className="request-detail">
              <div className="request-detail-title">{request.title}</div>
              <p className="request-detail-text">{request.description}</p>
            </div>
          </section>

          <div className="muted-line">🕐 Publicado em {formatDate(request.createdAt)}</div>
        </div>

        <div className="prof-modal-actions">
          <button className="btn-chat-lg" onClick={() => onChat(request)}>
            💬 Conversar com o cliente
          </button>
          <button className="btn-outline" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
