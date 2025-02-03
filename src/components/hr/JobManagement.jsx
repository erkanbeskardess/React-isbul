import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobManagement.css';

const JobManagement = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        publishedDate: '',
        company: '',
        location: '',
        createdBy: 'firstName+lastName'
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://localhost:8080/hr/job-postings/jobs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('İlanlar yüklenirken hata:', error);
            alert('İlanlar yüklenirken bir hata oluştu');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJob(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const currentDate = new Date().toISOString();

            const jobDTO = {
                ...newJob,
                startDate: new Date(newJob.startDate).toISOString(),
                endDate: new Date(newJob.endDate).toISOString(),
                publishedDate: currentDate,
                createdBy: localStorage.getItem('userNames')
            };

            const response = await fetch('http://localhost:8080/hr/job-postings/create-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(jobDTO)
            });

            if (!response.ok) {
                throw new Error('İlan oluşturma başarısız');
            }

            const createdJob = await response.json();
            setJobs([...jobs, createdJob]);
            setShowModal(false);
            setNewJob({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                publishedDate: '',
                company: '',
                location: '',
                createdBy: localStorage.getItem('firstName')
            });
            alert('İlan başarıyla oluşturuldu');
        } catch (error) {
            console.error('İlan oluşturma hatası:', error);
            alert('İlan oluşturulurken bir hata oluştu');
        }
    };

    const handleJobClick = (job) => {
        setSelectedJob(job);
        setShowDetailModal(true);
    };

    const handleEditClick = () => {
        setNewJob({
            title: selectedJob.title,
            description: selectedJob.description,
            startDate: selectedJob.startDate.split('T')[0],
            endDate: selectedJob.endDate.split('T')[0],
            company: selectedJob.company,
            location: selectedJob.location,
            createdBy: selectedJob.createdBy
        });
        setIsEditing(true);
        setShowDetailModal(false);
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const jobDTO = {
                ...newJob,
                startDate: new Date(newJob.startDate).toISOString(),
                endDate: new Date(newJob.endDate).toISOString(),
                publishedDate: selectedJob.publishedDate,
                id: selectedJob.id
            };

            const response = await fetch(`http://localhost:8080/hr/job-postings/update-job/${selectedJob.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(jobDTO)
            });

            if (!response.ok) {
                throw new Error('İlan güncelleme başarısız');
            }

            const updatedJob = await response.json();
            setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
            setShowModal(false);
            setIsEditing(false);
            alert('İlan başarıyla güncellendi');
        } catch (error) {
            console.error('İlan güncelleme hatası:', error);
            alert('İlan güncellenirken bir hata oluştu');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setNewJob({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            publishedDate: '',
            company: '',
            location: '',
            createdBy: localStorage.getItem('firstName')
        });
    };

    const handleDelete = async () => {
        if (window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
            try {
                const response = await fetch(`http://localhost:8080/hr/job-postings/delete/${selectedJob.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('İlan silme başarısız');
                }

                setJobs(jobs.filter(job => job.id !== selectedJob.id));
                setShowDetailModal(false);
                alert('İlan başarıyla silindi');
            } catch (error) {
                console.error('İlan silme hatası:', error);
                alert('İlan silinirken bir hata oluştu');
            }
        }
    };

    return (
        <div className="job-management-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate('/homepage')}>
                    ← Ana Sayfa
                </button>
                <h1>İlan Yönetimi</h1>
                <button className="add-job-button" onClick={() => setShowModal(true)}>
                    + Yeni İlan
                </button>
            </div>

            <div className="jobs-list">
                {jobs.map(job => (
                    <div key={job.id} className="job-card" onClick={() => handleJobClick(job)}>
                        <div className="job-header">
                            <h3>{job.title}</h3>
                        </div>
                        <div className="job-info">
                            <p><i className="fas fa-building"></i> {job.company}</p>
                            <p><i className="fas fa-map-marker-alt"></i> {job.location}</p>
                            <p><i className="fas fa-calendar-alt"></i> {new Date(job.startDate).toLocaleDateString()} - {new Date(job.endDate).toLocaleDateString()}</p>
                            <p><i className="fas fa-clock"></i> Yayın Tarihi: {new Date(job.publishedDate).toLocaleDateString()}</p>
                            <p><i className="fas fa-user"></i> İlanı Oluşturan: {job.createdBy}</p>
                        </div>
                        <div className="job-description-preview">
                            {job.description.substring(0, 150)}...
                        </div>
                    </div>
                ))}
            </div>

            {showDetailModal && selectedJob && (
                <div className="modal-overlay">
                    <div className="modal detail-modal">
                        <div className="modal-header">
                            <h2>{selectedJob.title}</h2>
                            <button className="close-button" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="job-detail-content">
                            <div className="detail-section">
                                <h3>Şirket Bilgileri</h3>
                                <p><i className="fas fa-building"></i> <strong>Şirket:</strong> {selectedJob.company}</p>
                                <p><i className="fas fa-map-marker-alt"></i> <strong>Lokasyon:</strong> {selectedJob.location}</p>
                            </div>

                            <div className="detail-section">
                                <h3>İlan Bilgileri</h3>
                                <p><i className="fas fa-calendar-alt"></i> <strong>Başlangıç Tarihi:</strong> {new Date(selectedJob.startDate).toLocaleDateString()}</p>
                                <p><i className="fas fa-calendar-alt"></i> <strong>Bitiş Tarihi:</strong> {new Date(selectedJob.endDate).toLocaleDateString()}</p>
                                <p><i className="fas fa-clock"></i> <strong>Yayın Tarihi:</strong> {new Date(selectedJob.publishedDate).toLocaleDateString()}</p>
                                <p><i className="fas fa-user"></i> <strong>İlanı Oluşturan:</strong> {selectedJob.createdBy}</p>
                            </div>

                            <div className="detail-section">
                                <h3>İş Tanımı</h3>
                                <div className="job-description-full">
                                    {selectedJob.description}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Başvurular</h3>
                                <div className="applications-list">
                                    {selectedJob.applications && selectedJob.applications.length > 0 ? (
                                        selectedJob.applications.map(application => (
                                            <div key={application.id} className="application-item">
                                                <p><strong>Başvuran:</strong> {application.applicantName}</p>
                                                <p><strong>Başvuru Tarihi:</strong> {new Date(application.applicationDate).toLocaleDateString()}</p>
                                                <p><strong>Durum:</strong> {application.status}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Henüz başvuru bulunmamaktadır.</p>
                                    )}
                                </div>
                            </div>

                            <div className="detail-actions">
                                <button className="edit-button" onClick={handleEditClick}>
                                    <i className="fas fa-edit"></i> Düzenle
                                </button>
                                <button className="delete-button" onClick={handleDelete}>
                                    <i className="fas fa-trash"></i> Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{isEditing ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}</h2>
                            <button className="close-button" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={isEditing ? handleUpdate : handleSubmit} className="job-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>İlan Başlığı</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newJob.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Örn: Senior Frontend Developer"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Şirket</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={newJob.company}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Şirket Adı"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={newJob.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={newJob.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Lokasyon</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={newJob.location}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Örn: İstanbul, Türkiye"
                                />
                            </div>

                            <div className="form-group">
                                <label>İş Tanımı</label>
                                <textarea
                                    name="description"
                                    value={newJob.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="İş pozisyonunun detaylı açıklaması..."
                                    rows="4"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                                    İptal
                                </button>
                                <button type="submit" className="submit-button">
                                    {isEditing ? 'Güncelle' : 'İlanı Yayınla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobManagement; 