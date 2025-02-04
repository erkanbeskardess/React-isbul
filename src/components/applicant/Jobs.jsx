import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Jobs.css';


const Jobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedCVId, setSelectedCVId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [applicationCode, setApplicationCode] = useState('');
    const [expandedJobId, setExpandedJobId] = useState(null);
    const [userCVs, setUserCVs] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchJobs();
        fetchUserCVs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://localhost:8080/hr/job-postings/jobs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('İlanlar yüklenirken hata oluştu');
            }

            const data = await response.json();
    
            
            setJobs(data);

        } catch (error) {
            console.error('İlanlar yüklenirken hata:', error);
            alert('İlanlar yüklenirken bir hata oluştu');
        }
    };

    const fetchUserCVs = async () => {
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
            setUserCVs(data);
        } catch (error) {
            console.error('CV\'ler yüklenirken hata:', error);
            alert('CV\'ler yüklenirken bir hata oluştu');
        }
    };

    const handleJobClick = (jobId) => {
        setExpandedJobId(expandedJobId === jobId ? null : jobId);
    };

    const handleApply = async () => {
        if (!selectedCVId) {
            alert('Lütfen bir CV seçin');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
           
            const applicationData = {
                jobPosting: selectedJob,
                userId: userId,
                applicationStatusType: "PENDING",
                cvId: selectedCVId
            };

            const response = await fetch('http://localhost:8080/hr/applications', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(applicationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Başvuru başarısız');
            }

            const result = await response.json();
            console.log("Application Code:", result); // Gelen veriyi kontrol edelim
            
            // String'e çevirip setApplicationCode'a gönderelim
            const codeString = result.toString();
            setApplicationCode(codeString);
            
            setShowApplyModal(false);
            setShowSuccessModal(true);
            setSelectedCVId(null);

        } catch (error) {
            console.error('Başvuru hatası:', error);
            alert(error.message || 'Başvuru yapılırken bir hata oluştu');
        }
    };

    return (
        <div className="jobs-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate('/homepage')}>
                    ← Ana Sayfa
                </button>
                <h1>İş İlanları ({jobs.length})</h1>
            </div>

            <div className="jobs-list">
                {jobs && jobs.length > 0 ? (
                    jobs.map(job => (
                        <div key={job.id} className="job-card">
                            <div className="job-header" onClick={() => handleJobClick(job.id)}>
                                <div className="job-title">
                                    <h3>{job.title}</h3>
                                    <span className="company-name">{job.company}</span>
                                </div>
                                <div className="job-meta">
                                    <span className="location">
                                        <i className="fas fa-map-marker-alt"></i> {job.location}
                                    </span>
                                    <span className="date">
                                        <i className="far fa-calendar-alt"></i> {job.publishDate ? new Date(job.publishDate).toLocaleDateString() : 'Tarih belirtilmemiş'}
                                    </span>
                                </div>
                            </div>

                            {expandedJobId === job.id && (
                                <div className="job-details">
                                    <div className="details-grid">
                                        {/* Sol taraf - İş tanımı */}
                                        <div className="detail-section description-section">
                                            <h4><i className="fas fa-info-circle"></i> İş Tanımı</h4>
                                            <p>{job.description}</p>
                                        </div>

                                        {/* Sağ taraf - Bilgi kutuları */}
                                        <div className="info-section">
                                            <div className="info-item">
                                                <i className="fas fa-building"></i>
                                                <div className="info-content">
                                                    <span>{job.company}</span>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <i className="fas fa-map-marker-alt"></i>
                                                <div className="info-content">
                                                    <span>{job.location}</span>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <i className="far fa-calendar-times"></i>
                                                <div className="info-content">
                                                    <span>{job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Belirtilmemiş'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="fixed-apply-button">
                                        <button 
                                            className="apply-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedJob(job);
                                                setShowApplyModal(true);
                                            }}
                                        >
                                            <i className="fas fa-paper-plane"></i>
                                            Hemen Başvur
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-jobs-message">
                        <i className="fas fa-briefcase"></i>
                        <p>Henüz ilan bulunmamaktadır.</p>
                    </div>
                )}
            </div>

            {showApplyModal && (
                <div className="modal-overlay">
                    <div className="modal apply-modal">
                        <div className="modal-header">
                            <h2>Başvuru Yap</h2>
                            <button className="close-button" onClick={() => setShowApplyModal(false)}>×</button>
                        </div>
                        <div className="modal-content">                           
                        
                            <div className="cv-selection-section">
                                <h4>CV Seçin</h4>
                                <div className="cv-dropdown">
                                    <div 
                                        className="cv-dropdown-header"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        {selectedCVId ? (
                                            userCVs.find(cv => cv.id === selectedCVId)?.fileName || 'CV Seçin'
                                        ) : (
                                            'CV Seçin'
                                        )}
                                        <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}></i>
                                    </div>
                                    
                                    {isDropdownOpen && (
                                        <div className="cv-dropdown-content">
                                            {userCVs.map(cv => (
                                                <div 
                                                    key={cv.id}
                                                    className={`cv-dropdown-item ${selectedCVId === cv.id ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedCVId(cv.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    <div className="cv-info">
                                                        <i className="fas fa-file-pdf"></i>
                                                        <div className="cv-details">
                                                            <span className="cv-name">{cv.fileName}</span>
                                                            <span className="cv-meta">
                                                                {cv.fileType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedCVId === cv.id && (
                                                        <i className="fas fa-check"></i>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    className="cancel-button"
                                    onClick={() => setShowApplyModal(false)}
                                >
                                    İptal
                                </button>
                                <button 
                                    className="submit-button"
                                    onClick={handleApply}
                                    disabled={!selectedCVId}
                                >
                                    Başvuruyu Tamamla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal success-modal">
                        <div className="modal-header">
                            <h2>{applicationCode.length === 7 ? 'Mevcut Başvuru' : 'Başvurunuz Alındı!'}</h2>
                            <button className="close-button" onClick={() => setShowSuccessModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="success-message">
                                {applicationCode.length === 7 ? (
                                    <>
                                        <div className="info-icon">
                                            <i className="fas fa-info-circle"></i>
                                        </div>
                                        <p>Başvurunuz sistemde mevcut, başvuru kontrolü sayfasında kodunuz ile süreci takip edebilirsiniz.</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="success-icon">
                                            <i className="fas fa-check-circle"></i>
                                        </div>
                                        <p>Başvurunuz başarıyla tamamlandı.</p>
                                    </>
                                )}
                                <div className="application-code-section">
                                    <h3>Başvuru Takip Kodunuz:</h3>
                                    <div className="code-display">
                                        {applicationCode.substring(0, 6)}
                                    </div>
                                    <div className="code-info">
                                        <i className="fas fa-info-circle"></i>
                                        <p>Bu kodu kullanarak "Başvurularım" sayfasından başvurunuzun durumunu takip edebilirsiniz.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    className="submit-button"
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        navigate('/applications');
                                    }}
                                >
                                    Tamam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;