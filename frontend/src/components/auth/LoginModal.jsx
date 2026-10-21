import React, { useState } from 'react';
import { User, Key, Utensils, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import * as api from '../../services/api';

export default function LoginModal({ onLoginSuccess, currentOutlet }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.login(username.trim(), password);
      if (res && res.user) {
        onLoginSuccess(res.user, res.token);
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #09171f 0%, #0d2822 50%, #17362f 100%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '410px',
          width: '100%',
          borderRadius: '24px',
          padding: '34px 30px',
          background: '#ffffff',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Enterprise Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #176b52 0%, #0f4a38 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(23,107,82,0.3)',
            }}
          >
            <Utensils size={28} />
          </div>
          <h2
            style={{
              margin: '0 0 4px',
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.3px',
            }}
          >
            Tableflow POS
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {currentOutlet?.name ? `${currentOutlet.name} · Terminal Sign In` : 'Enterprise Restaurant Management'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Secure Login Form */}
        <form onSubmit={handleLogin} autoComplete="on">
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="pos-username"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              Username / Staff ID
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              <input
                id="pos-username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
                required
                style={{
                  paddingLeft: '40px',
                  height: '44px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label
              htmlFor="pos-password"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              <input
                id="pos-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                style={{
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  height: '44px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '46px',
              fontSize: '14px',
              fontWeight: 700,
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#176b52',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 14px rgba(23,107,82,0.3)',
            }}
          >
            {loading ? 'Authenticating...' : (
              <>Sign In to Terminal <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Professional Subtitle */}
        <div style={{ textAlign: 'center', marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Authorized Staff Access Only · Tableflow POS
          </span>
        </div>
      </div>
    </div>
  );
}
