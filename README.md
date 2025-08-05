# 🏛️ Sistema de Gestão IBV2

Sistema completo de gestão para Igreja Batista Vida 2, desenvolvido com tecnologias modernas para gerenciamento eficiente de membros, eventos, finanças e patrimônio.

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Sistema de login seguro com JWT
- Diferentes níveis de acesso (Admin, Pastor, Líder, Membro)
- Bloqueio automático por tentativas inválidas

### 👥 Gestão de Membros
- Cadastro completo de membros
- Histórico de batismo e membresia
- Controle de ministérios e cargos
- Upload de documentos e fotos

### 📅 Gestão de Eventos
- Criação e gerenciamento de eventos
- Sistema de inscrições
- Controle de participantes
- Calendário integrado

### 💰 Gestão Financeira
- Controle de receitas e despesas
- Relatórios financeiros
- Histórico de transações

### 🏢 Gestão de Patrimônio
- Cadastro de bens da igreja
- Controle de manutenções
- Depreciação automática

### 📊 Relatórios
- Estatísticas de membros
- Relatórios de eventos
- Análises financeiras
- Exportação em PDF/Excel

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização moderna
- **JavaScript ES6+** - Interatividade
- **SPA (Single Page Application)** - Navegação fluida
- **Font Awesome** - Ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

### Infraestrutura
- **MongoDB Atlas** - Banco de dados na nuvem
- **Railway** - Deploy e hospedagem
- **GitHub** - Controle de versão

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (v14 ou superior)
- Conta no MongoDB Atlas
- Git

### 1. Clonar o Repositório
```bash
git clone https://github.com/ChavesSD/Gestao-IBV2.git
cd Gestao-IBV2
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- `MONGODB_URI`: String de conexão do MongoDB Atlas
- `JWT_SECRET`: Chave secreta para JWT
- `FRONTEND_URL`: URL do frontend

### 4. Iniciar o Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 5. Acessar o Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📁 Estrutura do Projeto

```
Gestao-IBV2/
├── backend/                 # Servidor Node.js
│   ├── middleware/         # Middlewares (auth, validation, etc.)
│   ├── models/            # Modelos MongoDB (User, Membro, Evento)
│   ├── routes/            # Rotas da API
│   ├── utils/             # Utilitários
│   ├── uploads/           # Arquivos uploadados
│   ├── server.js          # Servidor principal
│   └── package.json       # Dependências do backend
├── css/                   # Estilos CSS
├── js/                    # Scripts JavaScript
├── index.html             # Página principal
├── Logo IBV2.png          # Logo principal
├── Logo2.png             # Logo alternativo
└── README.md             # Este arquivo
```

## 🔑 Credenciais Padrão

**Usuário Demonstração:**
- Email: `admin@ibv2.com`
- Senha: `123456`

> ⚠️ **Importante**: Altere essas credenciais em produção!

## 🌐 Deploy

### Railway
1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente
3. O deploy será automático

### Configurações de Produção
- Configure `NODE_ENV=production`
- Use URLs HTTPS
- Configure domínio personalizado
- Configure backup do MongoDB

## 🛡️ Segurança

- Autenticação JWT com expiração
- Hash de senhas com bcrypt
- Rate limiting para APIs
- Validação de entrada de dados
- Headers de segurança com Helmet
- CORS configurado

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Perfil do usuário

### Membros
- `GET /api/membros` - Listar membros
- `POST /api/membros` - Criar membro
- `PUT /api/membros/:id` - Atualizar membro
- `DELETE /api/membros/:id` - Excluir membro

### Eventos
- `GET /api/eventos` - Listar eventos
- `POST /api/eventos` - Criar evento
- `PUT /api/eventos/:id` - Atualizar evento
- `DELETE /api/eventos/:id` - Excluir evento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@ibv2.com
- Telefone: (XX) XXXX-XXXX

## 🔄 Atualizações

Veja o [CHANGELOG.md](CHANGELOG.md) para histórico de versões e atualizações.

---

**Desenvolvido com ❤️ para a Igreja Batista Vida 2**