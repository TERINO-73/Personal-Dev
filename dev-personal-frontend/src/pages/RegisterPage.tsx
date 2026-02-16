import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import '../styles/Auth.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AuthService.register(name, username, email, password);
      navigate('/personal/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse. Intenta de nuevo.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Únete a la Aventura</h2>
          <p>Crea tu cuenta para comenzar</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu Nombre Heroico"
              required
            />
          </div>

          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Hero123"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-auth">
            Registrarse
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta?
          <Link to="/personal/login" className="auth-link">Inicia Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
