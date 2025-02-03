import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-content">
                <h1>Yetkisiz Erişim</h1>
                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                <button onClick={() => navigate('/')}>Giriş Sayfasına Dön</button>
            </div>
        </div>
    );
};

export default Unauthorized; 