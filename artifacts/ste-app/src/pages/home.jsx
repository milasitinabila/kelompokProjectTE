import React from 'react';
import { useLocation } from 'wouter';

const LandingPage = () => {
  // Menggunakan useLocation dari wouter, bukan useNavigate
  const [, setLocation] = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* Bagian Hero / Tengah */}
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Contract Management System
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '2rem' }}>
          Sistem manajemen kontrak dan kasir (POS) yang cepat, aman, dan mudah digunakan.
        </p>
        
        {/* Tombol Navigasi */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setLocation('/login')} 
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Login Admin
          </button>
          
          <button 
            onClick={() => setLocation('/pos')} 
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Buka Kasir (POS)
          </button>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;