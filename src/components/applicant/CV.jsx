import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CV.css';

const CV = () => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cvTitle, setCvTitle] = useState('');
    const [cvList, setCvList] = useState([]);
    const [selectedCV, setSelectedCV] = useState(null);

    useEffect(() => {
        fetchCVs();
    }, []);

    const fetchCVs = async () => {
        try {
            const response = await fetch('http://localhost:8080/applicant/cv-documents', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('CV\'ler yüklenirken hata oluştu');
            }

            const data = await response.json();
            setCvList(data);
        } catch (error) {
            console.error('CV\'ler yüklenirken hata:', error);
            alert('CV\'ler yüklenirken bir hata oluştu');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setCvTitle(file.name.split('.')[0]);
        }
    };

    const handleAddCV = async () => {
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            // DTO'yu JSON formatına çevir ve Blob olarak ekle
            const cvData = JSON.stringify({
                fileName: selectedFile.name,
                fileType: selectedFile.type
            });
    
            formData.append('data', new Blob([cvData], { type: 'application/json' }));
    
            const response = await fetch('http://localhost:8080/applicant/cv-documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
    
            if (!response.ok) {
                throw new Error('CV yükleme başarısız');
            }
    
            await fetchCVs();
            setShowAddModal(false);
            setCvTitle('');
            setSelectedFile(null);
            alert('CV başarıyla yüklendi');
        } catch (error) {
            console.error('CV yükleme hatası:', error);
            alert('CV yüklenirken bir hata oluştu');
        }
    };
    
    const handlePreview = async (cv) => {
        try {
            const response = await fetch(`http://localhost:8080/applicant/cv-documents/${cv.id}`, {
                headers: {
                    method: 'GET',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }

            });

            if (!response.ok) {
                throw new Error('CV önizleme yüklenemedi');
            }

            // PDF blob olarak geliyor varsayalım
            const blob = await response.blob();
            const fileUrl = URL.createObjectURL(blob);
            setSelectedCV({ ...cv, previewUrl: fileUrl });
            setShowPreviewModal(true);
        } catch (error) {
            console.error('CV önizleme hatası:', error);
            alert('CV önizleme yüklenirken bir hata oluştu');
        }
    };

    const handleDelete = async (cvId) => {
        try {
            const response = await fetch(`http://localhost:8080/applicant/cv-documents/${cvId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('CV silinemedi');
            }

            await fetchCVs();
            setShowPreviewModal(false);
            alert('CV başarıyla silindi');
        } catch (error) {
            console.error('CV silme hatası:', error);
            alert('CV silinirken bir hata oluştu');
        }
    };

    return (
        <div className="cv-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate('/homepage')}>
                    ← Ana Sayfa
                </button>
                <h1>CV Yönetimi</h1>
                <button className="add-cv-button" onClick={() => setShowAddModal(true)}>
                    + Yeni CV
                </button>
            </div>

            <div className="cv-list">
                {cvList.map(cv => (
                    <div key={cv.id} className="cv-card">
                        <div className="cv-info">
                            <div className="file-icon">
                                <i className="far fa-file-pdf"></i>
                            </div>
                            <div className="cv-details">
                                <h3>{cv.fileName}</h3>
                                <div className="file-meta">
                                    <span className="file-type">{cv.fileType}</span>
                                </div>
                            </div>
                        </div>
                        <div className="cv-actions">
                            <button 
                                className="preview-button"
                                onClick={() => handlePreview(cv)}
                            >
                                <i className="far fa-eye"></i> Önizle
                            </button>
                            <button 
                                className="delete-button"
                                onClick={() => {
                                    if (window.confirm('Bu CV\'yi silmek istediğinizden emin misiniz?')) {
                                        handleDelete(cv.id);
                                    }
                                }}
                            >
                                <i className="far fa-trash-alt"></i> Sil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Yeni CV Ekle</h2>
                            <button className="close-button" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>CV Dosyası:</label>
                                <div className="file-upload">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                    <p className="file-info">PDF, DOC veya DOCX formatında dosya yükleyin</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setShowAddModal(false)}
                            >
                                İptal
                            </button>
                            <button 
                                className="submit-button"
                                onClick={handleAddCV}
                                disabled={!selectedFile}
                            >
                                Yükle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPreviewModal && (
                <div className="modal-overlay">
                    <div className="modal preview-modal">
                        <div className="modal-header">
                            <h2>CV Önizleme</h2>
                            <button className="close-button" onClick={() => setShowPreviewModal(false)}>×</button>
                        </div>
                        <div className="preview-content">
                            <div className="preview-placeholder">
                                <p>PDF Önizleme</p>
                                <p>Gerçek uygulamada burada CV dosyası görüntülenecek</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="delete-button"
                                onClick={() => {
                                    if (window.confirm('Bu CV\'yi silmek istediğinizden emin misiniz?')) {
                                        handleDelete(selectedCV.id);
                                    }
                                }}
                            >
                                CV'yi Sil
                            </button>
                            <button 
                                className="close-button"
                                onClick={() => setShowPreviewModal(false)}
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CV;