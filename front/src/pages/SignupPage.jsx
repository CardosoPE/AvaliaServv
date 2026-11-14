import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormMessage from '../components/FormMessage.jsx';
import PhoneField from '../components/PhoneField.jsx';
import { buildNumber, maskCpf } from '../api/phone.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = [
  '🔧 Manutenção', '🏗️ Construção', '🧹 Limpeza', '💻 Tecnologia', '🏥 Saúde', '📚 Educação',
  '💇 Beleza', '🌿 Jardinagem', '🔒 Segurança', '🚗 Transporte', '🍽️ Alimentação', '⚖️ Advocacia',
  '📊 Contabilidade', '🏛️ Arquitetura', '🎉 Eventos', '🐾 Pets',
].map((label) => ({ label, value: label.split(' ').slice(1).join(' ') }));

const EXPERIENCES = ['Menos de 1 ano', '1-2 anos', '3-5 anos', '5-10 anos', 'Mais de 10 anos'];
const RADIUS = ['5km', '10km', '20km', '50km', '100km', 'Regional', 'Estadual', 'Nacional', 'Remoto'];
const AVAILABILITY = ['Tempo Integral', 'Meio Período', 'Horário Comercial', 'Fins de Semana', '24/7', 'Sob Demanda'];
const PAYMENTS = ['Dinheiro', 'PIX', 'Cartão Crédito', 'Cartão Débito', 'Transferência', 'Boleto'];
const LANGUAGES = ['Português', 'Inglês', 'Espanhol', 'Francês'];

const emptyForm = {
  type: 'client',
  name: '', email: '', password: '', birth: '', cpf: '', gender: '', phone: '', city: '',
  category: '', jobTitle: '', specialty: '', experience: '', description: '',
  whatsappCountry: 'BR', whatsappRaw: '', location: '', serviceRadius: '', availability: '',
  website: '', instagram: '', hourlyRate: '', minValue: '', register: '', insurance: '',
  formations: '', serviceType: '', transport: '',
  paymentMethods: [], languages: ['Português'],
};

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isPro = form.type === 'professional';
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const change = (field) => (e) => set(field, e.target.value);

  const toggleInList = (field, value) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setError('Preencha nome, e-mail e senha.');
    }
    if (form.password.length < 6) return setError('A senha precisa ter ao menos 6 caracteres.');
    if (isPro && (!form.category || !form.jobTitle.trim())) {
      return setError('Informe a categoria e a função profissional.');
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      type: form.type,
      phone: form.phone,
      city: form.city,
      gender: form.gender,
      birth: form.birth || null,
      cpf: form.cpf,
      profile: isPro
        ? {
            category: form.category,
            jobTitle: form.jobTitle,
            specialty: form.specialty,
            experience: form.experience,
            description: form.description,
            whatsapp: buildNumber(form.whatsappCountry, form.whatsappRaw),
            whatsappRaw: form.whatsappRaw,
            whatsappCountry: form.whatsappCountry,
            location: form.location,
            serviceRadius: form.serviceRadius,
            availability: form.availability,
            serviceType: form.serviceType,
            transport: form.transport,
            hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
            minValue: form.minValue ? Number(form.minValue) : null,
            register: form.register,
            insurance: form.insurance,
            instagram: form.instagram,
            website: form.website,
            paymentMethods: form.paymentMethods,
            languages: form.languages,
            formations: form.formations.split(',').map((s) => s.trim()).filter(Boolean),
          }
        : null,
    };

    setLoading(true);
    try {
      await signup(payload);
      navigate('/');
    } catch (err) {
      setError(err.details?.length ? err.details.join(' · ') : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="modal-box modal-box-wide auth-box" onSubmit={submit}>
        <div className="modal-brand">
          <div className="brand-icon">⚡</div>
          <h2>Criar conta</h2>
          <p>Escolha como você vai usar o Avalia.Serv</p>
        </div>

        <div className="modal-body">
          <div className="account-type-selector">
            <label className="account-type-card">
              <input
                type="radio"
                name="account-type"
                checked={!isPro}
                onChange={() => set('type', 'client')}
              />
              <div className="account-type-inner">
                <span className="account-icon">👤</span>
                <strong>Cliente</strong>
                <small>Quero contratar serviços</small>
              </div>
            </label>
            <label className="account-type-card">
              <input
                type="radio"
                name="account-type"
                checked={isPro}
                onChange={() => set('type', 'professional')}
              />
              <div className="account-type-inner">
                <span className="account-icon">🔧</span>
                <strong>Profissional</strong>
                <small>Quero oferecer serviços</small>
              </div>
            </label>
          </div>

          <div className="form-section">
            <div className="section-title">Dados pessoais</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input className="form-input" value={form.name} onChange={change('name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Data de nascimento</label>
                <input type="date" className="form-input" value={form.birth} onChange={change('birth')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input
                  className="form-input"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => set('cpf', maskCpf(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gênero</label>
                <select className="form-input" value={form.gender} onChange={change('gender')}>
                  <option value="">Selecione</option>
                  {['Masculino', 'Feminino', 'Não-binário', 'Prefiro não informar'].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-input" value={form.email} onChange={change('email')} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" placeholder="(00) 90000-0000" value={form.phone} onChange={change('phone')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input type="password" className="form-input" value={form.password} onChange={change('password')} />
              </div>
              <div className="form-group">
                <label className="form-label">Cidade / Estado</label>
                <input className="form-input" placeholder="Recife, PE" value={form.city} onChange={change('city')} />
              </div>
            </div>
          </div>

          {isPro && (
            <>
              <div className="form-section">
                <div className="section-title">Área profissional</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Categoria</label>
                    <select className="form-input" value={form.category} onChange={change('category')}>
                      <option value="">Selecione</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Função / cargo</label>
                    <input className="form-input" placeholder="Ex: Eletricista" value={form.jobTitle} onChange={change('jobTitle')} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Especialidade</label>
                    <input className="form-input" value={form.specialty} onChange={change('specialty')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experiência</label>
                    <select className="form-input" value={form.experience} onChange={change('experience')}>
                      <option value="">Selecione</option>
                      {EXPERIENCES.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição dos serviços</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={change('description')} />
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Contato profissional</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">WhatsApp profissional</label>
                    <PhoneField
                      id="signup-whatsapp"
                      country={form.whatsappCountry}
                      number={form.whatsappRaw}
                      onChange={({ country, number }) => {
                        set('whatsappCountry', country);
                        set('whatsappRaw', number);
                      }}
                    />
                    <small className="form-hint">Número que os clientes vão ver</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Localização de atuação</label>
                    <input className="form-input" value={form.location} onChange={change('location')} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Raio de atuação</label>
                    <select className="form-input" value={form.serviceRadius} onChange={change('serviceRadius')}>
                      <option value="">Selecione</option>
                      {RADIUS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Disponibilidade</label>
                    <select className="form-input" value={form.availability} onChange={change('availability')}>
                      <option value="">Selecione</option>
                      {AVAILABILITY.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Site / portfólio</label>
                    <input className="form-input" placeholder="https://" value={form.website} onChange={change('website')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instagram</label>
                    <input className="form-input" placeholder="@usuario" value={form.instagram} onChange={change('instagram')} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Valores e pagamento</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Valor por hora (R$)</label>
                    <input type="number" min="0" className="form-input" value={form.hourlyRate} onChange={change('hourlyRate')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valor mínimo (R$)</label>
                    <input type="number" min="0" className="form-input" value={form.minValue} onChange={change('minValue')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Formas de pagamento aceitas</label>
                  <div className="checkbox-grid">
                    {PAYMENTS.map((p) => (
                      <label className="check-item" key={p}>
                        <input
                          type="checkbox"
                          checked={form.paymentMethods.includes(p)}
                          onChange={() => toggleInList('paymentMethods', p)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Qualificações</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Registro profissional</label>
                    <input className="form-input" placeholder="CREA / CRM / OAB" value={form.register} onChange={change('register')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Seguro civil</label>
                    <select className="form-input" value={form.insurance} onChange={change('insurance')}>
                      <option value="">Selecione</option>
                      {['Sim', 'Não', 'Em andamento'].map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Formações (separadas por vírgula)</label>
                  <input className="form-input" value={form.formations} onChange={change('formations')} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Idiomas</label>
                    <div className="checkbox-grid">
                      {LANGUAGES.map((l) => (
                        <label className="check-item" key={l}>
                          <input
                            type="checkbox"
                            checked={form.languages.includes(l)}
                            onChange={() => toggleInList('languages', l)}
                          />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo de atendimento</label>
                    <select className="form-input" value={form.serviceType} onChange={change('serviceType')}>
                      <option value="">Selecione</option>
                      {['Presencial', 'Online / Remoto', 'Presencial e Remoto'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Transporte</label>
                  <select className="form-input" value={form.transport} onChange={change('transport')}>
                    <option value="">Selecione</option>
                    {['Carro Próprio', 'Moto', 'Bicicleta', 'Transporte Público', 'Trabalho Remoto'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <button className="btn-primary w-full mt" type="submit" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
          <p className="auth-footer">
            Já tem conta? <Link className="link" to="/login">Faça login</Link>
          </p>
          <FormMessage text={error} type="error" />
        </div>
      </form>
    </div>
  );
}
