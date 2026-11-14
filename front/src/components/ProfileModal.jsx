import { useRef, useState } from 'react';
import Modal from './Modal.jsx';
import FormMessage from './FormMessage.jsx';
import Avatar from './Avatar.jsx';
import PhoneField from './PhoneField.jsx';
import { api } from '../api/client.js';
import { buildNumber } from '../api/phone.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export default function ProfileModal({ onClose, profile }) {
  const { user, setUser, isProfessional } = useAuth();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    city: user.city || '',
    bio: user.bio || '',
    photo: user.photo || '',
    specialty: profile?.specialty || '',
    hourlyRate: profile?.hourlyRate || '',
    availability: profile?.availability || '',
    description: profile?.description || '',
    location: profile?.location || '',
    whatsappCountry: profile?.whatsappCountry || 'BR',
    whatsappRaw: profile?.whatsappRaw || '',
  });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      return showToast('A imagem precisa ter no máximo 5 MB.', 'error');
    }
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        bio: form.bio,
        photo: form.photo,
      };

      if (isProfessional) {
        payload.profile = {
          specialty: form.specialty,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          availability: form.availability,
          description: form.description,
          location: form.location,
          whatsappCountry: form.whatsappCountry,
          whatsappRaw: form.whatsappRaw,
          whatsapp: buildNumber(form.whatsappCountry, form.whatsappRaw),
        };
      }

      const updated = await api.users.update(payload);
      setUser(updated);
      showToast('Perfil atualizado.');
      onClose();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="✏️ Editar perfil" onClose={onClose} wide>
      <div className="photo-upload-area">
        <Avatar name={form.name} photo={form.photo} className="photo-preview" />
        <div className="photo-upload-actions">
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            📷 Trocar foto
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          <button className="btn-ghost danger small" onClick={() => setForm({ ...form, photo: '' })}>
            Remover
          </button>
        </div>
        <small className="form-hint">JPG ou PNG, até 5 MB</small>
      </div>

      <div className="form-section">
        <div className="section-title">Dados pessoais</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={form.name} onChange={change('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-input" value={user.email} disabled />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input className="form-input" value={form.phone} onChange={change('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input className="form-input" value={form.city} onChange={change('city')} placeholder="Recife, PE" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-input" rows={2} value={form.bio} onChange={change('bio')} />
        </div>
      </div>

      {isProfessional && (
        <div className="form-section">
          <div className="section-title">Dados profissionais</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">WhatsApp profissional</label>
              <PhoneField
                id="profile-whatsapp"
                country={form.whatsappCountry}
                number={form.whatsappRaw}
                onChange={({ country, number }) =>
                  setForm({ ...form, whatsappCountry: country, whatsappRaw: number })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Especialidade</label>
              <input className="form-input" value={form.specialty} onChange={change('specialty')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor por hora (R$)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.hourlyRate}
                onChange={change('hourlyRate')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Disponibilidade</label>
              <select className="form-input" value={form.availability} onChange={change('availability')}>
                <option value="">Selecione</option>
                {['Tempo Integral', 'Meio Período', 'Horário Comercial', 'Fins de Semana', '24/7', 'Sob Demanda'].map(
                  (a) => (
                    <option key={a} value={a}>{a}</option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Localização de atuação</label>
            <input className="form-input" value={form.location} onChange={change('location')} />
          </div>
          <div className="form-group mt">
            <label className="form-label">Descrição dos serviços</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={change('description')} />
          </div>
        </div>
      )}

      <button className="btn-primary w-full" onClick={save} disabled={saving}>
        {saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
      <FormMessage text={message?.text} type={message?.type} />
    </Modal>
  );
}
