import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { formatTime } from '../api/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const POLL_MS = 4000;

export default function ChatModal({ peer, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Busca inicial + polling enquanto a janela estiver aberta.
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await api.chat.history(peer.email);
        if (active) setMessages(data);
      } catch (err) {
        if (active) showToast(err.message, 'error');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [peer.email, showToast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    try {
      const sent = await api.chat.send({
        recipientEmail: peer.email,
        text: value,
        requestId: peer.requestId ?? null,
      });
      setMessages((list) => [...list, sent]);
    } catch (err) {
      setText(value);
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box chat-box">
        <div className="chat-modal-header">
          <div>
            <div className="chat-title">💬 {peer.name}</div>
            {peer.requestId && <div className="chat-ref">Solicitação #{peer.requestId}</div>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {loading && <div className="chat-empty">Carregando conversa…</div>}
          {!loading && messages.length === 0 && (
            <div className="chat-empty">Envie a primeira mensagem para começar 👋</div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-bubble ${m.senderEmail === user.email ? 'sent' : 'received'}`}
            >
              <div className="bubble-text">{m.text}</div>
              <div className="bubble-time">{formatTime(m.createdAt)}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-bar">
          <input
            className="chat-input"
            value={text}
            placeholder="Escreva uma mensagem"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button className="chat-send-btn" onClick={send} aria-label="Enviar mensagem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
