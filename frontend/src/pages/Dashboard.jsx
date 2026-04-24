import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FEATURES } from '../config/features';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Your personal AI-powered fashion assistant is ready to help.</p>
        </div>
      </div>

      <div className="features-grid">
        {FEATURES.map((feature) => (
          <div
            key={feature.key}
            className="feature-card"
            onClick={() => navigate(`/${feature.key}`)}
            style={{ '--card-color': feature.color }}
          >
            <div className="feature-card-icon" style={{ background: feature.color }}>
              <span className="material-icons-outlined">{feature.icon}</span>
            </div>
            <div className="feature-card-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <div className="feature-card-arrow">
              <span className="material-icons-outlined">arrow_forward</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
