const express = require('express');
const { body, validationResult } = require('express-validator');
const Configuracao = require('../models/Configuracao');
const Log = require('../models/Log');
const User = require('../models/User');
const { authMiddleware, adminRequired, leadershipRequired } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/configuracoes
// @desc    Obter configurações da igreja
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const config = await Configuracao.getConfig();
        
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Erro ao obter configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   PUT /api/configuracoes
// @desc    Atualizar configurações da igreja
// @access  Private (Leadership)
router.put('/', [authMiddleware, leadershipRequired], [
    body('nomeIgreja').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Nome da igreja deve ter entre 2 e 200 caracteres'),
    body('telefone').optional().trim().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
    body('email').optional().isEmail().withMessage('E-mail inválido')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const oldConfig = await Configuracao.getConfig();
        const config = await Configuracao.updateConfig(req.body, req.user._id);

        // Log da ação
        await Log.createLog({
            type: 'update',
            action: 'Configurações atualizadas',
            description: 'Configurações da igreja foram atualizadas',
            user: req.user._id,
            resourceType: 'configuracao',
            resourceId: config._id,
            oldData: oldConfig.toObject(),
            newData: config.toObject()
        }, req);

        res.json({
            success: true,
            message: 'Configurações atualizadas com sucesso',
            data: config
        });
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   GET /api/configuracoes/backup
// @desc    Gerar backup dos dados
// @access  Private (Admin)
router.get('/backup', [authMiddleware, adminRequired], async (req, res) => {
    try {
        const User = require('../models/User');
        const Membro = require('../models/Membro');
        const Evento = require('../models/Evento');
        
        const backup = {
            metadata: {
                version: '1.0.0',
                created: new Date(),
                creator: req.user.name
            },
            configuracoes: await Configuracao.find(),
            usuarios: await User.find().select('-password'),
            membros: await Membro.find(),
            eventos: await Evento.find(),
            logs: await Log.find().limit(1000).sort({ createdAt: -1 })
        };

        // Log da ação
        await Log.createLog({
            type: 'create',
            action: 'Backup gerado',
            description: 'Backup completo dos dados foi gerado',
            user: req.user._id,
            resourceType: 'configuracao'
        }, req);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=backup-ibv2-${new Date().toISOString().split('T')[0]}.json`);
        res.json(backup);
    } catch (error) {
        console.error('Erro ao gerar backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;