// Sistema Principal SPA
class IBV2App {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {
            dashboard: 'Dashboard',
            eventos: 'Eventos',
            membros: 'Membros',
            financeiro: 'Financeiro',
            patrimonio: 'Patrimônio',
            relatorios: 'Relatórios',
            configuracoes: 'Configurações'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPage('dashboard');
    }

    setupEventListeners() {
        // Menu lateral
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // Toggle sidebar em mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar);
        }

        // Fechar sidebar ao clicar fora em mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const toggle = document.querySelector('.sidebar-toggle');
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !toggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    navigateTo(pageName) {
        if (!this.pages[pageName]) {
            console.error(`Página '${pageName}' não encontrada`);
            return;
        }

        // Atualizar menu ativo
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Atualizar título da página
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = this.pages[pageName];
        }

        // Carregar conteúdo da página
        this.currentPage = pageName;
        this.loadPage(pageName);

        // Fechar sidebar em mobile
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    }

    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('active');
    }

    async loadPage(pageName) {
        const container = document.getElementById('page-container');
        if (!container) return;

        // Mostrar loading
        container.innerHTML = '<div class="loading">Carregando...</div>';

        try {
            const content = await this.getPageContent(pageName);
            container.innerHTML = content;
            this.initializePageScripts(pageName);
        } catch (error) {
            console.error(`Erro ao carregar página ${pageName}:`, error);
            container.innerHTML = `
                <div class="error-page">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Erro ao carregar página</h2>
                    <p>Não foi possível carregar a página solicitada.</p>
                    <button class="btn btn-primary" onclick="app.loadPage('${pageName}')">
                        <i class="fas fa-refresh"></i>
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }

    async getPageContent(pageName) {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 300));

        switch (pageName) {
            case 'dashboard':
                return this.getDashboardContent();
            case 'eventos':
                return this.getEventosContent();
            case 'membros':
                return this.getMembrosContent();
            case 'financeiro':
                return this.getFinanceiroContent();
            case 'patrimonio':
                return this.getPatrimonioContent();
            case 'relatorios':
                return this.getRelatoriosContent();
            case 'configuracoes':
                return this.getConfiguracoesContent();
            default:
                return '<div class="error">Página não encontrada</div>';
        }
    }

    getDashboardContent() {
        return `
            <div class="dashboard">
                <div class="welcome-section">
                    <h2>Bem-vindo ao Sistema IBV2</h2>
                    <p>Gerencie sua igreja de forma eficiente e organizada</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-membros">-</h3>
                            <p>Membros Ativos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-eventos">-</h3>
                            <p>Eventos este Mês</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-arrecadacao">-</h3>
                            <p>Arrecadação Mensal</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-patrimonio">-</h3>
                            <p>Itens Patrimônio</p>
                        </div>
                    </div>
                </div>
                
                <div class="recent-activities">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Atividades Recentes</h3>
                            <button class="btn btn-secondary">
                                <i class="fas fa-refresh"></i>
                                Atualizar
                            </button>
                        </div>
                        <div class="activities-list" id="activities-list">
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p>Nenhuma atividade recente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getEventosContent() {
        return `
            <div class="eventos-page">
                <div class="page-header">
                    <h2>Gerenciamento de Eventos</h2>
                    <button class="btn btn-primary" id="novo-evento-btn">
                        <i class="fas fa-plus"></i>
                        Novo Evento
                    </button>
                </div>
                
                <div class="eventos-grid" id="eventos-grid">
                    <div class="empty-state">
                        <i class="fas fa-calendar-plus"></i>
                        <h3>Nenhum evento cadastrado</h3>
                        <p>Comece criando seu primeiro evento</p>
                        <button class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Criar Evento
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getMembrosContent() {
        return `
            <div class="membros-page">
                <div class="page-header">
                    <h2>Cadastro de Membros</h2>
                    <button class="btn btn-primary" id="novo-membro-btn">
                        <i class="fas fa-user-plus"></i>
                        Novo Membro
                    </button>
                </div>
                
                <div class="search-section">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="buscar-membros" placeholder="Buscar membros...">
                    </div>
                    <button class="btn btn-secondary" id="filtros-btn">
                        <i class="fas fa-filter"></i>
                        Filtros
                    </button>
                </div>
                
                <div class="membros-container" id="membros-container">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>Nenhum membro cadastrado</h3>
                        <p>Comece adicionando o primeiro membro da igreja</p>
                        <button class="btn btn-primary">
                            <i class="fas fa-user-plus"></i>
                            Adicionar Membro
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getFinanceiroContent() {
        return `
            <div class="financeiro-page">
                <div class="page-header">
                    <h2>Controle Financeiro</h2>
                    <button class="btn btn-primary" id="nova-transacao-btn">
                        <i class="fas fa-plus"></i>
                        Nova Transação
                    </button>
                </div>
                
                <div class="financial-cards">
                    <div class="card">
                        <div class="card-header">
                            <h3>Receitas do Mês</h3>
                            <i class="fas fa-arrow-up" style="color: #27ae60;"></i>
                        </div>
                        <div class="amount positive" id="receitas-mes">R$ 0,00</div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3>Despesas do Mês</h3>
                            <i class="fas fa-arrow-down" style="color: #e74c3c;"></i>
                        </div>
                        <div class="amount negative" id="despesas-mes">R$ 0,00</div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3>Saldo Atual</h3>
                            <i class="fas fa-wallet" style="color: #901A1D;"></i>
                        </div>
                        <div class="amount" id="saldo-atual">R$ 0,00</div>
                    </div>
                </div>
                
                <div class="transactions-section">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Últimas Transações</h3>
                            <button class="btn btn-secondary">
                                <i class="fas fa-refresh"></i>
                                Atualizar
                            </button>
                        </div>
                        <div class="transactions-list" id="transactions-list">
                            <div class="empty-state">
                                <i class="fas fa-receipt"></i>
                                <p>Nenhuma transação registrada</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getPatrimonioContent() {
        return `
            <div class="patrimonio-page">
                <div class="page-header">
                    <h2>Controle de Patrimônio</h2>
                    <button class="btn btn-primary" id="novo-item-btn">
                        <i class="fas fa-plus"></i>
                        Novo Item
                    </button>
                </div>
                
                <div class="patrimonio-grid" id="patrimonio-grid">
                    <div class="empty-state">
                        <i class="fas fa-archive"></i>
                        <h3>Nenhum item cadastrado</h3>
                        <p>Comece adicionando itens ao patrimônio da igreja</p>
                        <button class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Adicionar Item
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getRelatoriosContent() {
        return `
            <div class="relatorios-page">
                <div class="page-header">
                    <h2>Relatórios e Estatísticas</h2>
                    <div class="report-filters">
                        <select class="form-control" id="periodo-select">
                            <option value="mes">Este Mês</option>
                            <option value="trimestre">Último Trimestre</option>
                            <option value="ano">Este Ano</option>
                        </select>
                        <button class="btn btn-primary" id="exportar-btn">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                    </div>
                </div>
                
                <div class="reports-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3>Relatórios Disponíveis</h3>
                        </div>
                        <div class="reports-list">
                            <div class="report-item">
                                <i class="fas fa-users"></i>
                                <span>Relatório de Membros</span>
                                <button class="btn btn-secondary" data-report="membros">Gerar</button>
                            </div>
                            
                            <div class="report-item">
                                <i class="fas fa-chart-bar"></i>
                                <span>Relatório Financeiro</span>
                                <button class="btn btn-secondary" data-report="financeiro">Gerar</button>
                            </div>
                            
                            <div class="report-item">
                                <i class="fas fa-calendar"></i>
                                <span>Relatório de Eventos</span>
                                <button class="btn btn-secondary" data-report="eventos">Gerar</button>
                            </div>
                            
                            <div class="report-item">
                                <i class="fas fa-building"></i>
                                <span>Relatório de Patrimônio</span>
                                <button class="btn btn-secondary" data-report="patrimonio">Gerar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getConfiguracoesContent() {
        return `
            <div class="configuracoes-page">
                <div class="page-header">
                    <h2>Configurações do Sistema</h2>
                </div>
                
                <!-- Navegação das Abas -->
                <div class="tabs-navigation">
                    <button class="tab-btn active" data-tab="gerais">
                        <i class="fas fa-cog"></i>
                        Configurações Gerais
                    </button>
                    <button class="tab-btn" data-tab="usuarios">
                        <i class="fas fa-users"></i>
                        Usuários
                    </button>
                    <button class="tab-btn" data-tab="logs">
                        <i class="fas fa-history"></i>
                        Logs do Sistema
                    </button>
                </div>

                <!-- Conteúdo das Abas -->
                <div class="tab-content">
                    <!-- Aba Configurações Gerais -->
                    <div id="gerais-tab" class="tab-panel active">
                        <div class="settings-sections">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Informações da Igreja</h3>
                                </div>
                                <div class="settings-form" id="settings-form">
                                    <div class="form-group">
                                        <label>Nome da Igreja</label>
                                        <input type="text" id="nome-igreja" placeholder="Nome da igreja" class="form-control" value="Igreja Batista Vida 2">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Endereço</label>
                                        <input type="text" id="endereco-igreja" placeholder="Endereço da igreja" class="form-control">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Telefone</label>
                                        <input type="text" id="telefone-igreja" placeholder="(11) 99999-9999" class="form-control">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>E-mail</label>
                                        <input type="email" id="email-igreja" placeholder="contato@igreja.com" class="form-control">
                                    </div>
                                </div>
                                
                                <button class="btn btn-primary" id="salvar-config-btn">
                                    <i class="fas fa-save"></i>
                                    Salvar Alterações
                                </button>
                            </div>
                            
                            <div class="card">
                                <div class="card-header">
                                    <h3>Segurança</h3>
                                </div>
                                <div class="settings-form">
                                    <button class="btn btn-secondary" id="alterar-senha-btn">
                                        <i class="fas fa-key"></i>
                                        Alterar Minha Senha
                                    </button>
                                    
                                    <button class="btn btn-warning" id="backup-btn">
                                        <i class="fas fa-download"></i>
                                        Fazer Backup dos Dados
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Aba Usuários -->
                    <div id="usuarios-tab" class="tab-panel">
                        <div class="usuarios-section">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Gerenciar Usuários</h3>
                                    <button class="btn btn-primary" id="novo-usuario-btn">
                                        <i class="fas fa-plus"></i>
                                        Novo Usuário
                                    </button>
                                </div>
                                
                                <div class="usuarios-list" id="usuarios-list">
                                    <div class="loading">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        Carregando usuários...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Aba Logs -->
                    <div id="logs-tab" class="tab-panel">
                        <div class="logs-section">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Logs do Sistema</h3>
                                    <div class="logs-filters">
                                        <select id="filtro-tipo" class="form-control">
                                            <option value="">Todos os tipos</option>
                                            <option value="login">Login/Logout</option>
                                            <option value="create">Criação</option>
                                            <option value="update">Atualização</option>
                                            <option value="delete">Exclusão</option>
                                        </select>
                                        <input type="date" id="filtro-data" class="form-control">
                                        <button class="btn btn-secondary" id="filtrar-logs-btn">
                                            <i class="fas fa-filter"></i>
                                            Filtrar
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="logs-list" id="logs-list">
                                    <div class="loading">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        Carregando logs...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Usuário -->
            <div id="usuario-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">Novo Usuário</h3>
                        <span class="close" id="close-usuario-modal">&times;</span>
                    </div>
                    <form id="usuario-form">
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Nome Completo</label>
                                <input type="text" id="usuario-nome" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label>E-mail</label>
                                <input type="email" id="usuario-email" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Senha</label>
                                <input type="password" id="usuario-senha" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Telefone</label>
                                <input type="tel" id="usuario-telefone" class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label>Nível de Acesso</label>
                                <select id="usuario-role" class="form-control" required>
                                    <option value="">Selecione o nível</option>
                                    <option value="admin">Administrador (Acesso Total)</option>
                                    <option value="pastor">Pastor (Acesso de Liderança)</option>
                                    <option value="lider">Líder (Acesso Limitado)</option>
                                    <option value="membro">Membro (Apenas Consulta)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Permissões Específicas</label>
                                <div class="permissions-grid">
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="dashboard">
                                        <span>Dashboard</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="eventos">
                                        <span>Eventos</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="membros">
                                        <span>Membros</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="financeiro">
                                        <span>Financeiro</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="patrimonio">
                                        <span>Patrimônio</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="relatorios">
                                        <span>Relatórios</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="configuracoes">
                                        <span>Configurações</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelar-usuario">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Alterar Senha -->
            <div id="senha-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Alterar Senha</h3>
                        <span class="close" id="close-senha-modal">&times;</span>
                    </div>
                    <form id="senha-form">
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Senha Atual</label>
                                <input type="password" id="senha-atual" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Nova Senha</label>
                                <input type="password" id="nova-senha" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Confirmar Nova Senha</label>
                                <input type="password" id="confirmar-senha" class="form-control" required>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelar-senha">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-key"></i>
                                Alterar Senha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    initializePageScripts(pageName) {
        // Inicializar scripts específicos da página se necessário
        switch (pageName) {
            case 'dashboard':
                this.initDashboardScripts();
                break;
            // Adicionar outros casos conforme necessário
        }
    }

    initDashboardScripts() {
        // Scripts específicos do dashboard
        console.log('Dashboard carregado');
    }
}

// Adicionar estilos específicos das páginas
const pageStyles = document.createElement('style');
pageStyles.textContent = `
    /* Estilos do Dashboard */
    .welcome-section {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        border-radius: 15px;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .stat-card {
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        gap: 20px;
        transition: var(--transition);
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }
    
    .stat-icon {
        width: 60px;
        height: 60px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5em;
    }
    
    .stat-info h3 {
        font-size: 2em;
        color: var(--primary-color);
        margin-bottom: 5px;
    }
    
    .activities-list {
        space-y: 15px;
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .activity-item:last-child {
        border-bottom: none;
    }
    
    .activity-item i {
        color: var(--primary-color);
        font-size: 1.2em;
    }
    
    .time {
        color: var(--text-light);
        font-size: 0.9em;
    }
    
    /* Estilos das páginas */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .loading {
        text-align: center;
        padding: 50px;
        color: var(--text-light);
    }
    
    .error-page {
        text-align: center;
        padding: 50px;
    }
    
    .error-page i {
        font-size: 3em;
        color: #e74c3c;
        margin-bottom: 20px;
    }
    
    /* Tabelas */
    table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: var(--shadow);
    }
    
    th, td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }
    
    th {
        background: var(--primary-color);
        color: white;
        font-weight: 600;
    }
    
    .status {
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8em;
        font-weight: 600;
    }
    
    .status.active {
        background: #d4edda;
        color: #155724;
    }
    
    .btn-icon {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        border-radius: 5px;
        margin: 0 2px;
        transition: var(--transition);
    }
    
    .btn-icon:hover {
        background: var(--background-light);
    }
    
    /* Valores financeiros */
    .amount {
        font-size: 1.5em;
        font-weight: 700;
    }
    
    .amount.positive {
        color: #27ae60;
    }
    
    .amount.negative {
        color: #e74c3c;
    }
    
    /* Cards de eventos */
    .eventos-grid {
        display: grid;
        gap: 20px;
    }
    
    .evento-card {
        display: flex;
        align-items: center;
        gap: 20px;
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: var(--shadow);
    }
    
    .evento-date {
        text-align: center;
        background: var(--primary-color);
        color: white;
        padding: 15px;
        border-radius: 10px;
        min-width: 80px;
    }
    
    .evento-date .day {
        font-size: 1.5em;
        font-weight: 700;
        display: block;
    }
    
    /* Formulários */
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: var(--text-dark);
    }
    
    .form-control {
        width: 100%;
        padding: 12px;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-size: 16px;
        transition: var(--transition);
    }
    
    .form-control:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(144, 26, 29, 0.1);
    }

    /* Estilos das Abas */
    .tabs-navigation {
        display: flex;
        gap: 10px;
        margin-bottom: 30px;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 0;
    }

    .tab-btn {
        background: none;
        border: none;
        padding: 15px 25px;
        cursor: pointer;
        border-radius: 10px 10px 0 0;
        transition: var(--transition);
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        color: var(--text-light);
        border-bottom: 3px solid transparent;
    }

    .tab-btn:hover {
        background: var(--background-light);
        color: var(--text-dark);
    }

    .tab-btn.active {
        background: var(--primary-color);
        color: white;
        border-bottom-color: var(--accent-color);
    }

    .tab-panel {
        display: none;
    }

    .tab-panel.active {
        display: block;
        animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Estilos dos Modais */
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s ease;
    }

    .modal.show {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-content {
        background: white;
        border-radius: 15px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-hover);
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px;
        border-bottom: 1px solid var(--border-color);
        background: var(--primary-color);
        color: white;
        border-radius: 15px 15px 0 0;
    }

    .modal-header h3 {
        margin: 0;
    }

    .close {
        cursor: pointer;
        font-size: 24px;
        font-weight: bold;
        color: white;
        transition: var(--transition);
    }

    .close:hover {
        opacity: 0.7;
    }

    .modal-body {
        padding: 25px;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 20px 25px;
        border-top: 1px solid var(--border-color);
        background: var(--background-light);
        border-radius: 0 0 15px 15px;
    }

    /* Grid de Permissões */
    .permissions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 10px;
    }

    .permission-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        transition: var(--transition);
    }

    .permission-item:hover {
        background: var(--background-light);
        border-color: var(--primary-color);
    }

    .permission-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
    }

    /* Filtros de Logs */
    .logs-filters {
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
    }

    .logs-filters .form-control {
        width: auto;
        min-width: 150px;
    }

    /* Lista de Usuários */
    .usuarios-list table {
        margin-top: 20px;
    }

    .role-badge {
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: 600;
        text-transform: uppercase;
    }

    .role-badge.admin {
        background: #e74c3c;
        color: white;
    }

    .role-badge.pastor {
        background: #9b59b6;
        color: white;
    }

    .role-badge.lider {
        background: #3498db;
        color: white;
    }

    .role-badge.membro {
        background: #95a5a6;
        color: white;
    }

    /* Logs Timeline */
    .log-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        border-bottom: 1px solid var(--border-color);
        transition: var(--transition);
    }

    .log-item:hover {
        background: var(--background-light);
    }

    .log-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.1em;
    }

    .log-icon.login {
        background: #27ae60;
    }

    .log-icon.create {
        background: #3498db;
    }

    .log-icon.update {
        background: #f39c12;
    }

    .log-icon.delete {
        background: #e74c3c;
    }

    .log-details {
        flex: 1;
    }

    .log-action {
        font-weight: 600;
        color: var(--text-dark);
    }

    .log-description {
        color: var(--text-light);
        font-size: 0.9em;
        margin-top: 5px;
    }

    .log-time {
        color: var(--text-light);
        font-size: 0.8em;
    }
`;
document.head.appendChild(pageStyles);

// Inicializar aplicação
window.app = new IBV2App();