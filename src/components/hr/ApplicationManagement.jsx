import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplicationManagement.css';

const ApplicationManagement = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [tempStatus, setTempStatus] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Kullanıcı bilgileri alınamadı');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Kullanıcı bilgileri alınırken hata:', error);
            return null;
        }
    };

    const fetchApplications = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8080/hr/applications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'method': 'GET'
                }
            });

            if (!response.ok) {
                throw new Error('Başvurular yüklenirken hata oluştu');
            }

            const data = await response.json();
            
            const applicationsWithUsers = await Promise.all(
                data.map(async (application) => {
                    const userDetail = await fetchUserDetails(application.userId);
                    return {
                        ...application,
                        userDetail
                    };
                })
            );
            
            setApplications(applicationsWithUsers);
            setLoading(false);
        } catch (error) {
            console.error('Başvurular yüklenirken hata:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleViewDetail = async (application) => {
        try {
            // CV bilgilerini getir
            const cvResponse = await fetch(`http://localhost:8080/applicant/cv-documents/${application.cvId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!cvResponse.ok) {
                throw new Error('CV bilgileri alınamadı');
            }

            const cvDocument = await cvResponse.json();
            
            // Başvuru bilgilerini güncelle ve CV bilgilerini ekle
            setSelectedApplication({
                ...application,
                cvDocument: cvDocument
            });
            
            setTempStatus(application.applicationStatusType);
            setShowDetailModal(true);

        } catch (error) {
            console.error('CV bilgileri alınırken hata:', error);
            // CV bilgileri alınamazsa da modalı göster ama CV kısmı boş olacak
            setSelectedApplication(application);
            setTempStatus(application.applicationStatusType);
            setShowDetailModal(true);
        }
    };

    const handleViewCV = async (cvId) => {
        try {
            // Önce dosya bilgilerini al
            const response = await fetch(`http://localhost:8080/applicant/cv-documents/${cvId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('CV yüklenirken hata oluştu');
            }

            const cvData = await response.json();
            
            if (cvData.fileUrl) {
                // Ters eğik çizgileri düz çizgiye çevir
                const normalizedPath = cvData.fileUrl.replace(/\\/g, '/');
                const fullPath = `file:///C:/Users/erkan/Desktop/isbulB/isbul/${normalizedPath}`;
                window.open(fullPath, '_blank');

            } else {
                throw new Error('CV dosyası bulunamadı');
            }

        } catch (error) {
            console.error('CV görüntüleme hatası:', error);
            alert('CV görüntülenirken bir hata oluştu');
        }
    };

    const handleStatusChange = async (applicationId) => {
        try {
            const response = await fetch(`http://localhost:8080/hr/applications/status/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tempStatus)
            });

            if (!response.ok) {
                throw new Error('Durum güncellenirken hata oluştu');
            }

            const message = await response.text();
            setSuccessMessage(message);
            setShowSuccessMessage(true);
            setShowDetailModal(false);
            
            // 2 saniye sonra mesajı kapat ve yönlendir
            setTimeout(() => {
                setShowSuccessMessage(false);
                fetchApplications();
                navigate('/hr/applications');
            }, 2000);

        } catch (error) {
            console.error('Durum güncelleme hatası:', error);
            alert('Durum güncellenirken bir hata oluştu');
        }
    };

    return (
        <div className="application-management-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate('/homepage')}>
                    ← Ana Sayfa
                </button>
                <h1>Başvuru Yönetimi</h1>
            </div>

            {loading ? (
                <div className="loading">Başvurular yükleniyor...</div>
            ) : applications.length === 0 ? (
                <div className="no-applications">Henüz başvuru bulunmamaktadır.</div>
            ) : (
                <div className="applications-list">
                    {applications.map(application => (
                        <div key={application.id} className="application-card">
                            <div className="application-header">
                                <h3>{application.jobPosting.title}</h3>
                            </div>
                            
                            <div className="applicant-info">
                                <div className="info-group">
                                    <span className="label">Şirket:</span>
                                    <span>{application.jobPosting.company}</span>
                                </div>
                                <div className="info-group">
                                    <span className="label">Lokasyon:</span>
                                    <span>{application.jobPosting.location}</span>
                                </div>
                                <div className="info-group">
                                    <span className="label">Başvuru Tarihi:</span>
                                    <span>{new Date(application.systemCreatedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="info-group">
                                    <span className="label">Başvuru Kodu:</span>
                                    <span>{application.randomCode}</span>
                                </div>
                            </div>

                            <div className="application-footer">
                                <button 
                                    className="view-detail-button"
                                    onClick={() => handleViewDetail(application)}
                                >
                                    Detayları Görüntüle
                                </button>
                                <div className={`status-badge ${application.applicationStatusType.toLowerCase()}`}>
                                    {application.applicationStatusType === 'PENDING' && 'Beklemede'}
                                    {application.applicationStatusType === 'APPROVED' && 'Kabul Edildi'}
                                    {application.applicationStatusType === 'REJECTED' && 'Reddedildi'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDetailModal && selectedApplication && (
                <div className="modal-overlay">
                    <div className="modal detail-modal">
                        <div className="modal-header">
                            <h2>{selectedApplication.jobPosting.title}</h2>
                            <button className="close-button" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="detail-section">
                                <h3>Başvuran Bilgileri</h3>
                                <div className="detail-info">
                                    {selectedApplication.userDetail && (
                                        <>
                                            <p><strong>Ad Soyad:</strong> {`${selectedApplication.userDetail.firstName} ${selectedApplication.userDetail.lastName}`}</p>
                                            <p><strong>E-posta:</strong> {selectedApplication.userDetail.email}</p>
                                            <p><strong>Telefon:</strong> {selectedApplication.userDetail.phone}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Başvuru Detayları</h3>
                                <div className="detail-info">
                                    <p><strong>Şirket:</strong> {selectedApplication.jobPosting.company}</p>
                                    <p><strong>Lokasyon:</strong> {selectedApplication.jobPosting.location}</p>
                                    <p><strong>Başvuru Tarihi:</strong> {new Date(selectedApplication.systemCreatedDate).toLocaleDateString()}</p>
                                    <p><strong>Durum:</strong> {selectedApplication.applicationStatusType}</p>
                                    <p><strong>Başvuru Kodu:</strong> {selectedApplication.randomCode}</p>
                                </div>
                            </div>

                            <div className="cv-section">
                                <h3>CV</h3>
                                <div className="cv-info">
                                    {selectedApplication.cvDocument ? (
                                        <>
                                            <div className="cv-details">
                                                <p><strong>Dosya Adı:</strong> {selectedApplication.cvDocument.fileName}</p>
                                                <p><strong>Dosya Türü:</strong> {selectedApplication.cvDocument.fileType}</p>
                                            </div>
                                            <button 
                                                className="view-cv-button"
                                                onClick={() => handleViewCV(selectedApplication.cvId)}
                                            >
                                                <i className="fas fa-file-pdf"></i>
                                                CV'yi Görüntüle
                                            </button>
                                        </>
                                    ) : (
                                        <p className="no-cv">CV bulunamadı</p>
                                    )}
                                </div>
                            </div>

                            <div className="status-section">
                                <h3>Başvuru Durumu</h3>
                                <div className="status-edit">
                                    <div className="status-row">
                                        <select 
                                            value={tempStatus}
                                            onChange={(e) => setTempStatus(e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="PENDING">Beklemede</option>
                                            <option value="APPROVED">Kabul Edildi</option>
                                            <option value="REJECTED">Reddedildi</option>
                                        </select>
                                        
                                        {tempStatus !== selectedApplication.applicationStatusType && (
                                            <div className="status-actions">
                                                <button 
                                                    className="save-button"
                                                    onClick={() => handleStatusChange(selectedApplication.id)}
                                                >
                                                    Kaydet
                                                </button>
                                                <button 
                                                    className="cancel-button"
                                                    onClick={() => {
                                                        setTempStatus(selectedApplication.applicationStatusType);
                                                    }}
                                                >
                                                    İptal
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessMessage && (
                <div className="success-message-overlay">
                    <div className="success-message-modal">
                        <div className="success-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationManagement; 