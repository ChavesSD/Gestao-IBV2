// Sistema de Autenticação
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Verificar se já está logado (sessão)
        this.checkStoredAuth();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Password toggle button
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('password');
        
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                this.togglePasswordVisibility(passwordInput, passwordToggle);
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validação básica
        if (!email || !password) {
            this.showError('Por favor, preencha todos os campos.');
            return;
        }

        try {
            // Simular autenticação (aqui você integrará com Firebase)
            const loginResult = await this.authenticateUser(email, password);
            
            if (loginResult.success) {
                this.setUser(loginResult.user);
                this.showMainApp();
                this.showSuccess('Login realizado com sucesso!');
            } else {
                this.showError(loginResult.message);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showError('Erro interno. Tente novamente.');
        }
    }

    async authenticateUser(email, password) {
        try {
            // Integração com Firebase Auth será implementada aqui
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            
            if (response.ok) {
                return {
                    success: true,
                    user: result.user
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Erro na autenticação'
                };
            }
        } catch (error) {
            console.error('Erro na autenticação:', error);
            return {
                success: false,
                message: 'Erro de conexão. Verifique sua internet.'
            };
        }
    }

    setUser(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Salvar na sessão
        localStorage.setItem('ibv2_user', JSON.stringify(user));
        localStorage.setItem('ibv2_auth', 'true');
        
        // Atualizar interface
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = user.name;
        }
    }

    checkStoredAuth() {
        const storedAuth = localStorage.getItem('ibv2_auth');
        const storedUser = localStorage.getItem('ibv2_user');
        
        if (storedAuth === 'true' && storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                this.isAuthenticated = true;
                this.showMainApp();
                
                // Atualizar interface
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    userNameElement.textContent = this.currentUser.name;
                }
            } catch (error) {
                console.error('Erro ao carregar sessão:', error);
                this.clearAuth();
            }
        }
    }

    handleLogout() {
        this.clearAuth();
        this.showLoginScreen();
        this.showSuccess('Logout realizado com sucesso!');
    }

    clearAuth() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('ibv2_user');
        localStorage.removeItem('ibv2_auth');
    }

    showMainApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    showLoginScreen() {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        
        // Limpar campos de login
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Criar notificação toast
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;

        // Adicionar estilos se não existirem
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    min-width: 300px;
                    animation: slideIn 0.3s ease;
                }
                .notification.success {
                    border-left: 4px solid #27ae60;
                    color: #27ae60;
                }
                .notification.error {
                    border-left: 4px solid #e74c3c;
                    color: #e74c3c;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Verificar se está autenticado
    requireAuth() {
        if (!this.isAuthenticated) {
            this.showLoginScreen();
            return false;
        }
        return true;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Toggle de visibilidade da senha
    togglePasswordVisibility(passwordInput, toggleButton) {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alterar ícone
        const icon = toggleButton.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Inicializar sistema de autenticação
window.authSystem = new AuthSystem();