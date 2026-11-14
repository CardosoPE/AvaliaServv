import { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import ProfessionalModal from '../components/ProfessionalModal.jsx';
import ChatModal from '../components/ChatModal.jsx';
import NewRequestModal from '../components/NewRequestModal.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import FloatingActions from '../components/FloatingActions.jsx';
import { api } from '../api/client.js';
import { formatDate, formatMoney } from '../api/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const NAV = [
  { key: 'explore', icon: '🔍', label: 'Explorar' },
  { key: 'favorites', icon: '❤️', label: 'Favoritos' },
  { key: 'requests', icon: '📋', label: 'Minhas solicitações' },
];

const CATEGORIES = ['Manutenção', 'Construção', 'Limpeza', 'Tecnologia', 'Saúde', 'Educação', 'Beleza', 'Jardinagem'];
const CITIES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Recife', 'Salvador', 'Fortaleza', 'Curitiba'];
const AVAILABILITY = ['Tempo Integral', 'Fins de Semana', '24/7'];

export default function ClientDashboard() {
  const { user, deleteAccount } = useAuth();
  const { showToast } = useToast();

  const [section, setSection] = useState('explore');
  const [filters, setFilters] = useState({ q: '', category: '', city: '', availability: '' });
  const [professionals, setProfessionals] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [chatPeer, setChatPeer] = useState(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const loadProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      setProfessionals(await api.professionals.list(filters));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  // Busca com pequeno atraso para não disparar a cada tecla.
  useEffect(() => {
    const timer = setTimeout(loadProfessionals, 350);
    return () => clearTimeout(timer);
  }, [loadProfessionals]);

  useEffect(() => {
    api.favorites.ids().then(setFavoriteIds).catch(() => {});
  }, []);

  useEffect(() => {
    if (section === 'requests') {
      api.requests.mine().then(setRequests).catch((err) => showToast(err.message, 'error'));
    }
    if (section === 'favorites') {
      api.favorites.list().then(setFavorites).catch((err) => showToast(err.message, 'error'));
    }
  }, [section, showToast]);

  const toggleFavorite = async (professional) => {
    try {
      const { favorited } = await api.favorites.toggle(professional.id);
      setFavoriteIds((ids) =>
        favorited ? [...ids, professional.id] : ids.filter((id) => id !== professional.id)
      );
      setFavorites((list) =>
        favorited ? [...list, professional] : list.filter((p) => p.id !== professional.id)
      );
      showToast(favorited ? 'Salvo nos favoritos.' : 'Removido dos favoritos.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const startChat = (professional) => {
    if (!professional.userEmail) {
      return showToast('Este é um perfil de demonstração e não recebe mensagens.', 'error');
    }
    setSelected(null);
    setChatPeer({ email: professional.userEmail, name: professional.name });
  };

  const removeRequest = async (id) => {
    try {
      await api.requests.remove(id);
      setRequests((list) => list.filter((r) => r.id !== id));
      showToast('Solicitação removida.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const visible = section === 'favorites' ? favorites : professionals;

  return (
    <div className="app-layout">
      <Sidebar
        items={[...NAV, { key: 'new-request', icon: '➕', label: 'Nova solicitação' }]}
        active={section}
        onSelect={(key) => (key === 'new-request' ? setShowNewRequest(true) : setSection(key))}
        onEditProfile={() => setShowProfile(true)}
        onDeleteAccount={() => setShowDelete(true)}
      />

      <main className="main-area">
        <header className="app-header">
          <div className="header-logo">⚡ Avalia.Serv</div>
          <p className="header-sub">Encontre profissionais de confiança perto de você</p>
        </header>

        {section !== 'requests' && (
          <section className="filters-section">
            <div className="search-bar">
              <span className="search-icon-inside">🔍</span>
              <input
                className="search-input"
                placeholder="Buscar por nome, especialidade ou serviço"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <div className="filters-row">
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">Todas as categorias</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                className="filter-select"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              >
                <option value="">Todas as cidades</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                className="filter-select"
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              >
                <option value="">Qualquer disponibilidade</option>
                {AVAILABILITY.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </section>
        )}

        {section !== 'requests' && (
          <section>
            <div className="section-heading">
              <h2>{section === 'favorites' ? '❤️ Favoritos' : 'Profissionais disponíveis'}</h2>
              <span className="badge-count">{visible.length}</span>
            </div>

            <div className="professionals-grid">
              {loading && section === 'explore' && (
                <p className="empty-state">Carregando profissionais…</p>
              )}
              {(!loading || section === 'favorites') && visible.length === 0 && (
                <p className="empty-state">
                  {section === 'favorites'
                    ? 'Nenhum favorito ainda. Toque no coração de um perfil para salvá-lo aqui.'
                    : 'Nenhum profissional corresponde a esses filtros. Tente ampliar a busca.'}
                </p>
              )}
              {visible.map((p) => (
                  <ProfessionalCard
                    key={p.id}
                    professional={p}
                    favorite={favoriteIds.includes(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onOpen={setSelected}
                    onChat={startChat}
                    viewerCity={user.city}
                  />
              ))}
            </div>
          </section>
        )}

        {section === 'requests' && (
          <section>
            <div className="section-heading">
              <h2>📋 Minhas solicitações</h2>
              <button className="btn-primary small" onClick={() => setShowNewRequest(true)}>
                + Nova
              </button>
            </div>
            <div className="list-area">
              {requests.length === 0 && (
                <p className="empty-state">
                  Você ainda não publicou solicitações. Descreva o que precisa e os profissionais virão até você.
                </p>
              )}
              {requests.map((r) => (
                <div className="request-card" key={r.id}>
                  <div className="request-header">
                    <span className="request-title">{r.title}</span>
                    <span className={`request-status status-${r.status}`}>
                      {r.status === 'open' ? '🟢 Aberta' : '✅ Resolvida'}
                    </span>
                  </div>
                  <p className="request-desc">{r.description}</p>
                  <div className="request-meta">
                    {r.category && <span>📂 {r.category}</span>}
                    {r.budget && <span>💰 {formatMoney(r.budget)}</span>}
                    <span>🕐 {formatDate(r.createdAt)}</span>
                  </div>
                  <button className="btn-ghost danger small" onClick={() => removeRequest(r.id)}>
                    🗑️ Remover
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <FloatingActions />

      {selected && (
        <ProfessionalModal
          professional={selected}
          viewerCity={user.city}
          canReview={Boolean(selected.userEmail)}
          onChat={startChat}
          onClose={() => setSelected(null)}
        />
      )}
      {chatPeer && <ChatModal peer={chatPeer} onClose={() => setChatPeer(null)} />}
      {showNewRequest && (
        <NewRequestModal
          onClose={() => setShowNewRequest(false)}
          onCreated={(created) => {
            setRequests((list) => [created, ...list]);
            setShowNewRequest(false);
            setSection('requests');
            showToast('Solicitação publicada.');
          }}
        />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showDelete && (
        <ConfirmDialog
          title="🗑️ Excluir conta"
          description="Esta ação é permanente. Seus dados, solicitações e conversas serão removidos."
          confirmLabel="Excluir conta"
          onConfirm={deleteAccount}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
