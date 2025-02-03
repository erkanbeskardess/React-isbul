import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../utils/roles';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const renderNavButtons = () => {
        switch(userRole) {
            case ROLES.APPLICANT:
                return (
                    <div className="nav-buttons">
                        <button onClick={() => navigate('/applications')}>Başvurularım</button>
                        <button onClick={() => navigate('/jobs')}>İlanlar</button>
                        <button onClick={() => navigate('/cv')}>CV</button>
                    </div>
                );
            case ROLES.HR:
                return (
                    <div className="nav-buttons">
                        <button onClick={() => navigate('/hr/jobs')}>İlanlarım</button>
                        <button onClick={() => navigate('/hr/applications')}>Başvurular</button>
                    </div>
                );
            case ROLES.ADMIN:
                return (
                    <div className="nav-buttons">
                        <button onClick={() => navigate('/admin/users')}>Kullanıcılar</button>
                        <button onClick={() => navigate('/admin/settings')}>Ayarlar</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="homepage-container">
            <div className="header">
                {renderNavButtons()}
                <button className="logout-button" onClick={handleLogout}>
                    Çıkış Yap
                </button>
            </div>
            <h1>Ana Sayfaya Hoş Geldiniz</h1>
        </div>
    );
}

export default HomePage;
