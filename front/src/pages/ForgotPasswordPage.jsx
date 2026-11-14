import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormMessage from '../components/FormMessage.jsx';
import { api } from '../api/client.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [passwords, setPasswords] = useState({ first: '', second: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (fn) => {
    setLoading(true);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const requestCode = () =>
    run(async () => {
      const res = await api.auth.forgotPassword(email.trim().toLowerCase());
      setMessage({
        text: res.devToken
          ? `Código gerado: ${res.devToken} (em produção ele vai por e-mail)`
          : res.message,
        type: 'success',
      });
      setStep('token');
    });

  const verify = () =>
    run(async () => {
      await api.auth.verifyToken(email, token);
      setMessage({ text: 'Código confirmado. Escolha a nova senha.', type: 'success' });
      setStep('password');
    });

  const savePassword = () =>
    run(async () => {
      if (passwords.first.length < 6) throw new Error('A senha precisa ter ao menos 6 caracteres.');
      if (passwords.first !== passwords.second) throw new Error('As senhas não coincidem.');
      await api.auth.resetPassword({ email, token, newPassword: passwords.first });
      navigate('/login');
    });

  return (
    <div className="auth-screen">
      <div className="modal-box auth-box">
        <div className="modal-header-row">
          <h2>🔑 Recuperar senha</h2>
        </div>

        <div className="modal-body">
          {step === 'email' && (
            <>
              <p className="modal-intro">Informe seu e-mail para receber um código de verificação.</p>
              <div className="form-group">
                <label className="form-label">E-mail cadastrado</label>
                <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button className="btn-primary w-full mt" onClick={requestCode} disabled={loading}>
                Enviar código
              </button>
            </>
          )}

          {step === 'token' && (
            <>
              <p className="modal-intro">Digite o código de 6 dígitos enviado para {email}.</p>
              <div className="form-group">
                <label className="form-label">Código de verificação</label>
                <input
                  className="form-input code-input"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <button className="btn-primary w-full mt" onClick={verify} disabled={loading}>
                Verificar código
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <p className="modal-intro">Crie sua nova senha.</p>
              <div className="form-group">
                <label className="form-label">Nova senha</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwords.first}
                  onChange={(e) => setPasswords({ ...passwords, first: e.target.value })}
                />
              </div>
              <div className="form-group mt">
                <label className="form-label">Confirmar senha</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwords.second}
                  onChange={(e) => setPasswords({ ...passwords, second: e.target.value })}
                />
              </div>
              <button className="btn-primary w-full mt" onClick={savePassword} disabled={loading}>
                Salvar nova senha
              </button>
            </>
          )}

          <FormMessage text={message?.text} type={message?.type} />
          <p className="auth-footer">
            <Link className="link" to="/login">← Voltar ao login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
