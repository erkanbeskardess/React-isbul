import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../utils/roles';
import './UserManagement.css';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setShowModal(true);
    };

    const handleRoleChange = (e) => {
        setEditingUser({ ...editingUser, role: e.target.value });
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${editingUser.id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ role: editingUser.role })
            });

            if (response.ok) {
                // Kullanıcı listesini güncelle
                fetchUsers();
                setShowModal(false);
            } else {
                const error = await response.json();
                alert('Güncelleme başarısız: ' + error.message);
            }
        } catch (error) {
            console.error('Rol güncellenirken hata:', error);
            alert('Rol güncellenirken bir hata oluştu');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            try {
                const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    // Kullanıcı listesini güncelle
                    fetchUsers();
                } else {
                    const error = await response.json();
                    alert('Silme işlemi başarısız: ' + error.message);
                }
            } catch (error) {
                console.error('Kullanıcı silinirken hata:', error);
                alert('Kullanıcı silinirken bir hata oluştu');
            }
        }
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <button className="back-button" onClick={() => navigate('/admin')}>
                    ← Geri
                </button>
                <h1>Kullanıcı Yönetimi</h1>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>İsim</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button className="edit-button" onClick={() => handleEdit(user)}>Düzenle</button>
                                    <button className="delete-button" onClick={() => handleDelete(user.id)}>Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Kullanıcı Düzenle</h2>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>İsim:</label>
                                <input type="text" value={editingUser.name} disabled />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="email" value={editingUser.email} disabled />
                            </div>
                            <div className="form-group">
                                <label>Rol:</label>
                                <select value={editingUser.role} onChange={handleRoleChange}>
                                    <option value={ROLES.ADMIN}>Admin</option>
                                    <option value={ROLES.HR}>İK</option>
                                    <option value={ROLES.APPLICANT}>İş Arayan</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-button" onClick={() => setShowModal(false)}>İptal</button>
                            <button className="save-button" onClick={handleSave}>Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement; 