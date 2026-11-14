import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormMessage from '../components/FormMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) return setError('Preencha e-mail e senha.');
    setLoading(true);
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="modal-box auth-box" onSubmit={submit}>
        <div className="modal-brand">
          <div className="brand-icon">⚡</div>
          <h2>Avalia.Serv</h2>
          <p>Entre na sua conta</p>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group mt">
            <label className="form-label" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="btn-primary w-full mt" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="divider"><span>ou</span></div>

          <div className="auth-links">
            <Link className="link" to="/cadastro">Criar conta grátis</Link>
            <Link className="link muted" to="/recuperar-senha">Esqueci a senha</Link>
          </div>

          <FormMessage text={error} type="error" />
        </div>
      </form>
    </div>
  );
}
