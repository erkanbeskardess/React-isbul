import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplicationManagement.css';

const ApplicationManagement = () => {
    const navigate = useNavigate();
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showCVModal, setShowCVModal] = useState(false);
    const [editingNotes, setEditingNotes] = useState({});
    const [tempNotes, setTempNotes] = useState({});
    const [tempStatus, setTempStatus] = useState({});
    const [hasChanges, setHasChanges] = useState({});
    const [activeTab, setActiveTab] = useState('cv');

    // jobs state'ini düzelttik
    const [jobs, setJobs] = useState([
        {
            id: 1,
            title: "Senior Frontend Developer",
            company: "Tech Corp",
            location: "İstanbul",
            publishedDate: "2024-02-01",
            applications: [
                {
                    id: 1,
                    applicant: "Ahmet Yılmaz",
                    applicationDate: "2024-02-15",
                    status: "pending",
                    cv: "cv_url_1",
                    notes: "",
                    email: "ahmet@email.com",
                    phone: "555-0001"
                },
                {
                    id: 2,
                    applicant: "Mehmet Demir",
                    applicationDate: "2024-02-16",
                    status: "interviewing",
                    cv: "cv_url_2",
                    notes: "İlk görüşme olumlu",
                    email: "mehmet@email.com",
                    phone: "555-0002"
                }
            ]
        },
        {
            id: 2,
            title: "Backend Developer",
            company: "Software Inc",
            location: "Ankara",
            publishedDate: "2024-02-02",
            applications: [
                {
                    id: 3,
                    applicant: "Ayşe Kara",
                    applicationDate: "2024-02-17",
                    status: "accepted",
                    cv: "cv_url_3",
                    notes: "Tüm görüşmeler tamamlandı",
                    email: "ayse@email.com",
                    phone: "555-0003"
                }
            ]
        }
    ]);

    const statusOptions = {
        pending: { text: "Beklemede", color: "#f1c40f" },
        interviewing: { text: "Görüşme Sürecinde", color: "#3498db" },
        accepted: { text: "Kabul Edildi", color: "#2ecc71" },
        rejected: { text: "Reddedildi", color: "#e74c3c" }
    };

    const handleStatusChange = (applicationId, newStatus) => {
        setTempStatus(prev => ({ ...prev, [applicationId]: newStatus }));
        setHasChanges(prev => ({ ...prev, [applicationId]: true }));
    };

    const handleEditNotes = (applicationId) => {
        setEditingNotes(prev => ({ ...prev, [applicationId]: true }));
        if (!tempNotes[applicationId]) {
            setTempNotes(prev => ({ 
                ...prev, 
                [applicationId]: jobs.find(job => job.applications.some(app => app.id === applicationId)).applications.find(app => app.id === applicationId).notes 
            }));
        }
        if (!tempStatus[applicationId]) {
            setTempStatus(prev => ({ 
                ...prev, 
                [applicationId]: jobs.find(job => job.applications.some(app => app.id === applicationId)).applications.find(app => app.id === applicationId).status 
            }));
        }
    };

    const handleNotesChange = (applicationId, newNotes) => {
        setTempNotes(prev => ({ ...prev, [applicationId]: newNotes }));
        setHasChanges(prev => ({ ...prev, [applicationId]: true }));
    };

    const handleSaveChanges = (applicationId) => {
        const currentJob = jobs.find(job => job.applications.some(app => app.id === applicationId));
        const updatedApplications = currentJob.applications.map(app => 
            app.id === applicationId 
                ? { 
                    ...app, 
                    notes: tempNotes[applicationId] || app.notes,
                    status: tempStatus[applicationId] || app.status
                }
                : app
        );
        
        setJobs(jobs.map(job => 
            job.id === currentJob.id 
                ? { ...job, applications: updatedApplications } 
                : job
        ));
        
        setEditingNotes(prev => ({ ...prev, [applicationId]: false }));
        setHasChanges(prev => ({ ...prev, [applicationId]: false }));
    };

    const handleCancelEdit = (applicationId) => {
        const job = jobs.find(job => job.applications.some(app => app.id === applicationId));
        const originalApp = job.applications.find(app => app.id === applicationId);
        setEditingNotes(prev => ({ ...prev, [applicationId]: false }));
        setTempNotes(prev => ({ ...prev, [applicationId]: originalApp.notes }));
        setTempStatus(prev => ({ ...prev, [applicationId]: originalApp.status }));
        setHasChanges(prev => ({ ...prev, [applicationId]: false }));
    };

    const handleViewCV = (application) => {
        setSelectedApplication(application);
        setShowCVModal(true);
    };

    // İlan listesi görünümü
    const renderJobsList = () => (
        <div className="jobs-list">
            {jobs.map(job => (
                <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                    <div className="job-header">
                        <h3>{job.title}</h3>
                        <span className="applications-count">
                            {job.applications.length} Başvuru
                        </span>
                    </div>
                    <div className="job-info">
                        <div className="info-item">
                            <span className="label">Şirket:</span>
                            <span>{job.company}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Lokasyon:</span>
                            <span>{job.location}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Yayın Tarihi:</span>
                            <span>{job.publishedDate}</span>
                        </div>
                    </div>
                    <div className="status-summary">
                        {Object.entries(statusOptions).map(([status, { text, color }]) => {
                            const count = job.applications.filter(app => app.status === status).length;
                            if (count > 0) {
                                return (
                                    <div key={status} className="status-badge" style={{ backgroundColor: color }}>
                                        {text}: {count}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            ))}
        </div>
    );

    // Başvuru listesi görünümü
    const renderApplicationsList = () => (
        <>
            <div className="header">
                <button className="back-button" onClick={() => setSelectedJob(null)}>
                    ← İlanlara Dön
                </button>
                <h2>{selectedJob.title} - Başvurular</h2>
            </div>
            <div className="applications-list">
                {selectedJob.applications.map(application => (
                    <div key={application.id} className="application-card">
                        <div className="application-header">
                            <h3>{application.applicant}</h3>
                            <div className="status-badge" style={{ backgroundColor: statusOptions[application.status].color }}>
                                {statusOptions[application.status].text}
                            </div>
                        </div>
                        <div className="application-info">
                            <div className="info-group">
                                <span className="label">E-posta:</span>
                                <span>{application.email}</span>
                            </div>
                            <div className="info-group">
                                <span className="label">Telefon:</span>
                                <span>{application.phone}</span>
                            </div>
                            <div className="info-group">
                                <span className="label">Başvuru Tarihi:</span>
                                <span>{application.applicationDate}</span>
                            </div>
                        </div>
                        <div className="application-actions">
                            <button 
                                className="view-details-button"
                                onClick={() => setSelectedApplication(application)}
                            >
                                Detayları Görüntüle
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    // Başvuru detay görünümü
    const renderApplicationDetail = () => (
        <>
            <div className="header">
                <button className="back-button" onClick={() => setSelectedApplication(null)}>
                    ← Başvurulara Dön
                </button>
                <h2>{selectedApplication.applicant} - Başvuru Detayı</h2>
            </div>
            
            <div className="application-detail-container">
                <div className="applicant-basic-info">
                    <div className="info-group">
                        <span className="label">E-posta:</span>
                        <span>{selectedApplication.email}</span>
                    </div>
                    <div className="info-group">
                        <span className="label">Telefon:</span>
                        <span>{selectedApplication.phone}</span>
                    </div>
                    <div className="info-group">
                        <span className="label">Başvuru Tarihi:</span>
                        <span>{selectedApplication.applicationDate}</span>
                    </div>
                </div>

                <div className="detail-content">
                    <div className="cv-section">
                        <h3>CV</h3>
                        <div className="cv-preview">
                            {/* Burada CV görüntüleyici komponenti kullanılacak */}
                            CV İçeriği
                        </div>
                    </div>

                    <div className="process-section">
                        <h3>Süreç Yönetimi</h3>
                        <div className="notes-section">
                            <div className="notes-header">
                                <span className="label">Notlar:</span>
                                {!editingNotes[selectedApplication.id] && (
                                    <button 
                                        className="edit-notes-button"
                                        onClick={() => handleEditNotes(selectedApplication.id)}
                                    >
                                        Düzenle
                                    </button>
                                )}
                            </div>
                            {editingNotes[selectedApplication.id] ? (
                                <textarea
                                    value={tempNotes[selectedApplication.id] || ''}
                                    onChange={(e) => handleNotesChange(selectedApplication.id, e.target.value)}
                                    placeholder="Not ekleyin..."
                                    className="notes-textarea"
                                    rows="3"
                                />
                            ) : (
                                <p>{selectedApplication.notes || 'Not eklenmemiş'}</p>
                            )}
                        </div>

                        <div className="status-section">
                            <span className="label">Başvuru Durumu:</span>
                            <select 
                                value={tempStatus[selectedApplication.id] || selectedApplication.status}
                                onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
                                className="status-select"
                                disabled={!editingNotes[selectedApplication.id]}
                            >
                                {Object.entries(statusOptions).map(([value, { text }]) => (
                                    <option key={value} value={value}>
                                        {text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {editingNotes[selectedApplication.id] && (
                            <div className="edit-actions">
                                <button 
                                    className="save-button"
                                    onClick={() => handleSaveChanges(selectedApplication.id)}
                                    disabled={!hasChanges[selectedApplication.id]}
                                >
                                    Değişiklikleri Kaydet
                                </button>
                                <button 
                                    className="cancel-button"
                                    onClick={() => handleCancelEdit(selectedApplication.id)}
                                >
                                    İptal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="application-management-container">
            <div className="header">
                {!selectedJob && (
                    <>
                        <button className="back-button" onClick={() => navigate('/homepage')}>
                            ← Ana Sayfa
                        </button>
                        <h1>İş İlanları ve Başvurular</h1>
                    </>
                )}
            </div>

            {!selectedJob && renderJobsList()}
            {selectedJob && !selectedApplication && renderApplicationsList()}
            {selectedApplication && renderApplicationDetail()}

            {/* CV Modal */}
            {showCVModal && selectedApplication && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{selectedApplication.applicant} - CV</h2>
                            <button className="close-button" onClick={() => setShowCVModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="cv-preview">
                                CV Önizleme
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationManagement; 