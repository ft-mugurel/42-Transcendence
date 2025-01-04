const appDiv = document.getElementById('app');
const API_BASE = '/api/users';

// Çerezden CSRF token'ı alma
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Sayfa Yükleme
function loadPage(page) {
    console.log('Loading page:', page);
    fetch(page)
        .then(response => response.text())
        .then(html => {
            appDiv.innerHTML = html;
            attachFormHandlers();
        })
        .catch(err => console.warn('Failed to load page', err));
}

// Profil Yükleme
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 401) {
            console.log('Access token expired, trying to refresh...');
            await refreshToken();
            const retryResponse = await fetch(`${API_BASE}/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!retryResponse.ok) {
                throw new Error('Profile yüklenemedi.');
            }
            const data = await retryResponse.json();
            document.getElementById('username').textContent = data.username;
            document.getElementById('email').textContent = data.email;
        } else if (!response.ok) {
            throw new Error('Profil yüklenemedi');
        } else {
            const data = await response.json();
            document.getElementById('username').textContent = data.username;
            document.getElementById('email').textContent = data.email;
        }
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        alert('Profil yüklenirken hata oluştu.');
    }
}

// Form İşlemleri
function attachFormHandlers() {
    // Login ve Register Yönlendirme
    document.getElementById('go-to-login')?.addEventListener('click', () => loadPage('frontend_static/login.html'));
    document.getElementById('go-to-register')?.addEventListener('click', () => loadPage('frontend_static/register.html'));

    // Logout
    document.getElementById('logout-button')?.addEventListener('click', () => {
        localStorage.removeItem('access');
        alert('Logged out successfully');
        loadPage('frontend_static/login.html');
    });

    // Profil Yükleme
    document.getElementById('profile-button')?.addEventListener('click', () => {
        loadPage('frontend_static/profile.html');
        loadUserProfile();
    });

    // Kayıt Formu
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target['register-username'].value;
            const email = e.target['register-email'].value;
            const password = e.target['register-password'].value;
            const csrfToken = getCookie('csrftoken');

            const response = await fetch(`${API_BASE}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                alert('Registration successful');
                loadPage('frontend_static/login.html');
            } else {
                const data = await response.json();
                alert(data.error || 'Registration failed');
            }
        });
    }

    // Login Formu (Eksik Olan Kısım)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const csrfToken = getCookie('csrftoken');

            const response = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access', data.access);
                alert('Login successful');
                console.log(localStorage.getItem('access'));
                loadPage('frontend_static/home.html');
            } else {
                const error = await response.json();
                alert(error.error || 'Login failed');
            }
        });
    }
}

// CSRF Token Al
async function fetchCSRFToken() {
    const response = await fetch(`${API_BASE}/get-csrf-token/`, {
        method: 'GET',
        credentials: 'include',
    });

    if (response.ok) {
        const data = await response.json();
        console.log('CSRF Token:', data.csrfToken);
    } else {
        console.error('CSRF token isteği başarısız!');
    }
}
fetchCSRFToken()

// Token Yenileme
async function refreshToken() {
    const response = await fetch(`${API_BASE}/refresh/`, {
        method: 'POST',
        credentials: 'include'
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access', data.access);
    } else {
        console.error('Refresh token failed');
        localStorage.removeItem('access');
        loadPage('frontend_static/login.html');
    }
}

// Her 14 dakikada token yenileme
setInterval(refreshToken, 14 * 60 * 1000);

// Sayfa Yükleme Kontrolü (Oturum)
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access');
    if (!token) {
        loadPage('frontend_static/login.html');
    } else {
        loadPage('frontend_static/home.html');
    }
});
