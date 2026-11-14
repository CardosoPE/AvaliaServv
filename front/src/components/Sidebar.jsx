import Avatar from './Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Sidebar({ items, active, onSelect, onEditProfile, onDeleteAccount }) {
  const { user, logout, isProfessional } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      <button className="user-profile-card" onClick={onEditProfile}>
        <div className="profile-avatar-wrapper">
          <Avatar name={user.name} photo={user.photo} className="profile-avatar" />
          <span className="avatar-edit-btn">📷</span>
        </div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
        <div className="profile-badge">{isProfessional ? 'Profissional' : 'Cliente'}</div>
      </button>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.key}
            className={`nav-item${active === item.key ? ' active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            {item.icon} <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-actions">
        <button className="btn-ghost" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Tema claro' : '🌙 Tema escuro'}
        </button>
        <button className="btn-ghost" onClick={onEditProfile}>✏️ Editar perfil</button>
        <button className="btn-ghost danger" onClick={logout}>🚪 Sair</button>
        <button className="btn-ghost danger tiny" onClick={onDeleteAccount}>🗑️ Excluir conta</button>
      </div>
    </aside>
  );
}
