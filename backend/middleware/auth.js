const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Acesso negado. Token não fornecido.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                error: 'Token inválido. Usuário não encontrado.'
            });
        }

        if (user.status !== 'ativo') {
            return res.status(401).json({
                error: 'Usuário inativo. Entre em contato com o administrador.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado. Faça login novamente.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido.'
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
};

// Middleware para verificar permissões de administrador
const adminRequired = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Acesso negado. Privilégios de administrador necessários.'
        });
    }
    next();
};

// Middleware para verificar permissões de liderança (pastor, admin)
const leadershipRequired = async (req, res, next) => {
    if (!['admin', 'pastor', 'lider'].includes(req.user.role)) {
        return res.status(403).json({
            error: 'Acesso negado. Privilégios de liderança necessários.'
        });
    }
    next();
};

// Middleware para verificar se o usuário pode acessar o recurso
const ownerOrAdminRequired = (resourceUserField = 'userId') => {
    return async (req, res, next) => {
        const resourceId = req.params.id;
        
        // Admin pode acessar qualquer recurso
        if (req.user.role === 'admin') {
            return next();
        }

        try {
            // Buscar o recurso para verificar o proprietário
            const Model = req.baseUrl.includes('membros') ? require('../models/Membro') :
                         req.baseUrl.includes('eventos') ? require('../models/Evento') :
                         req.baseUrl.includes('financeiro') ? require('../models/Transacao') :
                         null;

            if (!Model) {
                return res.status(500).json({
                    error: 'Modelo não encontrado para verificação de permissão.'
                });
            }

            const resource = await Model.findById(resourceId);
            
            if (!resource) {
                return res.status(404).json({
                    error: 'Recurso não encontrado.'
                });
            }

            // Verificar se o usuário é o proprietário do recurso
            if (resource[resourceUserField].toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    error: 'Acesso negado. Você não tem permissão para acessar este recurso.'
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao verificar permissões.'
            });
        }
    };
};

module.exports = {
    authMiddleware,
    adminRequired,
    leadershipRequired,
    ownerOrAdminRequired
};