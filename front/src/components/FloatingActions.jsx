import { useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import FormMessage from './FormMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SUPPORT_WHATSAPP = '5500000000000';
const PIX_KEY = 'suporte@avalia.serv';
const AMOUNTS = [
  { value: 5, label: '☕ Um café' },
  { value: 10, label: '🍕 Uma fatia' },
  { value: 25, label: '🚀 Um empurrão' },
  { value: 50, label: '⭐ Padrinho' },
];

export default function FloatingActions() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  return (
    <>
      <div className="fab-container" ref={containerRef}>
        {open && (
          <div className="fab-menu">
            <button className="fab-item" onClick={() => { setPanel('support'); setOpen(false); }}>
              <span className="fab-icon">💬</span>
              <span className="fab-label">Suporte</span>
            </button>
            <button className="fab-item" onClick={() => { setPanel('donate'); setOpen(false); }}>
              <span className="fab-icon">❤️</span>
              <span className="fab-label">Apoiar</span>
            </button>
          </div>
        )}
        <button className={`fab-main${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Ajuda">
          {open ? '✕' : '❓'}
        </button>
      </div>

      {panel === 'support' && <SupportPanel user={user} onClose={() => setPanel(null)} />}
      {panel === 'donate' && <DonationPanel onClose={() => setPanel(null)} />}
    </>
  );
}

function SupportPanel({ user, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: 'Dúvida geral',
    message: '',
  });
  const [error, setError] = useState(null);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const send = () => {
    if (!form.name || !form.email || !form.message.trim()) {
      return setError('Preencha nome, e-mail e mensagem.');
    }
    const text = encodeURIComponent(
      `*Suporte Avalia.Serv*\nNome: ${form.name}\nE-mail: ${form.email}\nAssunto: ${form.subject}\n\n${form.message}`
    );
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`, '_blank');
    onClose();
  };

  return (
    <Modal title="💬 Falar com o suporte" onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Nome</label>
        <input className="form-input" value={form.name} onChange={change('name')} />
      </div>
      <div className="form-group mt">
        <label className="form-label">E-mail</label>
        <input className="form-input" value={form.email} onChange={change('email')} />
      </div>
      <div className="form-group mt">
        <label className="form-label">Assunto</label>
        <select className="form-input" value={form.subject} onChange={change('subject')}>
          {['Dúvida geral', 'Problema técnico', 'Conta e acesso', 'Reclamação', 'Sugestão'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="form-group mt">
        <label className="form-label">Mensagem</label>
        <textarea className="form-input" rows={4} value={form.message} onChange={change('message')} />
      </div>
      <button className="btn-primary w-full mt" onClick={send}>Enviar pelo WhatsApp</button>
      <FormMessage text={error} type="error" />
    </Modal>
  );
}

function DonationPanel({ onClose }) {
  const [amount, setAmount] = useState(5);
  const [copied, setCopied] = useState(false);

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal title="❤️ Apoiar o Avalia.Serv" onClose={onClose}>
      <p className="modal-intro">Qualquer valor ajuda a manter os servidores no ar.</p>

      <div className="donation-grid">
        {AMOUNTS.map((a) => (
          <button
            key={a.value}
            className={`donation-option${amount === a.value ? ' selected' : ''}`}
            onClick={() => setAmount(a.value)}
          >
            <span className="donation-amount">R$ {a.value}</span>
            <span className="donation-desc">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="form-group mt">
        <label className="form-label">Outro valor (R$)</label>
        <input
          type="number"
          min="1"
          className="form-input"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <div className="donation-total">
        Valor escolhido: R$ {Number(amount || 0).toFixed(2).replace('.', ',')}
      </div>

      <button className="btn-primary w-full donate" onClick={copyKey}>
        {copied ? 'Chave PIX copiada' : `Copiar chave PIX (${PIX_KEY})`}
      </button>
    </Modal>
  );
}
