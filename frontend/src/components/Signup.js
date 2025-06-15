import React, { useState } from 'react';
import axios from 'axios';

const Signup = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/cart/signup', { email, password,address });
      if (res.data && res.data.success) {
        alert('Signup successful. Please login.');
        onSwitchToLogin();
      } else {
        alert('Signup failed.');
      }
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Signup error.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Sign Up</h3>
        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea
              className="form-control" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-success w-100">Sign Up</button>
        </form>
        <div className="text-center mt-3">
          <span>Already have an account? </span>
          <button className="btn btn-link p-0" onClick={onSwitchToLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
