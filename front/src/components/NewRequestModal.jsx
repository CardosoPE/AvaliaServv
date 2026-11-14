import { useState } from 'react';
import Modal from './Modal.jsx';
import FormMessage from './FormMessage.jsx';
import { api } from '../api/client.js';

const CATEGORIES = ['Manutenção', 'Construção', 'Tecnologia', 'Saúde', 'Beleza', 'Educação'];

export default function NewRequestModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', budget: '' });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      return setMessage({ text: 'Informe o título e a descrição do serviço.', type: 'error' });
    }
    setSaving(true);
    try {
      const created = await api.requests.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || null,
        budget: form.budget ? Number(form.budget) : null,
      });
      onCreated(created);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="➕ Nova solicitação" onClose={onClose}>
      <p className="modal-intro">
        Descreva o que você precisa. Profissionais da categoria escolhida verão sua solicitação e
        poderão iniciar uma conversa.
      </p>

      <div className="form-group">
        <label className="form-label" htmlFor="req-title">Título</label>
        <input
          id="req-title"
          className="form-input"
          placeholder="Ex: Vazamento no banheiro"
          value={form.title}
          onChange={change('title')}
        />
      </div>

      <div className="form-group mt">
        <label className="form-label" htmlFor="req-desc">Descrição</label>
        <textarea
          id="req-desc"
          className="form-input"
          rows={4}
          placeholder="Onde está, quando começou, o que já foi tentado"
          value={form.description}
          onChange={change('description')}
        />
      </div>

      <div className="form-row mt">
        <div className="form-group">
          <label className="form-label" htmlFor="req-cat">Categoria</label>
          <select id="req-cat" className="form-input" value={form.category} onChange={change('category')}>
            <option value="">Geral</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="req-budget">Orçamento disponível (R$)</label>
          <input
            id="req-budget"
            type="number"
            min="0"
            className="form-input"
            placeholder="Ex: 200"
            value={form.budget}
            onChange={change('budget')}
          />
        </div>
      </div>

      <button className="btn-primary w-full mt" onClick={submit} disabled={saving}>
        {saving ? 'Publicando…' : 'Publicar solicitação'}
      </button>
      <FormMessage text={message?.text} type={message?.type} />
    </Modal>
  );
}
