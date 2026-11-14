import { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import ClientRequestModal from '../components/ClientRequestModal.jsx';
import ChatModal from '../components/ChatModal.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import FloatingActions from '../components/FloatingActions.jsx';
import Avatar from '../components/Avatar.jsx';
import { api } from '../api/client.js';
import { estimateDistance, formatDate, formatMoney, formatTime } from '../api/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const NAV = [
  { key: 'requests', icon: '📋', label: 'Solicitações de clientes' },
  { key: 'chats', icon: '💬', label: 'Minhas conversas' },
];

const CATEGORIES = ['Manutenção', 'Construção', 'Tecnologia', 'Saúde', 'Beleza', 'Educação'];

export default function ProfessionalDashboard() {
  const { user, deleteAccount } = useAuth();
  const { showToast } = useToast();

  const [section, setSection] = useState('requests');
  const [category, setCategory] = useState('');
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [profile, setProfile] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatPeer, setChatPeer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (user.profileId) api.professionals.byId(user.profileId).then(setProfile).catch(() => {});
  }, [user.profileId]);

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await api.requests.open(category));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [category, showToast]);

  useEffect(() => {
    if (section === 'requests') loadRequests();
    if (section === 'chats') {
      api.chat.conversations().then(setConversations).catch((err) => showToast(err.message, 'error'));
    }
  }, [section, loadRequests, showToast]);

  const openChat = (request) => {
    setSelectedRequest(null);
    setChatPeer({ email: request.clientEmail, name: request.clientName, requestId: request.id });
  };

  return (
    <div className="app-layout">
      <Sidebar
        items={NAV}
        active={section}
        onSelect={setSection}
        onEditProfile={() => setShowProfile(true)}
        onDeleteAccount={() => setShowDelete(true)}
      />

      <main className="main-area">
        <header className="app-header professional">
          <div className="header-logo">🔧 Painel do profissional</div>
          <p className="header-sub">Clientes que estão procurando serviços como o seu</p>
        </header>

        {section === 'requests' && (
          <section>
            <div className="section-heading">
              <h2>📋 Solicitações abertas</h2>
              <span className="badge-count">{requests.length}</span>
            </div>

            <div className="filters-inline">
              <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todas as categorias</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="list-area">
              {requests.length === 0 && (
                <p className="empty-state">
                  Nenhuma solicitação aberta nesta categoria agora. Volte mais tarde ou amplie o filtro.
                </p>
              )}
              {requests.map((r) => {
                const distance = estimateDistance(profile?.location, r.clientCity);
                return (
                  <article className="request-card clickable" key={r.id} onClick={() => setSelectedRequest(r)}>
                    <div className="request-header">
                      <div className="request-client">
                        <Avatar name={r.clientName} photo={r.clientPhoto} className="client-avatar-sm" />
                        <div>
                          <div className="request-title">{r.title}</div>
                          <div className="request-subtitle">
                            {[r.clientName, r.clientCity].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                      </div>
                      <span className="request-status status-open">🟢 Aberta</span>
                    </div>

                    <p className="request-desc">{r.description}</p>

                    <div className="request-meta">
                      {r.category && <span>📂 {r.category}</span>}
                      {r.budget && <span>💰 {formatMoney(r.budget)}</span>}
                      {distance && <span>📏 {distance}</span>}
                      <span>🕐 {formatDate(r.createdAt)}</span>
                    </div>

                    <button
                      className="btn-primary small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(r);
                      }}
                    >
                      Ver detalhes e responder
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {section === 'chats' && (
          <section>
            <div className="section-heading">
              <h2>💬 Minhas conversas</h2>
            </div>
            <div className="list-area">
              {conversations.length === 0 && (
                <p className="empty-state">
                  Nenhuma conversa ainda. Responda a uma solicitação aberta para começar.
                </p>
              )}
              {conversations.map((c) => (
                <button
                  className="chat-list-item"
                  key={c.roomId}
                  onClick={() => setChatPeer({ email: c.otherEmail, name: c.otherName })}
                >
                  <Avatar name={c.otherName} photo={c.otherPhoto} className="cli-avatar" />
                  <div className="cli-info">
                    <div className="cli-name">{c.otherName}</div>
                    <div className="cli-last">{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && <span className="unread-badge">{c.unread}</span>}
                  <span className="cli-time">{formatTime(c.lastMessageAt)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <FloatingActions />

      {selectedRequest && (
        <ClientRequestModal
          request={selectedRequest}
          viewerLocation={profile?.location}
          onChat={openChat}
          onClose={() => setSelectedRequest(null)}
        />
      )}
      {chatPeer && <ChatModal peer={chatPeer} onClose={() => setChatPeer(null)} />}
      {showProfile && <ProfileModal profile={profile} onClose={() => setShowProfile(false)} />}
      {showDelete && (
        <ConfirmDialog
          title="🗑️ Excluir conta"
          description="Esta ação é permanente. Seu perfil profissional e suas conversas serão removidos."
          confirmLabel="Excluir conta"
          onConfirm={deleteAccount}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
