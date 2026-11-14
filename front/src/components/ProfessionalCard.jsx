import Avatar from './Avatar.jsx';
import { estimateDistance, stars } from '../api/format.js';

export default function ProfessionalCard({ professional, favorite, onToggleFavorite, onOpen, onChat, viewerCity }) {
  const p = professional;
  const distance = estimateDistance(viewerCity, p.location);

  return (
    <article className="professional-card" onClick={() => onOpen(p)}>
      <div className="card-header">
        <span className={`status-dot ${p.status === 'online' ? 'online' : 'offline'}`} />
        <button
          className={`fav-btn${favorite ? ' active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(p);
          }}
          aria-label={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        >
          {favorite ? '❤️' : '🤍'}
        </button>
        <Avatar name={p.name} photo={p.photo} className="card-avatar" />
        <div className="card-name">{p.name}</div>
        <div className="card-specialty">{p.specialty || p.jobTitle}</div>
        {p.reviews?.length > 0 && (
          <div className="card-rating">
            <span className="stars">{stars(p.averageRating)}</span>
            <span className="rating-text">
              {p.averageRating} ({p.reviews.length})
            </span>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-tags">
          {p.category && <span className="tag">{p.category}</span>}
          {p.availability && <span className="tag green">{p.availability}</span>}
          {p.serviceType?.includes('Remoto') && <span className="tag green">🌐 Remoto</span>}
        </div>

        <div className="card-info-row">
          {p.location && <span className="card-info-item">📍 {p.location}</span>}
          {distance && <span className="card-info-item">📏 {distance}</span>}
          {p.hourlyRate > 0 && <span className="card-info-item">💰 R$ {p.hourlyRate}/h</span>}
        </div>

        <p className="card-desc">{p.description}</p>

        <div className="card-actions">
          <button
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(p);
            }}
          >
            Ver perfil
          </button>
          <button
            className="btn-chat"
            onClick={(e) => {
              e.stopPropagation();
              onChat(p);
            }}
          >
            💬 Conversar
          </button>
        </div>
      </div>
    </article>
  );
}
