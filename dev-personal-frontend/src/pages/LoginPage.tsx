import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import '../styles/Auth.css';

interface Props {
    onLogin: (user: any) => void;
}

const LoginPage = ({ onLogin }: Props) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userData = await AuthService.login(usernameOrEmail, password);
            onLogin(userData);
            navigate('/personal'); // Redirigir al dashboard/personal tras login
        } catch (err) {
            setError('Credenciales inválidas. Por favor, intenta de nuevo.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Bienvenido</h2>
                    <p>Inicia sesión para continuar tu aventura</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Usuario o Email</label>
                        <input
                            type="text"
                            className="form-control"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
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
                        Entrar
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No estás registrado? <Link to="/personal/register" className="auth-link">Regístrate aquí</Link></p>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
