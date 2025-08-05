const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware, adminRequired, leadershipRequired } = require('../middleware/auth');

const router = express.Router();

// Gerar JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public (temporário - depois será apenas admin)
router.post('/register', [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('role').optional().isIn(['admin', 'pastor', 'lider', 'membro']).withMessage('Papel inválido')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password, role = 'membro' } = req.body;

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Usuário já cadastrado com este e-mail'
            });
        }

        // Criar novo usuário
        const user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        // Gerar token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login do usuário
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // USUÁRIO PADRÃO PARA DEMONSTRAÇÃO
        if (email === 'admin@ibv2.com' && password === '123456') {
            const token = generateToken('demo-admin-id');
            
            return res.json({
                success: true,
                message: 'Login realizado com sucesso',
                token,
                user: {
                    id: 'demo-admin-id',
                    name: 'Administrador IBV2',
                    email: 'admin@ibv2.com',
                    role: 'admin',
                    status: 'ativo'
                }
            });
        }

        // Buscar usuário
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'E-mail ou senha inválidos'
            });
        }

        // Verificar se conta está bloqueada
        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Conta temporariamente bloqueada devido a muitas tentativas de login inválidas'
            });
        }

        // Verificar senha
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'E-mail ou senha inválidos'
            });
        }

        // Verificar status do usuário
        if (user.status !== 'ativo') {
            return res.status(401).json({
                success: false,
                message: 'Usuário inativo. Entre em contato com o administrador.'
            });
        }

        // Reset tentativas de login e atualizar último login
        await user.resetLoginAttempts();

        // Log do login
        const Log = require('../models/Log');
        await Log.createLog({
            type: 'login',
            action: 'Login realizado',
            description: `Usuário ${user.name} fez login no sistema`,
            user: user._id
        }, req);

        // Gerar token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Obter dados do usuário autenticado
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone,
                avatar: user.avatar,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   PUT /api/auth/me
// @desc    Atualizar dados do usuário autenticado
// @access  Private
router.put('/me', authMiddleware, [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, phone } = req.body;
        const updateData = {};
        
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Alterar senha do usuário
// @access  Private
router.post('/change-password', authMiddleware, [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        // Verificar senha atual
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        // Atualizar senha
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   POST /api/auth/verify-token
// @desc    Verificar se token é válido
// @access  Private
router.post('/verify-token', authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// @route   GET /api/auth/users
// @desc    Listar todos os usuários
// @access  Private (Leadership)
router.get('/users', [authMiddleware, leadershipRequired], async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ name: 1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   PUT /api/auth/users/:id
// @desc    Atualizar usuário
// @access  Private (Admin)
router.put('/users/:id', [authMiddleware, adminRequired], [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('role').optional().isIn(['admin', 'pastor', 'lider', 'membro']).withMessage('Papel inválido'),
    body('status').optional().isIn(['ativo', 'inativo', 'suspenso']).withMessage('Status inválido')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Log da ação
        const Log = require('../models/Log');
        await Log.createLog({
            type: 'update',
            action: 'Usuário atualizado',
            description: `Usuário ${user.name} foi atualizado`,
            user: req.user._id,
            resourceType: 'user',
            resourceId: user._id
        }, req);

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            user
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Excluir usuário
// @access  Private (Admin)
router.delete('/users/:id', [authMiddleware, adminRequired], async (req, res) => {
    try {
        // Não permitir exclusão do próprio usuário
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Você não pode excluir sua própria conta'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Log da ação
        const Log = require('../models/Log');
        await Log.createLog({
            type: 'delete',
            action: 'Usuário excluído',
            description: `Usuário ${user.name} foi excluído do sistema`,
            user: req.user._id,
            resourceType: 'user',
            resourceId: user._id
        }, req);

        res.json({
            success: true,
            message: 'Usuário excluído com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Alterar senha do usuário logado
// @access  Private
router.post('/change-password', [authMiddleware], [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        // Verificar senha atual
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        // Atualizar senha
        user.password = newPassword;
        await user.save();

        // Log da ação
        const Log = require('../models/Log');
        await Log.createLog({
            type: 'update',
            action: 'Senha alterada',
            description: 'Usuário alterou sua senha',
            user: req.user._id,
            resourceType: 'user',
            resourceId: user._id
        }, req);

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;