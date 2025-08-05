const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const membrosRoutes = require('./routes/membros');
const eventosRoutes = require('./routes/eventos');
const financeiroRoutes = require('./routes/financeiro');
const patrimonioRoutes = require('./routes/patrimonio');
const relatoriosRoutes = require('./routes/relatorios');
const configuracoesRoutes = require('./routes/configuracoes');
const logsRoutes = require('./routes/logs');

// Importar middlewares
const errorHandler = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// CONEXÃO COM MONGODB ATLAS
// ========================================
const connectDB = require('./utils/connectDB');
connectDB();

// ========================================
// MIDDLEWARES DE SEGURANÇA
// ========================================
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100,
    message: {
        error: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
});
app.use('/api/', limiter);

// ========================================
// MIDDLEWARES DE PARSING
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir arquivos do frontend
app.use(express.static(path.join(__dirname, '..')));

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'IBV2 Backend MongoDB',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        environment: process.env.NODE_ENV
    });
});

// ========================================
// ROTAS DA API
// ========================================
// Rotas públicas (não precisam de autenticação)
app.use('/api/auth', authRoutes);

// Rotas protegidas (precisam de autenticação)
app.use('/api/membros', authMiddleware, membrosRoutes);
app.use('/api/eventos', authMiddleware, eventosRoutes);
app.use('/api/financeiro', authMiddleware, financeiroRoutes);
app.use('/api/patrimonio', authMiddleware, patrimonioRoutes);
app.use('/api/relatorios', authMiddleware, relatoriosRoutes);
app.use('/api/configuracoes', authMiddleware, configuracoesRoutes);
app.use('/api/logs', authMiddleware, logsRoutes);

// ========================================
// MIDDLEWARE DE ERRO
// ========================================
app.use(errorHandler);

// ========================================
// SERVIR FRONTEND PARA ROTAS NÃO-API
// ========================================
app.get('*', (req, res) => {
    // Se for rota da API, retornar 404 JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            error: 'Rota da API não encontrada',
            path: req.originalUrl
        });
    }
    
    // Para todas as outras rotas, servir o index.html (SPA)
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor IBV2 MongoDB rodando na porta ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Finalizando servidor...');
    server.close(() => {
        mongoose.connection.close();
        console.log('✅ Servidor finalizado');
        process.exit(0);
    });
});

module.exports = app;