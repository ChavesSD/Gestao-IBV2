// Gerenciador de Configurações
class ConfiguracoesManager {
    constructor() {
        this.currentTab = 'gerais';
        this.usuarios = [];
        this.logs = [];
        this.editingUserId = null;
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupModals();
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupTabNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn') || e.target.closest('.tab-btn')) {
                const button = e.target.classList.contains('tab-btn') ? e.target : e.target.closest('.tab-btn');
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            }
        });
    }

    switchTab(tabId) {
        // Remover classe active de todas as abas
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        // Adicionar classe active na aba selecionada
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');

        this.currentTab = tabId;

        // Carregar dados específicos da aba
        if (tabId === 'usuarios') {
            this.loadUsuarios();
        } else if (tabId === 'logs') {
            this.loadLogs();
        }
    }

    setupModals() {
        // Modal Usuário
        const usuarioModal = document.getElementById('usuario-modal');
        const senhaModal = document.getElementById('senha-modal');

        // Fechar modais
        document.getElementById('close-usuario-modal').onclick = () => this.closeModal('usuario-modal');
        document.getElementById('close-senha-modal').onclick = () => this.closeModal('senha-modal');
        document.getElementById('cancelar-usuario').onclick = () => this.closeModal('usuario-modal');
        document.getElementById('cancelar-senha').onclick = () => this.closeModal('senha-modal');

        // Fechar modal clicando fora
        window.onclick = (e) => {
            if (e.target === usuarioModal) this.closeModal('usuario-modal');
            if (e.target === senhaModal) this.closeModal('senha-modal');
        };
    }

    setupEventListeners() {
        // Botão Salvar Configurações
        document.getElementById('salvar-config-btn').onclick = () => this.salvarConfiguracoes();
        
        // Botão Alterar Senha
        document.getElementById('alterar-senha-btn').onclick = () => this.showModal('senha-modal');
        
        // Botão Backup
        document.getElementById('backup-btn').onclick = () => this.gerarBackup();
        
        // Botão Novo Usuário
        document.getElementById('novo-usuario-btn').onclick = () => this.novoUsuario();
        
        // Formulário Usuário
        document.getElementById('usuario-form').onsubmit = (e) => this.salvarUsuario(e);
        
        // Formulário Senha
        document.getElementById('senha-form').onsubmit = (e) => this.alterarSenha(e);
        
        // Filtros de Logs
        document.getElementById('filtrar-logs-btn').onclick = () => this.filtrarLogs();

        // Auto-select permissões baseado no role
        document.getElementById('usuario-role').onchange = (e) => this.updatePermissions(e.target.value);
    }

    async loadInitialData() {
        // Carregar configurações da igreja
        try {
            const response = await fetch('https://gestao-ibv2-production.up.railway.app/api/configuracoes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const config = await response.json();
                if (config.data) {
                    document.getElementById('nome-igreja').value = config.data.nomeIgreja || '';
                    document.getElementById('endereco-igreja').value = config.data.endereco || '';
                    document.getElementById('telefone-igreja').value = config.data.telefone || '';
                    document.getElementById('email-igreja').value = config.data.email || '';
                }
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    async salvarConfiguracoes() {
        const config = {
            nomeIgreja: document.getElementById('nome-igreja').value,
            endereco: document.getElementById('endereco-igreja').value,
            telefone: document.getElementById('telefone-igreja').value,
            email: document.getElementById('email-igreja').value
        };

        try {
            const response = await fetch('https://gestao-ibv2-production.up.railway.app/api/configuracoes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                this.showNotification('Configurações salvas com sucesso!', 'success');
                this.logAction('update', 'Configurações da igreja atualizadas');
            } else {
                throw new Error('Erro ao salvar configurações');
            }
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações', 'error');
        }
    }

    async loadUsuarios() {
        const usuariosList = document.getElementById('usuarios-list');
        usuariosList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando usuários...</div>';

        try {
            const response = await fetch('https://gestao-ibv2-production.up.railway.app/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.usuarios = data.users || [];
                this.renderUsuarios();
            } else {
                throw new Error('Erro ao carregar usuários');
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            usuariosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar usuários</p>
                </div>
            `;
        }
    }

    renderUsuarios() {
        const usuariosList = document.getElementById('usuarios-list');
        
        if (this.usuarios.length === 0) {
            usuariosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Nenhum usuário encontrado</p>
                </div>
            `;
            return;
        }

        usuariosList.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Nível</th>
                        <th>Status</th>
                        <th>Último Login</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.usuarios.map(usuario => `
                        <tr>
                            <td>${usuario.name}</td>
                            <td>${usuario.email}</td>
                            <td><span class="role-badge ${usuario.role}">${this.getRoleLabel(usuario.role)}</span></td>
                            <td><span class="status ${usuario.status === 'ativo' ? 'active' : ''}">${usuario.status}</span></td>
                            <td>${usuario.lastLogin ? new Date(usuario.lastLogin).toLocaleString() : 'Nunca'}</td>
                            <td>
                                <button class="btn-icon" onclick="configuracoes.editarUsuario('${usuario._id}')" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="configuracoes.excluirUsuario('${usuario._id}')" title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    getRoleLabel(role) {
        const labels = {
            'admin': 'Administrador',
            'pastor': 'Pastor',
            'lider': 'Líder',
            'membro': 'Membro'
        };
        return labels[role] || role;
    }

    novoUsuario() {
        this.editingUserId = null;
        document.getElementById('modal-title').textContent = 'Novo Usuário';
        document.getElementById('usuario-form').reset();
        this.showModal('usuario-modal');
    }

    async editarUsuario(userId) {
        this.editingUserId = userId;
        const usuario = this.usuarios.find(u => u._id === userId);
        
        if (usuario) {
            document.getElementById('modal-title').textContent = 'Editar Usuário';
            document.getElementById('usuario-nome').value = usuario.name;
            document.getElementById('usuario-email').value = usuario.email;
            document.getElementById('usuario-telefone').value = usuario.phone || '';
            document.getElementById('usuario-role').value = usuario.role;
            
            // Remover campo senha no modo edição
            const senhaField = document.getElementById('usuario-senha').parentElement;
            senhaField.style.display = 'none';
            
            this.updatePermissions(usuario.role);
            this.showModal('usuario-modal');
        }
    }

    async excluirUsuario(userId) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                const response = await fetch(`https://gestao-ibv2-production.up.railway.app/api/auth/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    this.showNotification('Usuário excluído com sucesso!', 'success');
                    this.loadUsuarios();
                    this.logAction('delete', `Usuário excluído: ${userId}`);
                } else {
                    throw new Error('Erro ao excluir usuário');
                }
            } catch (error) {
                console.error('Erro ao excluir usuário:', error);
                this.showNotification('Erro ao excluir usuário', 'error');
            }
        }
    }

    async salvarUsuario(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('usuario-nome').value,
            email: document.getElementById('usuario-email').value,
            phone: document.getElementById('usuario-telefone').value,
            role: document.getElementById('usuario-role').value
        };

        // Adicionar senha apenas para novos usuários
        if (!this.editingUserId) {
            formData.password = document.getElementById('usuario-senha').value;
        }

        try {
            const url = this.editingUserId 
                ? `https://gestao-ibv2-production.up.railway.app/api/auth/users/${this.editingUserId}`
                : 'https://gestao-ibv2-production.up.railway.app/api/auth/register';
            
            const method = this.editingUserId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const action = this.editingUserId ? 'atualizado' : 'criado';
                this.showNotification(`Usuário ${action} com sucesso!`, 'success');
                this.closeModal('usuario-modal');
                this.loadUsuarios();
                this.logAction(this.editingUserId ? 'update' : 'create', `Usuário ${action}: ${formData.name}`);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao salvar usuário');
            }
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            this.showNotification(error.message, 'error');
        }
    }

    updatePermissions(role) {
        const permissions = {
            'admin': ['dashboard', 'eventos', 'membros', 'financeiro', 'patrimonio', 'relatorios', 'configuracoes'],
            'pastor': ['dashboard', 'eventos', 'membros', 'financeiro', 'relatorios'],
            'lider': ['dashboard', 'eventos', 'membros'],
            'membro': ['dashboard']
        };

        const checkboxes = document.querySelectorAll('input[name="permissions"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = permissions[role]?.includes(checkbox.value) || false;
        });
    }

    async loadLogs() {
        const logsList = document.getElementById('logs-list');
        logsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando logs...</div>';

        try {
            const response = await fetch('https://gestao-ibv2-production.up.railway.app/api/logs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.logs = data.logs || [];
                this.renderLogs();
            } else {
                throw new Error('Erro ao carregar logs');
            }
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
            logsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar logs</p>
                </div>
            `;
        }
    }

    renderLogs() {
        const logsList = document.getElementById('logs-list');
        
        if (this.logs.length === 0) {
            logsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>Nenhum log encontrado</p>
                </div>
            `;
            return;
        }

        logsList.innerHTML = this.logs.map(log => `
            <div class="log-item">
                <div class="log-icon ${log.type}">
                    <i class="fas ${this.getLogIcon(log.type)}"></i>
                </div>
                <div class="log-details">
                    <div class="log-action">${log.action}</div>
                    <div class="log-description">${log.description}</div>
                    <div class="log-time">${new Date(log.createdAt).toLocaleString()} - ${log.user?.name || 'Sistema'}</div>
                </div>
            </div>
        `).join('');
    }

    getLogIcon(type) {
        const icons = {
            'login': 'fa-sign-in-alt',
            'create': 'fa-plus',
            'update': 'fa-edit',
            'delete': 'fa-trash'
        };
        return icons[type] || 'fa-info';
    }

    async logAction(type, description) {
        try {
            await fetch('https://gestao-ibv2-production.up.railway.app/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type,
                    action: this.getActionLabel(type),
                    description
                })
            });
        } catch (error) {
            console.error('Erro ao registrar log:', error);
        }
    }

    getActionLabel(type) {
        const labels = {
            'login': 'Login realizado',
            'create': 'Item criado',
            'update': 'Item atualizado',
            'delete': 'Item excluído'
        };
        return labels[type] || 'Ação realizada';
    }

    async alterarSenha(e) {
        e.preventDefault();
        
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (novaSenha !== confirmarSenha) {
            this.showNotification('As senhas não coincidem', 'error');
            return;
        }

        try {
            const response = await fetch('https://gestao-ibv2-production.up.railway.app/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentPassword: senhaAtual,
                    newPassword: novaSenha
                })
            });

            if (response.ok) {
                this.showNotification('Senha alterada com sucesso!', 'success');
                this.closeModal('senha-modal');
                this.logAction('update', 'Senha alterada');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao alterar senha');
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async gerarBackup() {
        try {
            this.showNotification('Gerando backup...', 'info');
            
            const response = await fetch('https://gestao-ibv2-production.up.railway.app/api/configuracoes/backup', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup-ibv2-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showNotification('Backup gerado com sucesso!', 'success');
                this.logAction('create', 'Backup dos dados gerado');
            } else {
                throw new Error('Erro ao gerar backup');
            }
        } catch (error) {
            console.error('Erro ao gerar backup:', error);
            this.showNotification('Erro ao gerar backup', 'error');
        }
    }

    filtrarLogs() {
        const tipo = document.getElementById('filtro-tipo').value;
        const data = document.getElementById('filtro-data').value;
        
        // Implementar filtros (simulação por enquanto)
        this.loadLogs();
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        
        // Restaurar campo senha se necessário
        if (modalId === 'usuario-modal') {
            const senhaField = document.getElementById('usuario-senha').parentElement;
            senhaField.style.display = 'block';
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showNotification(message, type = 'info') {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// CSS para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 2000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        background: #27ae60;
    }
    
    .notification.error {
        background: #e74c3c;
    }
    
    .notification.info {
        background: #3498db;
    }
`;
document.head.appendChild(notificationStyles);

// Instanciar gerenciador quando a página de configurações for carregada
let configuracoes;
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que a página foi carregada
    setTimeout(() => {
        if (document.getElementById('gerais-tab')) {
            configuracoes = new ConfiguracoesManager();
        }
    }, 500);
});

// Também instanciar quando mudar para a página de configurações
document.addEventListener('click', (e) => {
    if (e.target.getAttribute('data-page') === 'configuracoes') {
        setTimeout(() => {
            if (document.getElementById('gerais-tab') && !configuracoes) {
                configuracoes = new ConfiguracoesManager();
            }
        }, 100);
    }
});