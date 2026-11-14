import { useState } from 'react';
import Avatar from './Avatar.jsx';
import { api } from '../api/client.js';
import { estimateDistance, formatMoney, stars } from '../api/format.js';
import { whatsappUrl } from '../api/phone.js';
import { useToast } from '../context/ToastContext.jsx';

const InfoCard = ({ label, value }) =>
  value ? (
    <div className="info-card">
      <div className="info-card-label">{label}</div>
      <div className="info-card-value">{value}</div>
    </div>
  ) : null;

export default function ProfessionalModal({ professional, onClose, onChat, canReview, viewerCity }) {
  const [p, setP] = useState(professional);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const distance = estimateDistance(viewerCity, p.location);
  const waUrl = whatsappUrl(p.whatsapp, p.name);

  const submitReview = async () => {
    if (!text.trim()) return showToast('Escreva um comentário para avaliar.', 'error');
    setSending(true);
    try {
      const updated = await api.professionals.review(p.id, { text: text.trim(), rating });
      setP(updated);
      setText('');
      showToast('Avaliação publicada.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-wide">
        <div className="modal-header-row">
          <h2>{p.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="prof-modal-header">
          <Avatar name={p.name} photo={p.photo} className="prof-modal-avatar" />
          <div className="prof-modal-info">
            <h3>{p.name}</h3>
            <div className="specialty">
              {[p.specialty || p.jobTitle, p.category].filter(Boolean).join(' · ')}
            </div>
            {p.reviews?.length > 0 && (
              <div className="rating">
                <span className="stars">{stars(p.averageRating)}</span>
                <span className="rating-text">
                  {p.averageRating} ({p.reviews.length} avaliações)
                </span>
              </div>
            )}
            <span className="presence">
              <span className={`presence-dot ${p.status === 'online' ? 'online' : 'offline'}`} />
              {p.status === 'online' ? 'Online agora' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="prof-modal-content">
          <div className="info-grid">
            <InfoCard label="📍 Localização" value={p.location} />
            <InfoCard label="📏 Distância" value={distance} />
            <InfoCard label="⏱️ Experiência" value={p.experience} />
            <InfoCard label="💰 Valor por hora" value={formatMoney(p.hourlyRate)} />
            <InfoCard label="📦 Valor mínimo" value={formatMoney(p.minValue)} />
            <InfoCard label="📅 Disponibilidade" value={p.availability} />
            <InfoCard label="📡 Raio de atuação" value={p.serviceRadius} />
            <InfoCard label="🛡️ Seguro civil" value={p.insurance} />
          </div>

          {p.description && (
            <section>
              <div className="prof-section-title">Sobre</div>
              <p className="prof-text">{p.description}</p>
            </section>
          )}

          {p.register && (
            <section>
              <div className="prof-section-title">Registro</div>
              <p className="prof-text">🏅 {p.register}</p>
            </section>
          )}

          {p.formations?.length > 0 && (
            <section>
              <div className="prof-section-title">Formações</div>
              <ul className="check-list">
                {p.formations.map((f) => (
                  <li key={f}>✅ {f}</li>
                ))}
              </ul>
            </section>
          )}

          {p.paymentMethods?.length > 0 && (
            <section>
              <div className="prof-section-title">Formas de pagamento</div>
              <div className="tags-list">
                {p.paymentMethods.map((m) => (
                  <span className="tag" key={m}>
                    {m}
                  </span>
                ))}
              </div>
            </section>
          )}

          {p.languages?.length > 0 && (
            <section>
              <div className="prof-section-title">Idiomas</div>
              <div className="tags-list">
                {p.languages.map((l) => (
                  <span className="tag" key={l}>
                    {l}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="prof-section-title">Avaliações</div>
            {p.reviews?.length ? (
              p.reviews.map((r) => (
                <div className="review-card" key={r.id}>
                  <div className="review-header">
                    <span className="review-user">👤 {r.author}</span>
                    <span className="review-date">{r.date}</span>
                  </div>
                  <div className="review-stars">
                    {stars(r.rating)} {r.rating}/5
                  </div>
                  <p className="review-text">{r.text}</p>
                </div>
              ))
            ) : (
              <p className="prof-text">Ainda sem avaliações. Seja o primeiro a avaliar.</p>
            )}

            {canReview && (
              <div className="review-form">
                <label className="form-label" htmlFor="review-rating">
                  Sua nota
                </label>
                <select
                  id="review-rating"
                  className="form-input"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {stars(n)} {n}/5
                    </option>
                  ))}
                </select>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Conte como foi o serviço"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="btn-secondary" onClick={submitReview} disabled={sending}>
                  {sending ? 'Publicando…' : 'Publicar avaliação'}
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="prof-modal-actions">
          <button className="btn-chat-lg" onClick={() => onChat(p)}>
            💬 Conversar no app
          </button>
          {waUrl && (
            <a className="btn-whatsapp" href={waUrl} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          )}
          <button className="btn-outline" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
