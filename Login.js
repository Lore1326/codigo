import React, { useState } from 'react';
import './login.css';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // Credenciales predeterminadas para la prueba
        const predefinedUsername = 'Lorena';
        const predefinedPassword = 'Login1';

        if (username === predefinedUsername && password === predefinedPassword) {
            onLogin(); // Llama a la función de login si las credenciales son correctas
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div className="login-container">
            <h1>Inicio de Sesión</h1>
            <form onSubmit={handleLogin}>
                <label>
                    Usuario:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label>
                    Contraseña:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <br />
                <button type="submit">Iniciar Sesión</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default Login;
