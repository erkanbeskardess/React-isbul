import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Applications.css';

const Applications = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8080/hr/applications/status/${code}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Başvuru bulunamadı');
            }

            const data = await response.json();
            
            // Backend'den gelen veriyi uygulama formatına dönüştür
            const formattedApplication = {
                id: data.id,
                company: data.jobPosting.company,
                position: data.jobPosting.title,
                applicationDate: new Date(data.applicationDate).toLocaleDateString(),
                status: getStatusText(data.applicationStatusType),
                stages: [
                    { 
                        name: "Başvuru Alındı", 
                        completed: true 
                    },
                    { 
                        name: "İK Değerlendirmesi", 
                        date: data.hrReviewDate ? new Date(data.hrReviewDate).toLocaleDateString() : null, 
                        completed: data.applicationStatusType !== 'PENDING'
                    },
                    { 
                        name: "Son Görüşme", 
                        date: data.finalInterviewDate ? new Date(data.finalInterviewDate).toLocaleDateString() : null, 
                        completed: data.applicationStatusType === 'ACCEPTED'
                    }
                ]
            };

            setApplication(formattedApplication);
            setError('');
        } catch (error) {
            console.error('Başvuru sorgulama hatası:', error);
            setError('Geçersiz başvuru kodu veya başvuru bulunamadı');
            setApplication(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Değerlendirmede';
            case 'ACCEPTED': return 'Kabul Edildi';
            case 'REJECTED': return 'Reddedildi';

        }
    };

    return (
        <div className="applications-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate('/homepage')}>
                    ← Ana Sayfa
                </button>
                <h1>Başvuru Takip</h1>
            </div>

            <div className="code-checker">
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Başvuru kodunu giriniz"
                            maxLength="6"
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !code}>
                            {loading ? 'Sorgulanıyor...' : 'Sorgula'}
                        </button>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                </form>
            </div>

            {application && (
                <div className="application-details">
                    <div className="application-header">
                        <h2>{application.position}</h2>
                        <span className="company-name">{application.company}</span>
                        <span className="application-id">Başvuru No: {application.id}</span>
                    </div>

                    <div className="status-section">
                        <h3>Başvuru Durumu: <span className="status">{application.status}</span></h3>
                        <div className="progress-timeline">
                            {application.stages.map((stage, index) => (
                                <div 
                                    key={index} 
                                    className={`stage ${stage.completed ? 'completed' : ''}`}
                                >
                                    <div className="stage-dot"></div>
                                    <div className="stage-info">
                                        <span className="stage-name">{stage.name}</span>
                                        {stage.date && <span className="stage-date">{stage.date}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applications; 