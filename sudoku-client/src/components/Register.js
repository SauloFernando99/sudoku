import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, { username, password });
      alert('User registered successfully');
      window.location.href = '/login';
    } catch (error) {
      alert('Registration failed!');
    }
  };

  return (
    <div className="register-container">
      <h1>User Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Registry</button>
      </form>
    </div>
  );
}

export default Register;
