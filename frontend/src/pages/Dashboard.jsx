import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FEATURES } from '../config/features';

const AI_TOOLS = [
  { key: 'outfit-generator', title: 'Outfit Generator', description: 'AI outfit combos from your wardrobe', icon: 'style', color: '#ec4899' },
  { key: 'wardrobe-photo', title: 'Photo & Vision AI', description: 'Upload photos for AI clothing analysis', icon: 'photo_camera', color: '#6366f1' },
  { key: 'seasonal-analysis', title: 'Seasonal Analysis', description: 'Discover what\'s perfect for the season', icon: 'ac_unit', color: '#06b6d4' },
  { key: 'style-profile-wizard', title: 'Style Profile Wizard', description: 'AI personal style & color palette analysis', icon: 'person', color: '#8b5cf6' },
  { key: 'cost-per-wear', title: 'Cost Per Wear', description: 'Track the true value of your wardrobe', icon: 'account_balance_wallet', color: '#22c55e' },
  { key: 'ai-recommendations', title: 'AI Recommendations', description: 'Shopping, trends, and occasion outfit suggestions', icon: 'recommend', color: '#f59e0b' },
];

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

      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-icons-outlined" style={{ fontSize: '16px', color: '#8b5cf6' }}>auto_awesome</span>
          AI-Powered Tools
        </h2>
        <div className="features-grid" style={{ marginBottom: '28px' }}>
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.key}
              className="feature-card"
              onClick={() => navigate(`/${tool.key}`)}
              style={{ '--card-color': tool.color, border: `1px solid ${tool.color}22`, background: `${tool.color}08` }}
            >
              <div className="feature-card-icon" style={{ background: tool.color }}>
                <span className="material-icons-outlined">{tool.icon}</span>
              </div>
              <div className="feature-card-content">
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
              <div className="feature-card-arrow">
                <span className="material-icons-outlined">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Wardrobe Management
        </h2>
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
    </div>
  );
}
