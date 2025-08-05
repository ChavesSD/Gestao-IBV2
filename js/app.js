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
                
                <div class="settings-sections">
                    <div class="card">
                        <div class="card-header">
                            <h3>Configurações Gerais</h3>
                        </div>
                        <div class="settings-form" id="settings-form">
                            <div class="form-group">
                                <label>Nome da Igreja</label>
                                <input type="text" id="nome-igreja" placeholder="Nome da igreja" class="form-control">
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
                                Alterar Senha
                            </button>
                        </div>
                    </div>
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
`;
document.head.appendChild(pageStyles);

// Inicializar aplicação
window.app = new IBV2App();