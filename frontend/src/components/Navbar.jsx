import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <span className="material-icons-outlined">auto_awesome</span>
        <h1>AI Personal Stylist</h1>
      </div>
      <div className="navbar-right">
        {location.pathname !== '/' && (
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            <span className="material-icons-outlined">home</span>
            Dashboard
          </button>
        )}
        <button
          className="btn btn-ghost"
          data-testid="nav-stylist-views"
          onClick={() => navigate('/custom-views')}
        >
          <span className="material-icons-outlined">dashboard_customize</span>
          Stylist Views
        </button>
        <div className="user-badge">
          <span className="material-icons-outlined">account_circle</span>
          <span>{user?.name}</span>
        </div>
        <button className="btn btn-ghost" onClick={logout}>
          <span className="material-icons-outlined">logout</span>
          Logout
        </button>
      </div>
    </nav>
  );
}
