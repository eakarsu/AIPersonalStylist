import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@stylist.com');
    setPassword('demo123');
    setIsRegister(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="material-icons-outlined login-logo">auto_awesome</span>
          <h1>AI Personal Stylist</h1>
          <p>Your intelligent fashion companion powered by AI</p>
        </div>
        <div className="login-features">
          <div className="login-feature">
            <span className="material-icons-outlined">checkroom</span>
            <span>Smart Wardrobe Management</span>
          </div>
          <div className="login-feature">
            <span className="material-icons-outlined">palette</span>
            <span>AI Color Analysis</span>
          </div>
          <div className="login-feature">
            <span className="material-icons-outlined">style</span>
            <span>Outfit Recommendations</span>
          </div>
          <div className="login-feature">
            <span className="material-icons-outlined">trending_up</span>
            <span>Trend Tracking</span>
          </div>
          <div className="login-feature">
            <span className="material-icons-outlined">calendar_month</span>
            <span>Outfit Planning</span>
          </div>
          <div className="login-feature">
            <span className="material-icons-outlined">account_balance_wallet</span>
            <span>Budget Tracking</span>
          </div>
        </div>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="login-subtitle">
            {isRegister ? 'Start your style journey' : 'Sign in to your account'}
          </p>

          {error && <div className="error-message">{error}</div>}

          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <button type="button" className="btn btn-demo btn-full" onClick={fillDemo}>
            <span className="material-icons-outlined">flash_on</span>
            Quick Demo Login
          </button>

          <p className="login-toggle">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
