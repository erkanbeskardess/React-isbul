import React, { useState } from 'react';
import './LoginSignup.css';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../utils/roles.js';

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
  
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userNames', data.firstName+data.lastName);

            if (data.role === ROLES.ADMIN) {
                navigate('/admin');
            } else if (data.role === ROLES.HR) {
                navigate('/homepage');
            } else if (data.role === ROLES.APPLICANT) {
                navigate('/homepage');
            }

        } catch (error) {
            console.error('Login error:', error);
            alert('Giriş yapılırken bir hata oluştu');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

        // Backend'e gönderilecek DTO
        const registerDTO = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
        };

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerDTO)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Kayıt başarısız');
            }

            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            setIsLogin(true);
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert('Kayıt olurken bir hata oluştu');
        }
    };

    return (
        <div className="screen">
            <form className="login" onSubmit={isLogin ? handleLogin : handleRegister}>
                <div className="form-mode-switch">
                    <button 
                        type="button"
                        className={`mode-switch-button ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Giriş Yap
                    </button>
                    <button 
                        type="button"
                        className={`mode-switch-button ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <div className="login__field">
                    <input
                        type="email"
                        name="email"
                        className="login__input" 
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="login__field">
                    <input
                        type="password"
                        name="password"
                        className="login__input" 
                        placeholder="Şifre"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {!isLogin && (
                    <>
                        <div className="login__field">
                            <input
                                type="password"
                                name="confirmPassword"
                                className="login__input" 
                                placeholder="Şifre Tekrar"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__field">
                            <input
                                type="text"
                                name="firstName"
                                className="login__input" 
                                placeholder="Ad"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__field">
                            <input
                                type="text"
                                name="lastName"
                                className="login__input" 
                                placeholder="Soyad"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__field">
                            <input
                                type="tel"
                                name="phone"
                                className="login__input" 
                                placeholder="Telefon"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </>
                )}
                <button 
                    className={`button ${isLogin ? 'login__submit' : 'register__submit'}`}
                >
                    <span className="button__text">
                        {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                    </span>
                </button>
            </form>
        </div>
    );
}

export default LoginSignup; 