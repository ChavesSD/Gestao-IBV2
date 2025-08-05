# 🔧 IBV2 Backend API

Backend do Sistema de Gestão IBV2 desenvolvido com Node.js, Express e MongoDB.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação
- **helmet** - Segurança
- **cors** - Cross-Origin Resource Sharing

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Configure as variáveis de ambiente:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=sua_string_mongodb_atlas
JWT_SECRET=seu_jwt_secret_super_seguro
FRONTEND_URL=http://localhost:3000
```

## 🏃‍♂️ Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🗂️ Estrutura

```
backend/
├── middleware/       # Middlewares
│   ├── auth.js      # Autenticação JWT
│   └── errorHandler.js # Tratamento de erros
├── models/          # Modelos MongoDB
│   ├── User.js      # Usuários
│   ├── Membro.js    # Membros da igreja
│   └── Evento.js    # Eventos
├── routes/          # Rotas da API
│   ├── auth.js      # Autenticação
│   ├── membros.js   # Membros
│   ├── eventos.js   # Eventos
│   ├── financeiro.js # Financeiro
│   ├── patrimonio.js # Patrimônio
│   ├── relatorios.js # Relatórios
│   └── configuracoes.js # Configurações
├── utils/           # Utilitários
│   └── connectDB.js # Conexão MongoDB
├── uploads/         # Arquivos uploadados
└── server.js        # Servidor principal
```

## 🛣️ Rotas da API

### Autenticação (`/api/auth`)
- `POST /login` - Login do usuário
- `POST /register` - Registro de usuário
- `GET /me` - Dados do usuário autenticado
- `PUT /me` - Atualizar perfil
- `POST /change-password` - Alterar senha
- `POST /verify-token` - Verificar token

### Membros (`/api/membros`)
- `GET /` - Listar membros (com paginação e filtros)
- `GET /stats` - Estatísticas dos membros
- `GET /:id` - Obter membro por ID
- `POST /` - Criar novo membro *(Liderança)*
- `PUT /:id` - Atualizar membro *(Liderança)*
- `DELETE /:id` - Excluir membro *(Admin)*

### Eventos (`/api/eventos`)
- `GET /` - Listar eventos (com filtros)
- `GET /calendario` - Eventos para calendário
- `GET /:id` - Obter evento por ID
- `POST /` - Criar novo evento *(Liderança)*
- `PUT /:id` - Atualizar evento *(Liderança)*
- `DELETE /:id` - Excluir evento *(Liderança)*

## 🔐 Níveis de Acesso

### Roles de Usuário
- **admin** - Acesso total ao sistema
- **pastor** - Acesso de liderança
- **lider** - Acesso de liderança
- **membro** - Acesso básico

### Middlewares de Autorização
- `authMiddleware` - Requer autenticação
- `adminRequired` - Requer role admin
- `leadershipRequired` - Requer role admin, pastor ou lider

## 📊 Modelos de Dados

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'pastor', 'lider', 'membro'],
  status: ['ativo', 'inativo', 'suspenso'],
  phone: String,
  avatar: String,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### Membro
```javascript
{
  nome: String,
  sobrenome: String,
  email: String,
  telefone: String,
  dataNascimento: Date,
  genero: ['M', 'F', 'Outro'],
  estadoCivil: String,
  endereco: Object,
  cpf: String,
  batizado: Boolean,
  membro: Boolean,
  status: String,
  cargo: String,
  ministerios: Array,
  familiares: Array,
  responsavelCadastro: ObjectId
}
```

### Evento
```javascript
{
  titulo: String,
  descricao: String,
  tipo: String,
  categoria: String,
  dataInicio: Date,
  dataFim: Date,
  horaInicio: String,
  horaFim: String,
  local: Object,
  organizador: ObjectId,
  participantes: Array,
  status: String,
  publico: String
}
```

## 🛡️ Segurança

- Hash de senhas com bcrypt (12 rounds)
- Tokens JWT com expiração
- Rate limiting (100 req/15min)
- Validação de entrada de dados
- Headers de segurança com Helmet
- CORS configurado
- Bloqueio automático por tentativas inválidas

## 🚦 Health Check

- `GET /health` - Status da API e conexão com banco

Resposta:
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "IBV2 Backend MongoDB",
  "database": "Connected",
  "environment": "development"
}
```

## 🐛 Debug

Para debug, configure `NODE_ENV=development` e use:
```bash
npm run dev
```

Logs detalhados serão exibidos no console.

## 📈 Produção

Para produção:
1. Configure `NODE_ENV=production`
2. Use string de conexão segura do MongoDB
3. Configure JWT_SECRET forte
4. Configure CORS apenas para domínios permitidos
5. Configure logs adequados