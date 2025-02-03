import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { ROLES } from '../../utils/roles';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const userStats = [
        { role: ROLES.HR, count: 25 },
        { role: ROLES.APPLICANT, count: 150 },
        { role: ROLES.ADMIN, count: 5 }
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Paneli</h1>
                <button className="logout-button" onClick={handleLogout}>Çıkış Yap</button>
            </div>
            
            <div className="admin-menu">
                <div className="menu-card" onClick={() => navigate('/admin/users')}>
                    <h3>Kullanıcı Yönetimi</h3>
                    <p>Tüm kullanıcıları görüntüle ve yönet</p>
                </div>
                
                <div className="menu-card" onClick={() => navigate('/admin/settings')}>
                    <h3>Sistem Ayarları</h3>
                    <p>Sistem ayarlarını yapılandır</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 