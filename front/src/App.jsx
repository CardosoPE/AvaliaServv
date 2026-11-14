import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import ProfessionalDashboard from './pages/ProfessionalDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot-screen">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot-screen">Carregando…</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isProfessional } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/cadastro" element={<PublicOnly><SignupPage /></PublicOnly>} />
      <Route path="/recuperar-senha" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
      <Route
        path="/"
        element={
          <Protected>{isProfessional ? <ProfessionalDashboard /> : <ClientDashboard />}</Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
